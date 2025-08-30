import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCachedFeaturedArticles } from "@/lib/redis-performance-cache";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 24);

    console.log(`📈 جلب ${limit} من المقالات المميزة مع Redis Cache...`);
    
    // استخدام Redis Cache المحسن
    const featured = await getCachedFeaturedArticles();
    
    // تطبيق limit على النتائج
    const limitedResults = featured.slice(0, limit);

    const res = NextResponse.json({ 
      ok: true, 
      data: limitedResults, 
      count: limitedResults.length,
      cached: true 
    });
    
    // Headers محسنة للأداء
    res.headers.set("Cache-Control", "public, max-age=60, s-maxage=180, stale-while-revalidate=300");
    res.headers.set("CDN-Cache-Control", "max-age=180");
    res.headers.set("Vercel-CDN-Cache-Control", "max-age=180");
    
    return res;

  } catch (error: any) {
    console.error('❌ خطأ في جلب المقالات المميزة:', error?.message || 'خطأ غير معروف');
    return NextResponse.json({ 
      ok: false, 
      error: 'فشل في جلب المقالات المميزة',
      data: [],
      count: 0 
    }, { status: 500 });
  }
}
