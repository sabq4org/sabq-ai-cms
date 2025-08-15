import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import getRedisClient from "@/lib/redis-client";
import { deleteKeysByPattern } from "@/lib/redis-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const { articleId, like } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    if (like) {
      await prisma.$transaction([
        prisma.UserInteractions.upsert({
          where: { uniq_user_article_type: { user_id: user.id, article_id: articleId, interaction_type: "like" } as any },
          update: {},
          create: { user_id: user.id, article_id: articleId, interaction_type: "like", points_earned: 0 },
        }),
        prisma.articles.update({ where: { id: articleId }, data: { likes: { increment: 1 } } })
      ]);
    } else {
      await prisma.$transaction([
        prisma.UserInteractions.deleteMany({ where: { user_id: user.id, article_id: articleId, interaction_type: "like" } }),
        prisma.articles.update({ where: { id: articleId }, data: { likes: { decrement: 1 } } })
      ]);
      // ضمان عدم السالب
      await prisma.articles.updateMany({ where: { id: articleId, likes: { lt: 0 } as any }, data: { likes: 0 } });
    }

    const updated = await prisma.articles.findUnique({ where: { id: articleId }, select: { likes: true, saves: true } });

    const redis = getRedisClient();
    if (redis) {
      await deleteKeysByPattern(redis, `user:feed:${user.id}:*`);
    }

    await prisma.$disconnect();
    return NextResponse.json({ liked: !!like, likes: updated?.likes || 0, saves: updated?.saves || 0 });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


