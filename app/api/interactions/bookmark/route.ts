import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import getRedisClient from "@/lib/redis-client";
import { deleteKeysByPattern } from "@/lib/redis-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const { articleId, saved } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    if (saved) {
      // إضافة حفظ
      await prisma.$transaction([
        prisma.UserInteractions.upsert({
          where: { 
            uniq_user_article_type: { 
              user_id: user.id, 
              article_id: articleId, 
              interaction_type: "save" 
            } as any 
          },
          update: {},
          create: { 
            user_id: user.id, 
            article_id: articleId, 
            interaction_type: "save", 
            points_earned: 2 
          },
        }),
        prisma.articles.update({ 
          where: { id: articleId }, 
          data: { saves: { increment: 1 } } 
        })
      ]);
    } else {
      // إلغاء حفظ
      await prisma.$transaction([
        prisma.UserInteractions.deleteMany({ 
          where: { 
            user_id: user.id, 
            article_id: articleId, 
            interaction_type: "save" 
          } 
        }),
        prisma.articles.update({ 
          where: { id: articleId }, 
          data: { saves: { decrement: 1 } } 
        })
      ]);
      
      // ضمان عدم السالب
      await prisma.articles.updateMany({ 
        where: { id: articleId, saves: { lt: 0 } as any }, 
        data: { saves: 0 } 
      });
    }

    const updated = await prisma.articles.findUnique({ 
      where: { id: articleId }, 
      select: { likes: true, saves: true } 
    });

    // مسح الكاش
    const redis = getRedisClient();
    if (redis) {
      await deleteKeysByPattern(redis, `user:feed:${user.id}:*`);
    }

    await prisma.$disconnect();
    return NextResponse.json({ 
      saved: !!saved, 
      saves: updated?.saves || 0, 
      likes: updated?.likes || 0 
    });

  } catch (e: any) {
    console.error('Bookmark API Error:', e);
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to process bookmark" }, { status: 500 });
  }
}
