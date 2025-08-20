import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-helper";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 24);

    const now = new Date();

    const featured = await withRetry(async () =>
      prisma.articles.findMany({
        where: {
          status: "published",
          featured: true,
          OR: [
            { published_at: { lte: now } },
            { published_at: null },
          ],
        },
        orderBy: [{ published_at: "desc" }, { views: "desc" }],
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          published_at: true,
          views: true,
          categories: { select: { id: true, name: true, slug: true, color: true } },
        },
      })
    );

    return NextResponse.json({ ok: true, data: featured, count: featured.length });
  } catch (error: any) {
    console.error("❌ [featured] خطأ في جلب المقالات المميزة:", error);
    return NextResponse.json({ ok: true, data: [], fallback: true }, { status: 200 });
  }
}


