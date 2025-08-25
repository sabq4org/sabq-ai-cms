import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { retryWithConnection, ensureDbConnected } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 24);

    const now = new Date();

    await ensureDbConnected();
    const featured = await retryWithConnection(async () =>
      await prisma.articles.findMany({
        where: {
          status: "published",
          OR: [
            { featured: true },
            { breaking: true },
          ],
          AND: [
            {
              OR: [
                { published_at: { lte: now } },
                { published_at: null },
              ],
            },
          ],
        },
        orderBy: [
          { breaking: "desc" },
          { featured: "desc" },
          { published_at: "desc" },
          { views: "desc" }
        ],
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          views: true,
          breaking: true,
          categories: { select: { id: true, name: true, slug: true, color: true } },
        },
      })
    );

    const res = NextResponse.json({ ok: true, data: featured, count: featured.length });
    res.headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    res.headers.set("CDN-Cache-Control", "max-age=60");
    res.headers.set("Vercel-CDN-Cache-Control", "max-age=60");
    return res;
  } catch (error: any) {
    console.error("❌ [featured] خطأ في جلب المقالات المميزة:", error);
    return NextResponse.json({ ok: true, data: [], fallback: true }, { status: 200 });
  }
}


