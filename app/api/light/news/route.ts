import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma";

export const runtime = "nodejs";

// كاش بالذاكرة لمدة قصيرة لتخفيف الحمل
type CacheEntry = { data: any[]; ts: number };
let MEMORY_CACHE: CacheEntry | null = null;
const TTL_MS = 60 * 1000; // 60 ثانية

function withCloudinaryThumb(src: string): string {
  try {
    if (!src || typeof src !== "string") return src;
    if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) return src;
    const [prefix, rest] = src.split("/upload/");
    if (/^(c_|w_|h_|f_|q_)/.test(rest)) return `${prefix}/upload/${rest}`;
    const t = "c_fill,w_400,h_225,q_auto,f_auto";
    return `${prefix}/upload/${t}/${rest}`;
  } catch {
    return src;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "9", 10), 30);
    
    console.log(`🔄 [Light News API] Starting - requested ${limit} articles`);
    
    // محاولة استخدام API الموحد أولاً
    try {
      const unifiedUrl = new URL('/api/unified-featured', request.url);
      unifiedUrl.searchParams.set('limit', limit.toString());
      unifiedUrl.searchParams.set('format', 'lite');
      
      const unifiedResponse = await fetch(unifiedUrl.toString(), {
        headers: { 'X-Internal-Call': 'light-news' },
        signal: AbortSignal.timeout(3000), // timeout بعد 3 ثواني
      });
      
      if (unifiedResponse.ok) {
        const unifiedData = await unifiedResponse.json();
        const responseData = {
          ok: true,
          articles: unifiedData.data || unifiedData.articles || [],
          cached: unifiedData.cached || false,
          source: 'unified',
        };
        
        console.log(`✅ [Light News API] Unified API success: ${responseData.articles.length} articles`);
        
        const res = NextResponse.json(responseData);
        res.headers.set("Cache-Control", "public, max-age=30, s-maxage=30, stale-while-revalidate=60");
        res.headers.set("X-Unified-Redirect", "true");
        return res;
      }
    } catch (unifiedError) {
      console.log(`⚠️ [Light News API] Unified API failed, falling back to direct DB`);
    }
    
    // Fallback: استعلام مباشر من قاعدة البيانات
    await ensureDbConnected();
    
    // فحص الكاش أولاً
    if (MEMORY_CACHE && Date.now() - MEMORY_CACHE.ts < TTL_MS) {
      console.log('📦 [Light News API] Using memory cache');
      return NextResponse.json({
        ok: true,
        articles: MEMORY_CACHE.data.slice(0, limit),
        cached: true,
        source: 'fallback-cache',
      });
    }
    
    console.log('🔍 [Light News API] Fetching from database');
    
    const articles = await retryWithConnection(async () => {
      return await prisma.articles.findMany({
        where: {
          status: 'published',
          published_at: { lte: new Date() },
          // استثناء المقالات التجريبية
          title: {
            not: {
              startsWith: "مقال تجريبي"
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { published_at: 'desc' }
        ],
        take: Math.max(limit, 20), // جلب المزيد للكاش
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          published_at: true,
          breaking: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              icon: true
            }
          },
          views: true
        }
      });
    });
    
    // معالجة النتائج
    const processedArticles = articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      featured_image: withCloudinaryThumb(article.featured_image || ''),
      published_at: article.published_at,
      breaking: article.breaking || false,
      categories: article.categories,
      views: article.views || 0
    }));
    
    // تحديث الكاش
    MEMORY_CACHE = { 
      data: processedArticles, 
      ts: Date.now() 
    };
    
    console.log(`✅ [Light News API] Database success: ${processedArticles.length} articles found`);
    
    const responseData = {
      ok: true,
      articles: processedArticles.slice(0, limit),
      cached: false,
      source: 'fallback-db',
    };
    
    const res = NextResponse.json(responseData);
    res.headers.set("Cache-Control", "public, max-age=30, s-maxage=30, stale-while-revalidate=60");
    res.headers.set("X-Source", "fallback");
    return res;
    
  } catch (error: any) {
    console.error("❌ [Light News API] Complete failure:", error);
    
    return NextResponse.json({ 
      ok: true, 
      articles: [], 
      fallback: true,
      error: "حدث خطأ في جلب الأخبار",
    }, { 
      status: 200,
      headers: {
        "X-Error": "true",
      }
    });
  }
}


