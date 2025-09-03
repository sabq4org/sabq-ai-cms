import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma";

export const runtime = "nodejs";

// كاش بالذاكرة لمدة قصيرة لتسريع الاستجابة
const memoryCache = new Map<string, { ts: number; data: any }>();
const TTL_MS = 60 * 1000; // 60 ثانية

function buildCacheKey(limit: number, categoryId?: string | null) {
  return `v1|limit:${limit}|category:${categoryId || "all"}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const categoryId = searchParams.get("category_id");

    const key = buildCacheKey(limit, categoryId);
    const cached = memoryCache.get(key);
    if (cached && Date.now() - cached.ts < TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    await ensureDbConnected();

    const where: any = {
      status: "published",
      article_type: { notIn: ["opinion", "analysis", "interview"] },
    };
    if (categoryId && categoryId !== "all") {
      where.category_id = categoryId;
    }

    const articles = await retryWithConnection(async () =>
      prisma.articles.findMany({
        where,
        take: limit,
        orderBy: { published_at: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          published_at: true,
          views: true,
          reading_time: true,
          breaking: true,
          featured: true,
          metadata: true,
          categories: { select: { id: true, name: true, slug: true } },
        },
      })
    );

    const payload = {
      success: true,
      articles: articles.map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        image: a.featured_image,
        category: a.categories,
        published_at: a.published_at,
        views: a.views || 0,
        readTime: a.reading_time || null,
        breaking: a.breaking,
        featured: a.featured,
        metadata: a.metadata,
      })),
    };

    memoryCache.set(key, { ts: Date.now(), data: payload });

    return NextResponse.json(payload, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("/api/smart-content/fast error:", (error as any)?.message);
    return NextResponse.json(
      { success: false, articles: [], error: "failed" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}


