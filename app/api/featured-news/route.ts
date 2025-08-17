import { performanceLogger, withCache } from "@/lib/cache";
import { FeaturedArticleManager } from "@/lib/services/featured-article-manager";
import { NextRequest, NextResponse } from "next/server";

// تفعيل التخزين المؤقت المحسن
export const revalidate = 300; // 5 دقائق

export async function GET(request: NextRequest) {
  const timer = performanceLogger("Featured News API");

  try {
    // Cache key للأخبار المميزة
    const cacheKey = "featured-news:current";
    const cacheManager = withCache(cacheKey, 10, true); // 10 دقائق cache

    // التحقق من الـ cache
    const cachedData = cacheManager.get();
    if (cachedData) {
      console.log("⚡ [Cache HIT] Featured News");
      timer.end();
      return NextResponse.json(cachedData, {
        headers: cacheManager.getCacheHeaders(),
      });
    }

    // جلب المقال المميز باستخدام المدير المركزي
    const featuredArticle = await FeaturedArticleManager.getCurrentFeatured();

    if (!featuredArticle) {
      return NextResponse.json({
        success: true,
        article: null,
        message: "لا يوجد خبر مميز حالياً",
      });
    }

    // تنسيق البيانات
    const formattedArticle = {
      id: featuredArticle.id,
      title: featuredArticle.title,
      slug: featuredArticle.slug,
      excerpt: featuredArticle.excerpt,
      content: featuredArticle.content,
      featured_image: featuredArticle.featured_image,
      published_at: featuredArticle.published_at,
      reading_time: featuredArticle.reading_time,
      views: featuredArticle.views,
      likes: featuredArticle.likes,
      shares: featuredArticle.shares,
      category: featuredArticle.categories
        ? {
            id: featuredArticle.categories.id,
            name: featuredArticle.categories.name,
            icon: featuredArticle.categories.icon,
            color: featuredArticle.categories.color,
          }
        : null,
      author: featuredArticle.author
        ? {
            id: featuredArticle.author.id,
            name: featuredArticle.author.name,
            reporter: featuredArticle.author.reporter_profile
              ? {
                  id: featuredArticle.author.reporter_profile.id,
                  full_name: featuredArticle.author.reporter_profile.full_name,
                  slug: featuredArticle.author.reporter_profile.slug,
                  title: featuredArticle.author.reporter_profile.title,
                  is_verified:
                    featuredArticle.author.reporter_profile.is_verified,
                  verification_badge:
                    featuredArticle.author.reporter_profile.verification_badge,
                }
              : null,
          }
        : null,
      metadata: featuredArticle.metadata,
      created_at: featuredArticle.created_at,
      updated_at: featuredArticle.updated_at,
    };

    // إنشاء البيانات للإرجاع
    const responseData = {
      success: true,
      article: formattedArticle,
    };

    // حفظ في الـ cache
    cacheManager.set(responseData);

    // تسجيل الأداء
    const duration = timer.end();
    console.log(`✅ [Featured News] Duration: ${duration}ms, Cached: true`);

    return NextResponse.json(responseData, {
      headers: cacheManager.getCacheHeaders(),
    });
  } catch (error: any) {
    console.error("❌ خطأ في جلب الخبر المميز:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب الخبر المميز",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
