import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  if (!slug) {
    return NextResponse.json({ type: null }, { status: 400 });
  }
  try {
    const art = await prisma.articles.findFirst({
      where: { slug },
      select: { article_type: true, content_type: true },
    });
    if (!art) return NextResponse.json({ type: null }, { status: 200 });
    const type = (art as any).content_type
      ? (art as any).content_type
      : ((art as any).article_type === "news" ? "NEWS" : "OPINION");
    return NextResponse.json({ type });
  } catch (e) {
    return NextResponse.json({ type: null }, { status: 200 });
  }
}


