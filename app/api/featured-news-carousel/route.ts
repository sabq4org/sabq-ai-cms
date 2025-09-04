import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getProductionImageUrl } from "@/lib/production-image-fix";
import { cache as redis, CACHE_TTL } from "@/lib/redis";

export const runtime = "nodejs";

// كاش في الذاكرة للطلبات المتزامنة
const memCache = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 15 * 1000; // 15 ثانية

export async function GET(request: NextRequest) {
  try {
    const cacheKey = "featured-news:carousel:v5";

    // 1. تحقق من كاش الذاكرة أولاً
    const memCached = memCache.get(cacheKey);
    if (memCached && Date.now() - memCached.ts < MEM_TTL) {
      return NextResponse.json(memCached.data, {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
          "Content-Type": "application/json",
          "X-Cache": "MEMORY",
        },
      });
    }

    // 2. ثم Redis
    try {
      const cached = await redis.get<any>(cacheKey);
      if (cached) {
        memCache.set(cacheKey, { ts: Date.now(), data: cached });
        return NextResponse.json(cached, {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
            "Content-Type": "application/json",
            "X-Cache": "REDIS",
          },
        });
      }
    } catch (redisError) {
      console.warn('Redis error:', redisError);
    }
    // 3. جلب من قاعدة البيانات - حقول محدودة فقط
    const featuredArticles = await prisma.articles.findMany({
      where: {
        featured: true,
        status: "published",
        article_type: {
          notIn: ["opinion", "analysis", "interview"],
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
        breaking: true,
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
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        published_at: "desc",
      },
      take: 3,
    });

    // Helper: استبعاد الأخبار التجريبية/الوهمية من العرض العام
    const TEST_PATTERNS = [
      /\btest\b/i,
      /\bdemo\b/i,
      /\bdummy\b/i,
      /\bsample\b/i,
      /تجريبي/i,
      /تجريبية/i,
      /اختبار/i,
    ];

    const isTestOrSampleArticle = (article: any) => {
      try {
        const title = article?.title || "";
        const slug = article?.slug || "";
        const authorName = article?.author?.name || "";
        const reporterName = article?.author?.reporter_profile?.full_name || "";
        const meta = JSON.stringify(article?.metadata || {});
        const id = String(article?.id || "");
        const haystack = `${title}\n${slug}\n${authorName}\n${reporterName}\n${meta}\n${id}`;
        return TEST_PATTERNS.some((re) => re.test(haystack));
      } catch {
        return false;
      }
    };

    // إذا لم توجد مقالات مميزة، جلب آخر المقالات المنشورة
    let articlesToReturn = featuredArticles;
    
    if (!featuredArticles || featuredArticles.length === 0) {
      // جلب آخر مقالات منشورة كـ fallback
      articlesToReturn = await prisma.articles.findMany({
        where: {
          status: "published",
          article_type: {
            notIn: ["opinion", "analysis", "interview"],
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
          breaking: true,
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
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          published_at: "desc",
        },
        take: 10,
      });
      
      if (!articlesToReturn || articlesToReturn.length === 0) {
        return NextResponse.json({
          success: true,
          articles: [],
          message: "لا توجد أخبار حالياً",
        });
      }
    }

    // استبعاد الأخبار التجريبية إن وُجدت
    let filtered = (articlesToReturn || []).filter((a) => !isTestOrSampleArticle(a));

    // في حال قلّ العدد، حاول جلب المزيد لتكميل 3 عناصر
    if (filtered.length < 3) {
      const moreArticles = await prisma.articles.findMany({
        where: {
          status: "published",
          article_type: {
            notIn: ["opinion", "analysis", "interview"],
          },
        },
        orderBy: { published_at: "desc" },
        take: 20,
        include: {
          categories: true,
          author: { include: { reporter_profile: true } },
        },
      });
      const merged = [...articlesToReturn, ...moreArticles];
      const seen = new Set<string>();
      filtered = merged
        .filter((a) => !isTestOrSampleArticle(a))
        .filter((a) => {
          const key = String(a.id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    }

    // الإبقاء على 3 عناصر فقط
    articlesToReturn = filtered.slice(0, 3);

    // تسجيل للتشخيص (في التطوير فقط)
    if (process.env.NODE_ENV !== "production") {
      console.log('🔍 [Featured API] Articles found:', articlesToReturn.length);
      if (articlesToReturn.length > 0) {
        console.log('🔍 [Featured API] First article image fields:', {
          featured_image: articlesToReturn[0]?.featured_image,
          social_image: articlesToReturn[0]?.social_image,
          metadata: articlesToReturn[0]?.metadata,
          all_keys: Object.keys(articlesToReturn[0])
        });
      }
    }
    
    // تنسيق البيانات
    const formattedArticles = articlesToReturn.map((article) => {
      // 1. تجميع رابط الصورة الخام من مصادر متعددة
      const rawImageUrl = article.featured_image ||
                          article.social_image ||
                          (article.metadata as any)?.featured_image ||
                          (article.metadata as any)?.image ||
                          null;

      // 2. معالجة الرابط الخام للحصول على رابط صالح للإنتاج
      const finalImageUrl = getProductionImageUrl(rawImageUrl, {
        width: 800,
        height: 600,
        quality: 85,
        fallbackType: "article"
      });

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        featured_image: finalImageUrl, // 3. استخدام الحقل الموحد والنهائي
        published_at: article.published_at,
        reading_time: article.reading_time,
        views: article.views || 0,
        likes: article.likes || 0,
        shares: article.shares || 0,
        category: article.categories
        ? {
            id: article.categories.id,
            name: article.categories.name,
            icon: article.categories.icon || "",
            color: article.categories.color || "",
          }
        : null,
      author: article.author
        ? {
            id: article.author.id,
            name: article.author.name,
            reporter: article.author.reporter_profile
              ? {
                  id: article.author.reporter_profile.id,
                  full_name: article.author.reporter_profile.full_name,
                  slug: article.author.reporter_profile.slug,
                  title: article.author.reporter_profile.title,
                  is_verified: article.author.reporter_profile.is_verified,
                  verification_badge:
                    article.author.reporter_profile.verification_badge ||
                    "verified",
                }
              : null,
          }
        : null,
        metadata: article.metadata,
        created_at: article.created_at,
        updated_at: article.updated_at,
      };
    });

    const responseData = {
      success: true,
      articles: formattedArticles,
      count: formattedArticles.length,
      timestamp: new Date().toISOString(),
    };

    // حفظ في Redis لمدة 60 ثانية
    // حفظ في Redis
    try {
      await redis.set(cacheKey, responseData, CACHE_TTL.ARTICLES);
    } catch (redisError) {
      console.warn('Failed to save to Redis:', redisError);
    }
    
    // حفظ في كاش الذاكرة
    memCache.set(cacheKey, { ts: Date.now(), data: responseData });

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    console.error("❌ خطأ في جلب الأخبار المميزة:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب الأخبار المميزة",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
