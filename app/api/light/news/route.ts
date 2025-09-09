import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "9", 10), 30);

    // جلب أحدث الأخبار من نفس مصدر النسخة الكاملة لضمان التطابق
    const latestUrl = new URL('/api/news/latest', request.url);
    latestUrl.searchParams.set('limit', String(limit));

    const res = await fetch(latestUrl.toString(), {
      // نستخدم no-store هنا لتقليل احتمالات التأخير، مع السماح بالـ SWR من المصدر
      cache: 'no-store',
      // في حال تشغيل ISR من المصدر سيبقى فعالاً
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) {
      throw new Error(`Failed to load latest news for light version: ${res.status}`);
    }

    const json = await res.json();
    const articles = (json?.articles || json?.data || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      featured_image: a.featured_image || a.social_image || a.image_url || a.image || a.thumbnail || null,
      published_at: a.published_at,
      breaking: a.breaking || a.is_breaking || false,
      categories: a.category || a.categories || null,
      views: a.views ?? a.views_count ?? 0,
    }));

    const responseData = {
      ok: true,
      articles,
      cached: false,
      source: 'latest'
    };

    const headers = {
      // تقليل مدة الكاش للنسخة الخفيفة لضمان الظهور السريع للأخبار
      "Cache-Control": "public, max-age=5, s-maxage=5, stale-while-revalidate=30",
      "Content-Type": "application/json",
      "X-Cache": "MISS", // لأننا استخدمنا no-store هنا
      "X-Source": "latest",
      "X-Unified-API": "v1",
      "X-Light-Version": "true",
    } as Record<string, string>;

    console.log(`✅ [Light News API] Synced with latest: ${articles.length} articles`);

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


