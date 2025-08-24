import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/app/lib/auth";
import { getRedisClient } from "@/lib/redis-client";
import { deleteKeysByPattern } from "@/lib/redis-helpers";
import prisma from "@/lib/prisma";

async function awardLoyaltyPoints(userId: string, articleId: string, points: number, action: string) {
  if (points <= 0) return 0;
  await prisma.loyalty_points.create({
    data: {
      id: `lp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: userId,
      points,
      action,
      reference_id: articleId,
      reference_type: 'article',
      metadata: { source: 'interactions/like', timestamp: new Date().toISOString() },
      created_at: new Date(),
    },
  });
  return points;
}

async function getTotalPoints(userId: string) {
  const agg = await prisma.loyalty_points.aggregate({ where: { user_id: userId }, _sum: { points: true } });
  return agg._sum.points || 0;
}

function getLevel(totalPoints: number) {
  if (totalPoints >= 2000) return 'بلاتيني';
  if (totalPoints >= 500) return 'ذهبي';
  if (totalPoints >= 100) return 'فضي';
  return 'برونزي';
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const { articleId, like } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    // تحقق من وجود المقال
    const article = await prisma.articles.findUnique({ where: { id: articleId }, select: { id: true, likes: true, saves: true } });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // لم نعد نحتاج idempotency من جانب العميل
    // Prisma transactions ستتعامل مع التزامن
    const redis = getRedisClient();

    // نفّذ العملية داخل معاملة للحفاظ على الاتساق
    const result = await prisma.$transaction(async (tx) => {
      const uniqueKey = { user_id: user.id, article_id: articleId, type: "like" as const };

      // التحقق من الحالة الحالية
      const existing = await tx.interactions.findUnique({
        where: { user_id_article_id_type: uniqueKey },
      });

      let didChange = false;

      // إذا طلب العميل like=true نضمن وجود السجل، وإذا false نضمن عدم وجوده
      if (like) {
        if (!existing) {
          try {
            await tx.interactions.create({
              data: {
                id: `like_${user.id}_${articleId}_${Date.now()}`,
                user_id: user.id,
                article_id: articleId,
                type: "like",
              },
            });
            didChange = true;
          } catch (err: any) {
            // في حال سباق إنشاء متزامن: تجاهل خطأ القيود الفريدة
            if (!(err && err.code === "P2002")) {
              throw err;
            }
          }
          if (didChange) {
            await tx.articles.update({ where: { id: articleId }, data: { likes: { increment: 1 } } });
          }
        }
      } else {
        if (existing) {
          try {
            await tx.interactions.delete({ where: { id: existing.id } });
            didChange = true;
          } catch (err: any) {
            // إذا كان قد حُذف بالفعل بسبب سباق، تجاهل
            if (!(err && (err.code === "P2025" || String(err.message || "").includes("Record to delete does not exist")))) {
              throw err;
            }
          }
          if (didChange) {
            await tx.articles.update({ where: { id: articleId }, data: { likes: { decrement: 1 } } });
            // ضمان عدم السالب
            await tx.articles.updateMany({ where: { id: articleId, likes: { lt: 0 } as any }, data: { likes: 0 } });
          }
        }
      }

      const updated = await tx.articles.findUnique({ where: { id: articleId }, select: { likes: true, saves: true } });
      return { likes: updated?.likes || 0, saves: updated?.saves || 0 };
    });

    if (redis) {
      // لا تجعل مسح الكاش حاجزًا لوقت الاستجابة
      deleteKeysByPattern(redis, `user:feed:${user.id}:*`).catch(() => {});
    }

    // منح نقاط عند إضافة إعجاب فقط (وليس عند الإزالة)
    let pointsAwarded = 0;
    let likedStatusChanged = false;
    
    // نتحقق من result للتأكد من أن الحالة تغيرت فعلاً
    const existingLikesCount = article.likes;
    const newLikesCount = result.likes;
    likedStatusChanged = existingLikesCount !== newLikesCount;
    
    if (like && likedStatusChanged) {
      // منح النقاط بشكل غير متزامن لتسريع الاستجابة
      setImmediate(async () => {
        try {
          await awardLoyaltyPoints(user.id, articleId, 1, 'like');
        } catch (error) {
          console.error('Error awarding points:', error);
        }
      });
      pointsAwarded = 1; // نعيد القيمة المتوقعة فوراً
    }

    // نعيد النقاط الحالية من الذاكرة المؤقتة أو قاعدة البيانات
    const totalPoints = await getTotalPoints(user.id);
    const level = getLevel(totalPoints);

    return NextResponse.json({ 
      liked: !!like, 
      ...result, 
      pointsAwarded, 
      totalPoints: totalPoints + pointsAwarded, // نضيف النقاط الجديدة للعرض الفوري
      level, 
      success: true 
    });
  } catch (e: any) {
    const message = String(e?.message || e || "");
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // تسجيل مفصل للخطأ
    console.error("/api/interactions/like error:", {
      error: e,
      message: e?.message,
      code: e?.code,
      stack: e?.stack
    });
    
    return NextResponse.json({ 
      error: "Failed to toggle like", 
      details: message,
      success: false 
    }, { status: 500 });
  }
}


