import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  if (!slug) {
    return NextResponse.json({ type: null }, { status: 400 });
  }
  try {
    // محاولة أولى: قراءة content_type إن كان العمود موجوداً
    try {
      const art = await prisma.articles.findFirst({
        where: { slug },
        select: { content_type: true, article_type: true },
      });
      if (!art) return NextResponse.json({ type: null }, { status: 200 });
      const t = (art as any).content_type
        ? (art as any).content_type
        : ((art as any).article_type === "news" ? "NEWS" : "OPINION");
      return NextResponse.json({ type: t });
    } catch {
      // توافق خلفي قبل الهجرة: الاعتماد على article_type فقط
      const art = await prisma.articles.findFirst({
        where: { slug },
        select: { article_type: true },
      });
      if (!art) return NextResponse.json({ type: null }, { status: 200 });
      const t = (art as any).article_type === "news" ? "NEWS" : "OPINION";
      return NextResponse.json({ type: t });
    }
  } catch (e) {
    return NextResponse.json({ type: null }, { status: 200 });
  }
}


