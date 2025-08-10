import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// كاش في الذاكرة للأداء الفائق
let allArticlesCache: any = null;
let allArticlesCacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 ثانية

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 [All Muqtarab Articles - Fast] بدء جلب المقالات...");

    // تحقق من الكاش أولاً
    const now = Date.now();
    if (allArticlesCache && now - allArticlesCacheTimestamp < CACHE_DURATION) {
      console.log("⚡ [All Articles Cache] إرجاع من الكاش");
      const res = NextResponse.json(allArticlesCache);
      res.headers.set("X-Cache", "HIT");
      res.headers.set(
        "X-Cache-Age",
        `${Math.floor((now - allArticlesCacheTimestamp) / 1000)}s`
      );
      return res;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20"); // زيادة الحد الافتراضي إلى 20
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;
    const startTime = Date.now();

    let orderBy: any = { publish_at: "desc" };
    if (sortBy === "popular") {
      orderBy = { view_count: "desc" };
    }

    const where: any = {
      status: "published",
      publish_at: { lte: new Date() },
    };

    // استعلام محسن جداً
    const [articles, totalCount] = await Promise.all([
      prisma.muqtarabArticle.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          cover_image: true,
          read_time: true,
          publish_at: true,
          view_count: true,
          tags: true,
          is_featured: true,
          // زاوية مبسطة
          corner: {
            select: {
              id: true,
              name: true,
              slug: true,
              theme_color: true,
            },
          },
          // منشئ مبسط
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      // عد بسيط وسريع
      prisma.muqtarabArticle.count({ where }),
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`⚡ استعلام المقالات: ${queryTime}ms`);

    const formattedArticles = articles.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || "",
      slug: article.slug,
      coverImage: article.cover_image,
      readingTime: article.read_time || 5,
      publishDate: article.publish_at,
      views: article.view_count || 0,
      tags: article.tags || [],
      angle: article.corner
        ? {
            id: article.corner.id,
            title: article.corner.name,
            slug: article.corner.slug,
            themeColor: article.corner.theme_color || "#3B82F6",
          }
        : null,
      author: {
        id: article.creator?.id,
        name: article.creator?.name || "فريق التحرير",
        avatar: article.creator?.avatar,
      },
      link: `/muqtarab/articles/${article.slug}`,
      isFeatured: article.is_featured,
      isRecent:
        article.publish_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }));

    // إحصائيات مبسطة للسرعة
    const stats = {
      totalArticles: totalCount,
      featuredCount: articles.filter((a) => a.is_featured).length,
      recentCount: formattedArticles.filter((a) => a.isRecent).length,
      totalViews: articles.reduce((sum, art) => sum + (art.view_count || 0), 0),
    };

    const responseData = {
      success: true,
      articles: formattedArticles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
      stats,
      performance: {
        queryTime,
        responseTime: Date.now() - now,
        cached: false,
      },
    };

    // حفظ في الكاش
    allArticlesCache = responseData;
    allArticlesCacheTimestamp = now;

    console.log(
      `✅ [All Articles] تم جلب ${formattedArticles.length} مقال في ${
        Date.now() - now
      }ms`
    );

    const res = NextResponse.json(responseData);
    res.headers.set(
      "Cache-Control",
      "public, max-age=30, stale-while-revalidate=60"
    );
    res.headers.set("CDN-Cache-Control", "public, s-maxage=120");
    res.headers.set("X-Cache", "MISS");
    res.headers.set("X-Response-Time", `${Date.now() - now}ms`);

    return res;
  } catch (error: any) {
    console.error("❌ [All Muqtarab Articles] خطأ في جلب المقالات:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب مقالات الزوايا",
        articles: [],
        pagination: { currentPage: 1, totalPages: 0, totalCount: 0, limit: 4 },
        stats: {
          totalArticles: 0,
          featuredCount: 0,
          recentCount: 0,
          totalViews: 0,
        },
      },
      { status: 500 }
    );
  }
}
