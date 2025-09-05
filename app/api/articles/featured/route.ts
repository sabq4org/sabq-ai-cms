import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { retryWithConnection, ensureDbConnected } from "@/lib/prisma";

export const runtime = "nodejs";

// ذاكرة تخزين مؤقت محسنة مع مفاتيح متعددة
const CACHE_TTL = 30 * 1000; // Cache محسن مع تنظيف تلقائي وإشعارات التحديث
const cache = new Map<string, { data: any; timestamp: number }>();

// تنظيف الكاش عند إضافة مقال جديد
export function clearFeaturedCache() {
  cache.clear();
  console.log('🔄 تم مسح cache الأخبار المميزة');
}

// تنظيف الذاكرة المؤقتة كل 5 دقائق
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL * 10) { // احتفظ لـ 10x TTL
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 24);
    const withCategories = searchParams.get("withCategories") === "true";

    // مفتاح ذاكرة مؤقت فريد حسب المعاملات
    const cacheKey = `featured:${limit}:${withCategories}`;
    const cached = cache.get(cacheKey);
    
    // التحقق من الذاكرة المؤقتة
    if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
      return NextResponse.json({ ok: true, data: cached.data, count: cached.data.length, cached: true }, {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
          "X-Cache": "MEMORY-HIT"
        }
      });
    }

    const now = new Date();

    await ensureDbConnected();

    // بناء الحقول ديناميكياً لتجنّب join ثقيل عند عدم الحاجة
    const selectFields: any = {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featured_image: true,
      social_image: true,
      metadata: true,
      published_at: true,
      views: true,
      breaking: true,
    };
    if (withCategories) {
      selectFields.categories = { select: { id: true, name: true, slug: true, color: true } };
    }

    // تحسين الاستعلام - استعلام منفصل للأخبار المميزة أولاً (أسرع)
    const featuredArticles = await retryWithConnection(async () =>
      await prisma.articles.findMany({
        where: {
          status: "published",
          featured: true,
          OR: [
            { published_at: { lte: now } },
            { published_at: null },
          ],
        },
        orderBy: [
          { published_at: "desc" },
          { views: "desc" }
        ],
        take: limit,
        select: selectFields,
      })
    );

    // إذا لم نحصل على العدد المطلوب، نضيف الأخبار العاجلة
    let featured = featuredArticles;
    if (featured.length < limit) {
      const breakingArticles = await retryWithConnection(async () =>
        await prisma.articles.findMany({
          where: {
            status: "published",
            breaking: true,
            featured: false, // تجنب التكرار
            OR: [
              { published_at: { lte: now } },
              { published_at: null },
            ],
          },
          orderBy: [
            { published_at: "desc" },
            { views: "desc" }
          ],
          take: limit - featured.length,
          select: selectFields,
        })
      );
      
      // دمج النتائج مع إعطاء الأولوية للمميزة
      featured = [...featured, ...breakingArticles];
    }

    // حفظ في الذاكرة المؤقتة
    cache.set(cacheKey, { data: featured, timestamp: Date.now() });

    const res = NextResponse.json({ ok: true, data: featured, count: featured.length });
    res.headers.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=300");
    res.headers.set("CDN-Cache-Control", "max-age=60");
    res.headers.set("Vercel-CDN-Cache-Control", "max-age=60");
    res.headers.set("X-Cache-Status", "MISS");
    return res;
  } catch (error: any) {
    console.error("❌ [featured] خطأ في جلب المقالات المميزة:", error);
    return NextResponse.json({ ok: true, data: [], fallback: true }, { status: 200 });
  }
}


