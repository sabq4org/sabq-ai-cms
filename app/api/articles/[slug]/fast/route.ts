import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cache as redisCache, CACHE_TTL } from "@/lib/redis";

export const runtime = "nodejs";

// كاش في الذاكرة للطلبات المتزامنة
const memCache = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 30 * 1000; // 30 ثانية

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
    
    // 3. جلب من قاعدة البيانات - حقول محدودة فقط
    const article = await prisma.articles.findFirst({
      where: {
        OR: [{ slug: decodedSlug }, { id: decodedSlug }],
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
        // الكاتب - حقول أساسية فقط
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        article_author: {
          select: {
            id: true,
            full_name: true,
            slug: true,
            avatar_url: true,
          },
        },
        // الفئة
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        // التاجات
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
    
    // جلب البيانات الإضافية إذا طُلبت
    let relatedArticles = [];
    let commentsCount = 0;
    
    if (includeRelated) {
      // جلب مقالات مرتبطة (3 فقط)
      relatedArticles = await prisma.articles.findMany({
        where: {
          status: "published",
          category_id: article.categories?.id,
          id: { not: article.id },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          excerpt: true,
          published_at: true,
          views: true,
        },
        orderBy: { published_at: "desc" },
        take: 3,
      });
    }
    
    if (includeComments) {
      // عد التعليقات فقط
      commentsCount = await prisma.comments.count({
        where: {
          article_id: article.id,
          status: "approved",
        },
      });
    }
    
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
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
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
