import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const { articleId, saved } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    if (saved) {
      // التحقق إذا كان المستخدم قد حفظ المقال مسبقاً
      const existingSave = await prisma.userInteractions.findFirst({
        where: { user_id: user.id, article_id: articleId, interaction_type: "save" }
      });

      if (!existingSave) {
        await prisma.$transaction([
          prisma.userInteractions.create({ 
            data: { 
              id: `save_${user.id}_${articleId}_${Date.now()}`,
              user_id: user.id, 
              article_id: articleId, 
              interaction_type: "save" 
            } 
          }),
          prisma.articles.update({ where: { id: articleId }, data: { saves: { increment: 1 } } })
        ]);
      }
    } else {
      await prisma.$transaction([
        prisma.userInteractions.deleteMany({ where: { user_id: user.id, article_id: articleId, interaction_type: "save" } }),
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
