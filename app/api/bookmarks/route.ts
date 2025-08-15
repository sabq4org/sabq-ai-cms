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
      await prisma.UserInteractions.upsert({
        where: { uniq_user_article_type: { user_id: user.id, article_id: articleId, interaction_type: "save" } as any },
        update: {},
        create: { user_id: user.id, article_id: articleId, interaction_type: "save" }
      });
    } else {
      await prisma.UserInteractions.deleteMany({ where: { user_id: user.id, article_id: articleId, interaction_type: "save" } });
    }

    await prisma.$disconnect();
    return NextResponse.json({ saved: !!saved });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
