import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cache as redisCache, CACHE_TTL } from "@/lib/redis";

export const runtime = "nodejs";

// كاش في الذاكرة
const memCache = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 5 * 60 * 1000; // 5 دقائق

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 12);
    
    const cacheKey = `related:${slug}:${limit}`;
    
    // 1. كاش الذاكرة
    const memCached = memCache.get(cacheKey);
    if (memCached && Date.now() - memCached.ts < MEM_TTL) {
      return NextResponse.json(memCached.data, {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=3600",
          "X-Cache": "MEMORY",
        },
      });
    }
    
    // 2. Redis
    try {
      const cached = await redisCache.get<any>(cacheKey);
      if (cached) {
        memCache.set(cacheKey, { ts: Date.now(), data: cached });
        return NextResponse.json(cached, {
          headers: {
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "X-Cache": "REDIS",
          },
        });
      }
    } catch (redisError) {
      console.warn("Redis error:", redisError);
    }
    
    // 3. جلب المقال الحالي
    const currentArticle = await prisma.articles.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: "published",
      },
      select: {
        id: true,
        category_id: true,
        tags: {
          select: {
            article_tags: {
              select: {
                tag_id: true,
              },
            },
          },
        },
      },
    });
    
    if (!currentArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    
    // 4. جلب المقالات المرتبطة بناءً على الفئة والتاجات
    const tagIds = currentArticle.tags?.article_tags?.map(at => at.tag_id) || [];
    
    // استعلامات متوازية للحصول على أفضل النتائج
    const [sameCategory, sameTags, trending] = await Promise.all([
      // مقالات من نفس الفئة
      prisma.articles.findMany({
        where: {
          status: "published",
          category_id: currentArticle.category_id,
          id: { not: currentArticle.id },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          excerpt: true,
          published_at: true,
          views: true,
          reading_time: true,
          categories: {
            select: {
              name: true,
              slug: true,
              color: true,
            },
          },
        },
        orderBy: [
          { views: "desc" },
          { published_at: "desc" },
        ],
        take: Math.ceil(limit / 2),
      }),
      
      // مقالات بنفس التاجات (إن وجدت)
      tagIds.length > 0
        ? prisma.articles.findMany({
            where: {
              status: "published",
              id: { not: currentArticle.id },
              article_tags: {
                some: {
                  tag_id: { in: tagIds },
                },
              },
            },
            select: {
              id: true,
              title: true,
              slug: true,
              featured_image: true,
              excerpt: true,
              published_at: true,
              views: true,
              reading_time: true,
              categories: {
                select: {
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
            orderBy: { published_at: "desc" },
            take: Math.floor(limit / 2),
          })
        : [],
      
      // المقالات الأكثر قراءة (كـ fallback)
      prisma.articles.findMany({
        where: {
          status: "published",
          id: { not: currentArticle.id },
          published_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // آخر 7 أيام
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          excerpt: true,
          published_at: true,
          views: true,
          reading_time: true,
          categories: {
            select: {
              name: true,
              slug: true,
              color: true,
            },
          },
        },
        orderBy: { views: "desc" },
        take: limit,
      }),
    ]);
    
    // دمج النتائج وإزالة المكرر
    const uniqueArticles = new Map();
    [...sameCategory, ...sameTags, ...trending].forEach(article => {
      if (!uniqueArticles.has(article.id)) {
        uniqueArticles.set(article.id, article);
      }
    });
    
    const relatedArticles = Array.from(uniqueArticles.values()).slice(0, limit);
    
    const response = {
      articles: relatedArticles,
      total: relatedArticles.length,
    };
    
    // حفظ في الكاش
    try {
      await redisCache.set(cacheKey, response, CACHE_TTL.ARTICLES);
    } catch (redisError) {
      console.warn("Failed to save to Redis:", redisError);
    }
    
    memCache.set(cacheKey, { ts: Date.now(), data: response });
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600",
        "X-Cache": "MISS",
      },
    });
    
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch related articles" },
      { status: 500 }
    );
  }
}
