import { createCacheKey, withCache } from "@/lib/cache";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: صفحة مقترب مُحسّنة مع cache ذكي
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    // إنشاء cache key
    const cacheKey = createCacheKey("muqtarab:page", { filter });
    const cacheManager = withCache(cacheKey, 10, true); // 10 دقائق cache

    // التحقق من الـ cache
    const cachedData = cacheManager.get();
    if (cachedData) {
      console.log("⚡ [Cache HIT] Muqtarab Page:", cacheKey);
      return NextResponse.json(cachedData, {
        headers: cacheManager.getCacheHeaders(),
      });
    }

    console.log("🔍 [Muqtarab Page] جلب البيانات بشكل محسّن...");

    // جلب جميع البيانات بالتوازي
    const [angles, heroArticle, stats, featuredArticles] = await Promise.all([
      // 1. جلب الزوايا المُحسّن
      prisma.$queryRaw`
        SELECT
          a.id,
          a.title,
          a.slug,
          a.description,
          a.icon,
          a.theme_color,
          a.cover_image,
          a.is_featured,
          a.created_at,
          a.updated_at,
          a.author_id,
          u.name as author_name,
          u.avatar as author_avatar,
          COUNT(aa.id)::int as articles_count
        FROM angles a
        LEFT JOIN users u ON a.author_id = u.id
        LEFT JOIN angle_articles aa ON a.id = aa.angle_id AND aa.is_published = true
        WHERE a.is_published = true
        GROUP BY a.id, u.name, u.avatar
        ORDER BY a.is_featured DESC, a.created_at DESC
        LIMIT 20
      `,

      // 2. جلب المقال المميز
      prisma.$queryRaw`
        SELECT
          aa.id,
          aa.title,
          aa.excerpt,
          aa.cover_image,
          aa.reading_time,
          aa.publish_date,
          aa.views,
          aa.tags,
          a.title as angle_title,
          a.slug as angle_slug,
          a.icon as angle_icon,
          a.theme_color as angle_theme_color,
          u.name as author_name,
          u.avatar as author_avatar
        FROM angle_articles aa
        JOIN angles a ON aa.angle_id = a.id
        LEFT JOIN users u ON aa.author_id = u.id
        WHERE aa.is_published = true
          AND a.is_published = true
          AND 'مميز' = ANY(aa.tags)
        ORDER BY aa.views DESC, aa.publish_date DESC
        LIMIT 1
      `,

      // 3. جلب الإحصائيات مُحسّنة
      prisma.$queryRaw`
        SELECT
          COUNT(DISTINCT a.id) as total_angles,
          COUNT(CASE WHEN a.is_published = true THEN 1 END) as published_angles,
          COUNT(DISTINCT aa.id) as total_articles,
          COUNT(CASE WHEN aa.is_published = true THEN 1 END) as published_articles,
          COALESCE(SUM(CASE WHEN aa.is_published = true THEN aa.views ELSE 0 END), 0) as total_views,
          COUNT(DISTINCT aa.author_id) as unique_authors
        FROM angles a
        LEFT JOIN angle_articles aa ON a.id = aa.angle_id
      `,

      // 4. جلب المقالات المختارة
      prisma.$queryRaw`
        SELECT
          aa.id,
          aa.title,
          aa.excerpt,
          aa.cover_image,
          aa.reading_time,
          aa.publish_date,
          aa.views,
          aa.tags,
          a.id as angle_id,
          a.title as angle_title,
          a.slug as angle_slug,
          a.icon as angle_icon,
          a.theme_color as angle_theme_color,
          u.name as author_name,
          u.avatar as author_avatar
        FROM angle_articles aa
        JOIN angles a ON aa.angle_id = a.id
        LEFT JOIN users u ON aa.author_id = u.id
        WHERE aa.is_published = true
          AND a.is_published = true
        ORDER BY aa.views DESC, aa.publish_date DESC
        LIMIT 6
      `,
    ]);

    // تنسيق البيانات
    const formattedAngles = (angles as any[]).map((angle) => ({
      id: angle.id,
      title: angle.title,
      slug: angle.slug,
      description: angle.description,
      icon: angle.icon,
      themeColor: angle.theme_color,
      coverImage: angle.cover_image,
      isFeatured: angle.is_featured,
      createdAt: angle.created_at,
      updatedAt: angle.updated_at,
      articlesCount: angle.articles_count,
      author: {
        id: angle.author_id,
        name: angle.author_name,
        avatar: angle.author_avatar,
      },
    }));

    const formattedHeroArticle = (heroArticle as any[])[0]
      ? {
          id: (heroArticle as any[])[0].id,
          title: (heroArticle as any[])[0].title,
          excerpt: (heroArticle as any[])[0].excerpt,
          coverImage: (heroArticle as any[])[0].cover_image,
          readingTime: (heroArticle as any[])[0].reading_time,
          publishDate: (heroArticle as any[])[0].publish_date,
          views: (heroArticle as any[])[0].views,
          tags: (heroArticle as any[])[0].tags,
          angle: {
            title: (heroArticle as any[])[0].angle_title,
            slug: (heroArticle as any[])[0].angle_slug,
            icon: (heroArticle as any[])[0].angle_icon,
            themeColor: (heroArticle as any[])[0].angle_theme_color,
          },
          author: {
            name: (heroArticle as any[])[0].author_name,
            avatar: (heroArticle as any[])[0].author_avatar,
          },
        }
      : null;

    const formattedStats = (stats as any[])[0]
      ? {
          totalAngles: Number((stats as any[])[0].total_angles) || 0,
          publishedAngles: Number((stats as any[])[0].published_angles) || 0,
          totalArticles: Number((stats as any[])[0].total_articles) || 0,
          publishedArticles:
            Number((stats as any[])[0].published_articles) || 0,
          totalViews: Number((stats as any[])[0].total_views) || 0,
          uniqueAuthors: Number((stats as any[])[0].unique_authors) || 0,
          displayViews: {
            raw: Number((stats as any[])[0].total_views) || 0,
            formatted:
              Number((stats as any[])[0].total_views) >= 1000
                ? `${(Number((stats as any[])[0].total_views) / 1000).toFixed(
                    1
                  )}K`
                : String(Number((stats as any[])[0].total_views) || 0),
          },
        }
      : null;

    const formattedFeaturedArticles = (featuredArticles as any[]).map(
      (article) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        coverImage: article.cover_image,
        readingTime: article.reading_time,
        publishDate: article.publish_date,
        views: article.views,
        tags: article.tags,
        angle: {
          id: article.angle_id,
          title: article.angle_title,
          slug: article.angle_slug,
          icon: article.angle_icon,
          themeColor: article.angle_theme_color,
        },
        author: {
          name: article.author_name,
          avatar: article.author_avatar,
        },
      })
    );

    const responseData = {
      success: true,
      angles: formattedAngles,
      heroArticle: formattedHeroArticle,
      stats: formattedStats,
      featuredArticles: formattedFeaturedArticles,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    // حفظ في الـ cache
    cacheManager.set(responseData);

    const duration = Date.now() - startTime;

    console.log("✅ [Muqtarab Page] تم جلب البيانات بنجاح:", {
      angles: formattedAngles.length,
      heroArticle: formattedHeroArticle ? "✓" : "✗",
      featuredArticles: formattedFeaturedArticles.length,
      duration: `${duration}ms`,
      cached: true,
    });

    return NextResponse.json(responseData, {
      headers: cacheManager.getCacheHeaders(),
    });
  } catch (error) {
    console.error("❌ [Muqtarab Page] خطأ في جلب البيانات:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في تحميل صفحة مقترب",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error)?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
