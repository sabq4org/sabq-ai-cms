import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma";

export const runtime = "nodejs";

// كاش مُحسّن بمستويات متعددة
type CacheEntry = { 
  data: any[]; 
  ts: number; 
  hash: string;
  stats?: any;
};

const CACHE_MAP = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 50;
const CACHE_TTL = {
  SHORT: 30 * 1000,    // 30 ثانية للأخبار الحديثة
  MEDIUM: 120 * 1000,  // 2 دقيقة للأخبار العامة
  LONG: 300 * 1000     // 5 دقائق للإحصائيات
};

function cleanupCache() {
  if (CACHE_MAP.size > MAX_CACHE_SIZE) {
    const oldestKey = CACHE_MAP.keys().next().value;
    if (oldestKey) {
      CACHE_MAP.delete(oldestKey);
    }
  }
}

function generateCacheKey(params: any): string {
  return `news:${JSON.stringify(params)}`;
}

function withOptimizedImage(src: string): string {
  try {
    if (!src || typeof src !== "string") return src;
    if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) return src;
    
    const [prefix, rest] = src.split("/upload/");
    if (/^(c_|w_|h_|f_|q_)/.test(rest)) return `${prefix}/upload/${rest}`;
    
    // تحسين أكثر للصور - صور أصغر وأسرع
    const optimization = "c_fill,w_300,h_200,q_auto:low,f_auto,dpr_auto";
    return `${prefix}/upload/${optimization}/${rest}`;
  } catch {
    return src;
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const category = searchParams.get("category");
    const excludeIds = searchParams.get("exclude")?.split(",").filter(Boolean) || [];
    const type = searchParams.get("type") || "latest"; // latest, featured, trending
    
    const cacheKey = generateCacheKey({ limit, page, category, excludeIds, type });
    const now = Date.now();
    
    // التحقق من الكاش
    const cached = CACHE_MAP.get(cacheKey);
    if (cached && (now - cached.ts) < CACHE_TTL.MEDIUM) {
      const response = NextResponse.json({
        success: true,
        articles: cached.data.slice(0, limit),
        stats: cached.stats,
        cached: true,
        performance: {
          duration: Date.now() - startTime,
          cached: true
        }
      });
      
      response.headers.set("Cache-Control", "public, max-age=60, s-maxage=120");
      return response;
    }

    await ensureDbConnected();
    const currentTime = new Date();

    // بناء query محسن بشكل ديناميكي
    const whereClause: any = {
      status: "published",
      OR: [
        { published_at: { lte: currentTime } },
        { published_at: null },
      ],
    };

    if (category) {
      whereClause.category_id = category;
    }

    if (excludeIds.length > 0) {
      whereClause.id = { notIn: excludeIds };
    }

    // تحديد ترتيب البيانات حسب النوع
    let orderBy: any = { published_at: "desc" };
    if (type === "trending") {
      orderBy = { views: "desc" };
    } else if (type === "featured") {
      whereClause.featured = true;
    }

    // استعلام محسن مع تحديد الحقول المطلوبة فقط
    const [articles, totalCount] = await Promise.allSettled([
      retryWithConnection(async () =>
        prisma.articles.findMany({
          where: whereClause,
          orderBy,
          take: limit,
          skip: (page - 1) * limit,
          select: {
            id: true,
            title: true,
            slug: true,
            featured_image: true,
            published_at: true,
            views: true,
            excerpt: true,
            featured: true,
            category_id: true,
            created_at: true,
          },
        })
      ),
      // عدد إجمالي فقط إذا كان مطلوب
      searchParams.get("noCount") ? 
        Promise.resolve(0) : 
        retryWithConnection(async () => prisma.articles.count({ where: whereClause }))
    ]);

    const articlesResult = articles.status === 'fulfilled' ? articles.value : [];
    const countResult = totalCount.status === 'fulfilled' ? totalCount.value : 0;

    // تحسين البيانات المرسلة
    const optimizedArticles = (articlesResult || []).map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      featured_image: article.featured_image ? withOptimizedImage(article.featured_image) : null,
      published_at: article.published_at,
      views: article.views || 0,
      excerpt: article.excerpt ? article.excerpt.substring(0, 150) + '...' : null,
      featured: article.featured || false,
      category_id: article.category_id || null,
      // حذف البيانات غير الضرورية
    }));

    // إحصائيات بسيطة
    const stats = {
      total: countResult,
      page,
      limit,
      hasMore: countResult > (page * limit),
      type
    };

    // حفظ في الكاش
    cleanupCache();
    CACHE_MAP.set(cacheKey, {
      data: optimizedArticles,
      stats,
      ts: now,
      hash: cacheKey
    });

    const performance = {
      duration: Date.now() - startTime,
      cached: false,
      itemsReturned: optimizedArticles.length,
      totalItems: countResult
    };

    const response = NextResponse.json({
      success: true,
      articles: optimizedArticles,
      stats,
      performance,
      cached: false
    });

    // تحسين headers للـ caching
    response.headers.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
    response.headers.set("X-Performance", JSON.stringify(performance));
    
    return response;

  } catch (error: any) {
    console.error("❌ [news/optimized] خطأ:", error);
    
    // إرجاع استجابة احتياطية بدلاً من خطأ
    return NextResponse.json({
      success: false,
      articles: [],
      stats: { total: 0, page: 1, limit: 12, hasMore: false },
      error: "خطأ في جلب الأخبار",
      performance: {
        duration: Date.now() - startTime,
        cached: false,
        error: true
      }
    }, { status: 200 }); // نرجع 200 بدلاً من خطأ لتجنب توقف الواجهة
  }
}

// POST method لمسح الكاش يدوياً
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    
    if (action === "clear-cache") {
      CACHE_MAP.clear();
      return NextResponse.json({ 
        success: true, 
        message: "تم مسح الكاش بنجاح",
        clearedItems: CACHE_MAP.size 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "إجراء غير صحيح" 
    }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "خطأ في معالجة الطلب" 
    }, { status: 500 });
  }
}
