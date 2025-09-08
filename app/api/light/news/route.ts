import { NextRequest, NextResponse } from "next/server";
import UnifiedFeaturedManager from "@/lib/services/unified-featured-manager";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "9", 10), 30);
    
    console.log(`🔄 [Light News API] Using unified system - requested ${limit} articles`);
    
    // استخدام النظام الموحد مباشرة
    const result = await UnifiedFeaturedManager.getFeaturedArticles(limit, 'lite');
    
    // تحويل البيانات لتتوافق مع النسخة الخفيفة
    const responseData = {
      ok: true,
      articles: result.articles.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        featured_image: article.featured_image,
        published_at: article.published_at,
        breaking: article.breaking,
        categories: article.category,
        views: article.views,
      })),
      cached: result.cached,
      source: result.source,
    };
    
    console.log(`✅ [Light News API] Unified success: ${responseData.articles.length} articles from ${result.source}, cached: ${result.cached}`);
    
    // Headers موحدة للتحكم في Cache
    const headers = {
      "Cache-Control": result.cached 
        ? "public, max-age=30, s-maxage=30, stale-while-revalidate=60"
        : "public, max-age=5, s-maxage=5, stale-while-revalidate=30",
      "Content-Type": "application/json",
      "X-Cache": result.cached ? "HIT" : "MISS",
      "X-Source": result.source,
      "X-Unified-API": "v1",
      "X-Light-Version": "true",
    };

    return NextResponse.json(responseData, { headers });
    
  } catch (error: any) {
    console.error("❌ [Light News API] Error:", error);
    
    return NextResponse.json({ 
      ok: true, 
      articles: [], 
      fallback: true,
      error: "حدث خطأ في جلب الأخبار",
      details: error.message,
    }, { 
      status: 200,
      headers: {
        "X-Error": "true",
        "X-Light-Version": "true",
      }
    });
  }
}


