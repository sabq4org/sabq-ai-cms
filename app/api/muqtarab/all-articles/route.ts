import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// كاش في الذاكرة للأداء الفائق (مفاتيح حسب المعاملات)
type CacheEntry = { ts: number; data: any; etag: string };
const cacheStore: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 300000; // 300 ثانية (5 دقائق)

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 [All Muqtarab Articles - Fast] بدء جلب المقالات...");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "16");
    const sortBy = searchParams.get("sortBy") || "newest";
    const category = searchParams.get("category") || undefined;
    const featured = searchParams.get("featured") === "true";

    // مفتاح الكاش حسب المعاملات
    const cacheKey = `page=${page}&limit=${limit}&sortBy=${sortBy}&category=${category || ''}&featured=${featured}`;
    const now = Date.now();
    const cached = cacheStore.get(cacheKey);
    if (cached && now - cached.ts < CACHE_DURATION) {
      console.log("⚡ [All Articles Cache] HIT", cacheKey);
      const res = NextResponse.json(cached.data);
      res.headers.set("ETag", cached.etag);
      res.headers.set("X-Cache", "HIT");
      res.headers.set("X-Cache-Age", `${Math.floor((now - cached.ts) / 1000)}s`);
      res.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=300");
      res.headers.set("CDN-Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");
      return res;
    }

    const skip = (page - 1) * limit;
    const startTime = Date.now();

    let orderBy: any = { publish_at: "desc" };
    if (sortBy === "popular") orderBy = { view_count: "desc" };
    if (sortBy === "featured") orderBy = { is_featured: "desc" };

    const where: any = {
      publish_at: { lte: new Date() },
      ...(featured ? { is_featured: true } : {}),
    };

    // استعلام محسن جداً
    const [articles, totalCount] = await Promise.all([
      prisma.muqtarab_articles.findMany({
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
          author_name: true,
          author_bio: true,
        },
      }),
      // عد بسيط وسريع
      prisma.muqtarab_articles.count({ where }),
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`⚡ استعلام المقالات: ${queryTime}ms`);

    const formattedArticles = articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || "",
      slug: article.slug,
      coverImage: article.cover_image,
      readingTime: article.read_time || 5,
      publishDate: article.publish_at,
      views: article.view_count || 0,
      tags: article.tags || [],
      angle: null, // لا يوجد corner في هذا الجدول
      author: {
        id: null,
        name: article.author_name || "فريق التحرير",
        avatar: null,
      },
      link: `/muqtarab/articles/${article.slug}`,
      isFeatured: article.is_featured,
      isRecent: article.publish_at ? 
        article.publish_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : 
        false,
    }));

    // إحصائيات مبسطة للسرعة
    const stats = {
      totalArticles: totalCount,
      featuredCount: articles.filter((a: any) => a.is_featured).length,
      recentCount: formattedArticles.filter((a: any) => a.isRecent).length,
      totalViews: articles.reduce((sum: number, art: any) => sum + (art.view_count || 0), 0),
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

    // حفظ في الكاش بالمفتاح
    const etag = `"muqtarab-${page}-${limit}-${sortBy}-${category || ''}-${featured}-${totalCount}"`;
    cacheStore.set(cacheKey, { ts: now, data: responseData, etag });

    console.log(
      `✅ [All Articles] تم جلب ${formattedArticles.length} مقال في ${
        Date.now() - now
      }ms`
    );

    const res = NextResponse.json(responseData);
    res.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=300");
    res.headers.set("CDN-Cache-Control", "public, s-maxage=300, stale-while-revalidate=300");
    res.headers.set("ETag", etag);
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
