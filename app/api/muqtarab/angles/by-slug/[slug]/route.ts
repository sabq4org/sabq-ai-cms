import { createCacheKey, withCache } from "@/lib/cache";
import { cache } from "@/lib/redis";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET: جلب زاوية بالـ slug مُحسّن مع cache
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log("🔍 البحث عن الزاوية بالـ slug:", slug);

    if (!slug) {
      return NextResponse.json({ error: "slug مطلوب" }, { status: 400 });
    }

    // إنشاء مفاتيح الكاش (Redis + Memory)
    const cacheKey = createCacheKey("angle:by-slug", { slug });
    const redisKey = `muktarib:angle:${slug}`;
    const cacheManager = withCache(cacheKey, 15, true); // 15 دقيقة Memory cache

    // 1) فحص Redis أولاً
    try {
      const redisHit = await cache.get<any>(redisKey);
      if (redisHit) {
        console.log("⚡ [Redis HIT] Angle by slug:", slug);
        const res = NextResponse.json(redisHit);
        // إعدادات كاش متعددة الطبقات (متصفح/أي CDN/Vercel Edge)
        res.headers.set("Cache-Control", "max-age=10");
        res.headers.set("CDN-Cache-Control", "s-maxage=60");
        res.headers.set(
          "Vercel-CDN-Cache-Control",
          "s-maxage=3600, stale-while-revalidate=60"
        );
        res.headers.set("X-Cache-Status", "REDIS-HIT");
        return res;
      }
    } catch (e: any) {
      console.warn("⚠️ تجاوز Redis مؤقتاً (Angle by slug)", e?.message);
    }

    // 2) فحص Cache الذاكرة
    const cachedData = cacheManager.get();
    if (cachedData) {
      console.log("⚡ [Memory HIT] Angle by slug:", slug);
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

    // استعلام محسّن باستخدام الفهارس الجديدة
    const result = await prisma.$queryRaw`
      SELECT
        mc.id,
        mc.name as title,
        mc.slug,
        mc.description,
        null as icon,
        mc.theme_color,
        mc.cover_image,
        mc.is_featured,
        mc.is_active as is_published,
        mc.created_at,
        mc.updated_at,
        mc.created_by as author_id,
        mc.author_name,
        u.email as author_email,
        u.avatar as author_image,
        COUNT(ma.id)::int as articles_count
      FROM muqtarab_corners mc
      LEFT JOIN users u ON mc.created_by = u.id
      LEFT JOIN muqtarab_articles ma ON mc.id = ma.corner_id AND ma.status = 'published'
      WHERE mc.slug = ${slug} AND mc.is_active = true
      GROUP BY mc.id, mc.name, mc.slug, mc.description, mc.theme_color, mc.cover_image,
               mc.is_featured, mc.is_active, mc.created_at, mc.updated_at,
               mc.created_by, mc.author_name, u.email, u.avatar
    `;

    if (!Array.isArray(result) || result.length === 0) {
      console.log("❌ لم يتم العثور على الزاوية");
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    const angleRow = result[0] as any;

    // تحويل البيانات إلى الشكل المطلوب
    const angle = {
      id: angleRow.id,
      title: angleRow.title,
      slug: angleRow.slug,
      description: angleRow.description,
      icon: angleRow.icon,
      themeColor: angleRow.theme_color,
      coverImage: angleRow.cover_image,
      isFeatured: angleRow.is_featured,
      isPublished: angleRow.is_published,
      createdAt: angleRow.created_at,
      updatedAt: angleRow.updated_at,
      authorId: angleRow.author_id,
      articlesCount: angleRow.articles_count,
      author: angleRow.author_name
        ? {
            id: angleRow.author_id,
            name: angleRow.author_name,
            email: angleRow.author_email,
            image: angleRow.author_image,
          }
        : null,
    };

    const responseData = {
      success: true,
      angle,
      cached: false,
    };

    // 3) حفظ في الذاكرة + Redis
    cacheManager.set(responseData);
    try {
      await cache.set(redisKey, responseData, 600); // 10 دقائق في Redis
    } catch (e: any) {
      console.warn("⚠️ فشل حفظ الزاوية في Redis", e?.message);
    }

    console.log("✅ تم تحويل بيانات الزاوية:", angle.title);

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
    console.error("❌ خطأ في جلب الزاوية بالـ slug:", error);

    return NextResponse.json(
      {
        error: "حدث خطأ في جلب بيانات الزاوية",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
