import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma";
import { cache, CACHE_TTL } from "@/lib/redis";

export const runtime = "nodejs";

// كاش بالذاكرة لمدة قصيرة جداً للطلبات المتزامنة
const memoryCache = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 5 * 1000; // 5 ثواني فقط للطلبات المتزامنة

function buildCacheKey(limit: number, categoryId?: string | null, excludeId?: string | null) {
  return `smart-content:v2|limit:${limit}|category:${categoryId || "all"}|exclude:${excludeId || "none"}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const categoryId = searchParams.get("category_id");
    const excludeId = searchParams.get("exclude");

    const key = buildCacheKey(limit, categoryId, excludeId);
    
    // 1. تحقق من كاش الذاكرة أولاً (للطلبات المتزامنة)
    const memCached = memoryCache.get(key);
    if (memCached && Date.now() - memCached.ts < MEM_TTL) {
      return NextResponse.json(memCached.data, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
          "X-Cache": "MEMORY",
        },
      });
    }
    
    // 2. تحقق من Redis
    try {
      const redisCached = await cache.get(key);
      if (redisCached) {
        // حفظ في الذاكرة للطلبات المتزامنة
        memoryCache.set(key, { ts: Date.now(), data: redisCached });
        return NextResponse.json(redisCached, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
            "X-Cache": "REDIS",
          },
        });
      }
    } catch (redisError) {
      console.warn("Redis cache error:", redisError);
    }

    await ensureDbConnected();

    const where: any = {
      status: "published",
      article_type: { notIn: ["opinion", "analysis", "interview"] },
    };
    if (categoryId && categoryId !== "all") {
      where.category_id = categoryId;
    }
    if (excludeId) {
      where.id = { not: excludeId };
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
          // إزالة metadata لتقليل الحمولة
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
      })),
    };

    // حفظ في Redis لمدة 5 دقائق
    try {
      await cache.set(key, payload, CACHE_TTL.ARTICLES);
    } catch (redisError) {
      console.warn("Failed to save to Redis:", redisError);
    }
    
    // حفظ في الذاكرة للطلبات المتزامنة
    memoryCache.set(key, { ts: Date.now(), data: payload });

    return NextResponse.json(payload, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
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


