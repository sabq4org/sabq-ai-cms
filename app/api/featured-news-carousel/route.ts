import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getProductionImageUrl } from "@/lib/production-image-fix";
import { cache as redis, CACHE_TTL } from "@/lib/redis";

export const runtime = "nodejs";

// كاش في الذاكرة للطلبات المتزامنة
const memCache = new Map<string, { ts: number; data: any }>();
const MEM_TTL = 5 * 1000; // 5 ثواني

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [Carousel API] Redirecting to unified API');
    
    // استخدام API الموحد بدلاً من المنطق المنفصل
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "3", 10), 6);
    
    // استدعاء API الموحد داخلياً
    const unifiedUrl = new URL('/api/unified-featured', request.url);
    unifiedUrl.searchParams.set('limit', limit.toString());
    unifiedUrl.searchParams.set('format', 'full');
    
    const unifiedResponse = await fetch(unifiedUrl.toString(), {
      headers: {
        'X-Internal-Call': 'carousel',
      },
    });
    
    if (!unifiedResponse.ok) {
      throw new Error(`Unified API error: ${unifiedResponse.status}`);
    }
    
    const unifiedData = await unifiedResponse.json();
    
    console.log(`✅ [Carousel API] Got ${unifiedData.articles?.length || 0} articles from unified API`);
    
    return NextResponse.json(unifiedData, {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=30, stale-while-revalidate=60",
        "Content-Type": "application/json",
        "X-Cache": unifiedData.cached ? "HIT" : "MISS",
        "X-Source": "unified-carousel",
        "X-Unified-Redirect": "true",
      },
    });
  } catch (error: any) {
    console.error("❌ [Carousel API] Error:", error);
    
    // Fallback إلى استجابة فارغة بدلاً من تعطل النظام
    return NextResponse.json(
      {
        success: true,
        articles: [],
        count: 0,
        error: "حدث خطأ في جلب الأخبار المميزة",
        fallback: true,
      },
      { 
        status: 200,
        headers: {
          "X-Unified-Redirect": "true",
          "X-Error": "true",
        }
      }
    );
  }
}
