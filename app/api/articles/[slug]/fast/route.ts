import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cache as redisCache, CACHE_TTL } from "@/lib/redis";

export const runtime = "nodejs";

// تحسين الـ cache - ذاكرة محلية محسنة
const memCache = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 60 * 1000; // 60 ثانية للمقالات (أطول من الأخبار)

// تنظيف الذاكرة كل 5 دقائق
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memCache.entries()) {
    if (now - value.ts > MEM_TTL * 10) {
      memCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const decodedSlug = decodeURIComponent(slug);
    
    // معاملات الاستعلام
    const searchParams = request.nextUrl.searchParams;
    const includeRelated = searchParams.get("related") === "true";
    const includeComments = searchParams.get("comments") === "true";
    
    const cacheKey = `article:fast:${decodedSlug}:${includeRelated}:${includeComments}`;
    
    // 1. تحقق من كاش الذاكرة أولاً
    const memCached = memCache.get(cacheKey);
    if (memCached && Date.now() - memCached.ts < MEM_TTL) {
      return NextResponse.json(memCached.data, {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
          "X-Cache": "MEMORY",
        },
      });
    }
    
    // 2. ثم Redis
    try {
      const cached = await redisCache.get<any>(cacheKey);
      if (cached) {
        memCache.set(cacheKey, { ts: Date.now(), data: cached });
        return NextResponse.json(cached, {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
            "X-Cache": "REDIS",
          },
        });
      }
    } catch (redisError) {
      console.warn("Redis error:", redisError);
    }
    
    // 3. تحسين الاستعلام - البحث بالـ slug أولاً (أسرع)
    let article = await prisma.articles.findFirst({
      where: {
        slug: decodedSlug,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        summary: true,
        featured_image: true,
        published_at: true,
        updated_at: true,
        reading_time: true,
        views: true,
        likes: true,
        shares: true,
        saves: true,
        metadata: true,
        // فقط العلاقات الضرورية
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        article_tags: {
          select: {
            tags: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    
    // إذا لم نجد بالـ slug، نبحث بالـ ID
    if (!article) {
      article = await prisma.articles.findFirst({
        where: {
          id: decodedSlug,
          status: "published",
        },
        select: {
          id: true,
          title: true,
          content: true,
          excerpt: true,
          summary: true,
          featured_image: true,
          published_at: true,
          updated_at: true,
          reading_time: true,
          views: true,
          likes: true,
          shares: true,
          saves: true,
          metadata: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              icon: true,
            },
          },
          article_tags: {
            select: {
              tags: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
    }
    
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    
    // تحضير البيانات
    const formattedArticle = {
      ...article,
      tags: article.article_tags?.map(at => at.tags) || [],
      article_tags: undefined, // إزالة البنية المتداخلة
    };
    
    // تحسين: تجاهل البيانات الإضافية لتحسين الأداء
    const relatedArticles: any[] = [];
    const commentsCount = 0;
    
    // تم إزالة جلب المقالات المرتبطة وعد التعليقات لتسريع التحميل
    
    // زيادة عدد المشاهدات بشكل غير متزامن
    prisma.articles.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    }).catch(console.error);
    
    const response = {
      article: formattedArticle,
      related: relatedArticles,
      commentsCount,
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
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
        "X-Cache": "MISS",
      },
    });
    
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
