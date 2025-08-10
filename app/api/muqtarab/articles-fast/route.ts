import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// كاش في الذاكرة للأداء العالي
let articlesCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // دقيقة واحدة

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 [Fast Muqtarab Articles] بدء جلب المقالات...");

    // تحقق من الكاش
    const now = Date.now();
    if (articlesCache && now - cacheTimestamp < CACHE_DURATION) {
      console.log("✅ [Fast Cache] إرجاع البيانات من الكاش");
      const res = NextResponse.json(articlesCache);
      res.headers.set("X-Cache", "HIT");
      return res;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    // استعلام محسن للسرعة العالية
    const startTime = Date.now();

    const [articles, totalCount] = await Promise.all([
      prisma.muqtarabArticle.findMany({
        where: {
          status: "published",
          publish_at: { lte: new Date() },
        },
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
          // بيانات الزاوية مبسطة
          corner: {
            select: {
              id: true,
              name: true,
              slug: true,
              theme_color: true,
            },
          },
          // بيانات المؤلف مبسطة
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy:
          sortBy === "popular"
            ? { view_count: "desc" }
            : { publish_at: "desc" },
        skip,
        take: limit,
      }),

      // عد سريع مبسط
      prisma.muqtarabArticle.count({
        where: {
          status: "published",
          publish_at: { lte: new Date() },
        },
      }),
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`⚡ استعلام قاعدة البيانات: ${queryTime}ms`);

    // تحويل سريع للبيانات
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
      isFeatured: article.is_featured,
      link: `/muqtarab/articles/${article.slug}`,
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
    }));

    const responseData = {
      success: true,
      articles: formattedArticles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      stats: {
        totalArticles: totalCount,
        featuredCount: articles.filter((a) => a.is_featured).length,
        responseTime: Date.now() - now,
        queryTime,
      },
      cached: false,
      timestamp: new Date().toISOString(),
    };

    // حفظ في الكاش
    articlesCache = responseData;
    cacheTimestamp = now;

    console.log(
      `✅ [Fast Articles] تم جلب ${formattedArticles.length} مقال في ${
        Date.now() - now
      }ms`
    );

    const res = NextResponse.json(responseData);

    // تحسين headers للكاش
    res.headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=120"
    );
    res.headers.set("CDN-Cache-Control", "public, s-maxage=300"); // 5 دقائق
    res.headers.set("X-Cache", "MISS");
    res.headers.set("X-Response-Time", `${Date.now() - now}ms`);

    return res;
  } catch (error: any) {
    console.error("❌ [Fast Muqtarab Articles] خطأ:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب مقالات الزوايا",
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit: 8,
          hasNext: false,
          hasPrev: false,
        },
      },
      { status: 500 }
    );
  }
}
