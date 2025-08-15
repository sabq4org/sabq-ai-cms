import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";

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
      await prisma.$transaction([
        prisma.UserInteractions.upsert({
          where: { uniq_user_article_type: { user_id: user.id, article_id: articleId, interaction_type: "save" } as any },
          update: {},
          create: { user_id: user.id, article_id: articleId, interaction_type: "save" }
        }),
        prisma.articles.update({ where: { id: articleId }, data: { saves: { increment: 1 } } })
      ]);
    } else {
      await prisma.$transaction([
        prisma.UserInteractions.deleteMany({ where: { user_id: user.id, article_id: articleId, interaction_type: "save" } }),
        prisma.articles.update({ where: { id: articleId }, data: { saves: { decrement: 1 } } })
      ]);
      await prisma.articles.updateMany({ where: { id: articleId, saves: { lt: 0 } as any }, data: { saves: 0 } });
    }

    const updated = await prisma.articles.findUnique({ where: { id: articleId }, select: { likes: true, saves: true } });

    await prisma.$disconnect();
    return NextResponse.json({ saved: !!saved, likes: updated?.likes || 0, saves: updated?.saves || 0 });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
