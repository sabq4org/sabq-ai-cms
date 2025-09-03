import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { retryWithConnection, ensureDbConnected } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);

    const now = new Date();

    await ensureDbConnected();
    const articles = await retryWithConnection(async () =>
      await prisma.articles.findMany({
        where: {
          status: "published",
          OR: [
            { published_at: { lte: now } },
            { published_at: null },
          ],
        },
        orderBy: { published_at: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          featured_image: true,
          published_at: true,
          categories: { select: { id: true, name: true, slug: true, color: true } },
          author: { select: { id: true, name: true, avatar: true } },
        },
      })
    );

    const response = NextResponse.json({ ok: true, data: articles, count: articles.length });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error: any) {
    console.error("❌ [latest] خطأ في جلب آخر المقالات:", error);
    return NextResponse.json({ ok: true, data: [], fallback: true }, { status: 200 });
  }
}


