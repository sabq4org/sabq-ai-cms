import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/app/lib/auth";
import getRedisClient from "@/lib/redis-client";
import { deleteKeysByPattern } from "@/lib/redis-helpers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const { articleId, like, requestId } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    // تحقق من وجود المقال
    const article = await prisma.articles.findUnique({ where: { id: articleId }, select: { id: true, likes: true, saves: true } });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Idempotency عبر Redis (اختياري)
    const redis = getRedisClient();
    const hasRedis = !!redis;
    const idemKey = requestId ? `idem:like:${user.id}:${articleId}:${requestId}` : null;
    const respKey = requestId ? `idem:like:resp:${user.id}:${articleId}:${requestId}` : null;

    if (hasRedis && requestId && idemKey && respKey) {
      try {
        const setRes = await (redis as any).set(idemKey, "1", "EX", 300, "NX");
        if (!setRes) {
          // طلب مكرر: حاول إعادة النتيجة المخزنة
          const cached = await (redis as any).get(respKey);
          if (cached) {
            return NextResponse.json(JSON.parse(cached));
          }
          // بدون كاش: أعِد الحالة الحالية بسرعة
          const [exists, current] = await Promise.all([
            prisma.interactions.findUnique({ where: { user_id_article_id_type: { user_id: user.id, article_id: articleId, type: "like" as const } } }),
            prisma.articles.findUnique({ where: { id: articleId }, select: { likes: true, saves: true } }),
          ]);
          return NextResponse.json({ liked: !!exists, likes: current?.likes || 0, saves: current?.saves || 0 });
        }
      } catch {}
    }

    // نفّذ العملية داخل معاملة للحفاظ على الاتساق
    const result = await prisma.$transaction(async (tx) => {
      const uniqueKey = { user_id: user.id, article_id: articleId, type: "like" as const };

      // التحقق من الحالة الحالية
      const existing = await tx.interactions.findUnique({
        where: { user_id_article_id_type: uniqueKey },
      });

      // إذا طلب العميل like=true نضمن وجود السجل، وإذا false نضمن عدم وجوده
      if (like) {
        if (!existing) {
          await tx.interactions.create({
            data: {
              id: `like_${user.id}_${articleId}_${Date.now()}`,
              user_id: user.id,
              article_id: articleId,
              type: "like",
            },
          });
          await tx.articles.update({ where: { id: articleId }, data: { likes: { increment: 1 } } });
        }
      } else {
        if (existing) {
          await tx.interactions.delete({ where: { id: existing.id } });
          await tx.articles.update({ where: { id: articleId }, data: { likes: { decrement: 1 } } });
          // ضمان عدم السالب
          await tx.articles.updateMany({ where: { id: articleId, likes: { lt: 0 } as any }, data: { likes: 0 } });
        }
      }

      const updated = await tx.articles.findUnique({ where: { id: articleId }, select: { likes: true, saves: true } });
      return { likes: updated?.likes || 0, saves: updated?.saves || 0 };
    });

    if (redis) {
      // لا تجعل مسح الكاش حاجزًا لوقت الاستجابة
      deleteKeysByPattern(redis, `user:feed:${user.id}:*`).catch(() => {});
      // خزن الاستجابة لطلبات idempotent المكررة
      if (respKey) {
        try {
          await (redis as any).set(respKey, JSON.stringify({ liked: !!like, ...result }), "EX", 300);
        } catch {}
      }
    }

    return NextResponse.json({ liked: !!like, ...result });
  } catch (e: any) {
    const message = String(e?.message || e || "");
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("/api/interactions/like error:", e);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}


