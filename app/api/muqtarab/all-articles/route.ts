import { createCacheKey, performanceLogger, withCache } from "@/lib/cache";
import { cache as redisCache } from "@/lib/redis-improved";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const timer = performanceLogger("Muqtarab All Articles");

  try {
    const { searchParams } = new URL(request.url);

    // معاملات التحكم في الاستعلام
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, popular, featured
    const category = searchParams.get("category"); // فلترة حسب زاوية محددة
    const featured = searchParams.get("featured") === "true";

    const offset = (page - 1) * limit;

    // إنشاء cache key ديناميكي (Memory + Redis)
    const cacheKey = createCacheKey("muqtarab:articles", {
      page,
      limit,
      sortBy,
      category: category || "all",
      featured,
    });

    // مفاتيح Redis
    const redisKey = `muktarib:articles:${page}:${limit}:${sortBy}:${
      category || "all"
    }:${featured}`;

    // 1) فحص Redis أولاً
    try {
      const redisHit = await redisCache.get<any>(redisKey);
      if (redisHit) {
        console.log("⚡ [Redis HIT] Muqtarab Articles:", redisKey);
        const res = NextResponse.json(redisHit);
        res.headers.set("Cache-Control", "max-age=10");
        res.headers.set("CDN-Cache-Control", "s-maxage=60");
        res.headers.set(
          "Vercel-CDN-Cache-Control",
          "s-maxage=3600, stale-while-revalidate=60"
        );
        res.headers.set("X-Cache-Status", "REDIS-HIT");
        return res;
      }
    } catch (e) {
      console.warn("⚠️ تجاوز Redis مؤقتاً (Muqtarab Articles)", e?.message);
    }

    // 2) فحص Cache الذاكرة
    const cacheManager = withCache(cacheKey, 5, true); // 5 دقائق cache
    const cachedData = cacheManager.get();
    if (cachedData) {
      console.log("⚡ [Memory HIT] Muqtarab Articles:", cacheKey);
      const res = NextResponse.json(cachedData);
      res.headers.set("Cache-Control", "max-age=10");
      res.headers.set("CDN-Cache-Control", "s-maxage=60");
      res.headers.set(
        "Vercel-CDN-Cache-Control",
        "s-maxage=3600, stale-while-revalidate=60"
      );
      res.headers.set("X-Cache-Status", "MEM-HIT");
      return res;
    }

    console.log("🔍 [All Muqtarab Articles] المعاملات:", {
      page,
      limit,
      sortBy,
      category,
      featured,
      offset,
      cacheKey,
    });

    // بناء استعلام ديناميكي لجلب جميع مقالات الزوايا المنشورة
    let orderClause = "";
    switch (sortBy) {
      case "popular":
        // المقالات المميزة أولاً، ثم حسب الشعبية
        orderClause =
          "ORDER BY (CASE WHEN 'مميز' = ANY(aa.tags) THEN 0 ELSE 1 END), aa.views DESC, aa.publish_date DESC, aa.created_at DESC";
        break;
      case "featured":
        orderClause =
          "ORDER BY (CASE WHEN 'مميز' = ANY(aa.tags) THEN 0 ELSE 1 END), aa.publish_date DESC, aa.created_at DESC";
        break;
      case "newest":
      default:
        // المقالات المميزة أولاً، ثم الأحدث
        orderClause =
          "ORDER BY (CASE WHEN 'مميز' = ANY(aa.tags) THEN 0 ELSE 1 END), aa.publish_date DESC, aa.created_at DESC";
        break;
    }

    // شروط الفلترة
    let whereConditions = `
      WHERE aa.is_published = true
      AND a.is_published = true
      AND aa.publish_date <= NOW()
    `;

    // إضافة فلتر الزاوية إذا تم تحديدها
    if (category) {
      whereConditions += ` AND a.slug = '${category}'`;
    }

    // إضافة فلتر المميز
    if (featured) {
      whereConditions += ` AND 'مميز' = ANY(aa.tags)`;
    }

    const articlesQuery = `
      SELECT
        aa.id,
        aa.title,
        aa.slug, -- Ensure slug is selected
        aa.excerpt,
        aa.cover_image,
        aa.reading_time,
        aa.publish_date,
        aa.views,
        aa.tags,
        aa.created_at,
        aa.sentiment,
        a.id as angle_id,
        a.title as angle_title,
        a.slug as angle_slug,
        a.icon as angle_icon,
        a.theme_color as angle_theme_color,
        a.description as angle_description,
        u.id as author_id,
        u.name as author_name,
        u.avatar as author_avatar,
        u.email as author_email
      FROM angle_articles aa
      LEFT JOIN angles a ON aa.angle_id = a.id
      LEFT JOIN users u ON aa.author_id = u.id
      ${whereConditions}
      ${orderClause}
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM angle_articles aa
      LEFT JOIN angles a ON aa.angle_id = a.id
      ${whereConditions}
    `;

    // تنفيذ الاستعلامات بالتوازي
    const [articlesResult, countResult] = await Promise.all([
      prisma.$queryRawUnsafe(articlesQuery, limit, offset) as Promise<any[]>,
      prisma.$queryRawUnsafe(countQuery) as Promise<[{ total: bigint }]>,
    ]);

    const totalCount = Number(countResult[0].total);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // تنسيق البيانات
    const formattedArticles = articlesResult.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || "",
      slug: article.slug, // Use the actual slug
      coverImage: article.cover_image,
      readingTime: Number(article.reading_time) || 3,
      publishDate: article.publish_date,
      views: Number(article.views) || 0,
      tags: Array.isArray(article.tags) ? article.tags : [],
      sentiment: article.sentiment,
      createdAt: article.created_at,

      // معلومات الزاوية
      angle: {
        id: article.angle_id,
        title: article.angle_title,
        slug: article.angle_slug,
        icon: article.angle_icon,
        themeColor: article.angle_theme_color,
        description: article.angle_description,
      },

      // معلومات المؤلف
      author: {
        id: article.author_id,
        name: article.author_name || "كاتب مجهول",
        avatar: article.author_avatar,
        email: article.author_email,
      },

      // إضافة خصائص مفيدة
      isFeatured: Array.isArray(article.tags) && article.tags.includes("مميز"),
      isRecent:
        new Date(article.publish_date) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // آخر أسبوع
      link: `/muqtarab/articles/${article.slug}`,
    }));

    // إحصائيات إضافية
    const angleStats = articlesResult.reduce((acc, article) => {
      const angleTitle = article.angle_title;
      if (!acc[angleTitle]) {
        acc[angleTitle] = {
          count: 0,
          totalViews: 0,
          themeColor: article.angle_theme_color,
          slug: article.angle_slug,
        };
      }
      acc[angleTitle].count++;
      acc[angleTitle].totalViews += Number(article.views) || 0;
      return acc;
    }, {} as Record<string, any>);

    // إنشاء البيانات للإرجاع
    const responseData = {
      success: true,
      articles: formattedArticles,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        limit,
        offset,
      },
      stats: {
        totalArticles: totalCount,
        angleStats,
        featuredCount: formattedArticles.filter((a) => a.isFeatured).length,
        recentCount: formattedArticles.filter((a) => a.isRecent).length,
      },
      filters: {
        sortBy,
        category,
        featured,
      },
    };

    // حفظ البيانات في الـ cache (Memory + Redis)
    cacheManager.set(responseData);
    try {
      await redisCache.set(redisKey, responseData, 600);
    } catch (e) {
      console.warn("⚠️ فشل حفظ Muqtarab Articles في Redis", e?.message);
    }

    // تسجيل الأداء
    const duration = timer.end(formattedArticles.length);

    console.log("✅ [All Muqtarab Articles] تم جلب المقالات:", {
      found: formattedArticles.length,
      total: totalCount,
      page,
      totalPages,
      angles: Object.keys(angleStats).length,
      duration: `${duration}ms`,
      cached: true,
    });

    const res = NextResponse.json(responseData);
    res.headers.set("Cache-Control", "max-age=10");
    res.headers.set("CDN-Cache-Control", "s-maxage=60");
    res.headers.set(
      "Vercel-CDN-Cache-Control",
      "s-maxage=3600, stale-while-revalidate=60"
    );
    res.headers.set("X-Cache-Status", "MISS");
    return res;
  } catch (error) {
    console.error("❌ [All Muqtarab Articles] خطأ في جلب المقالات:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب مقالات الزوايا",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error)?.message
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
