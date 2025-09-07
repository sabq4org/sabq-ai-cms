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
    console.log('🔄 [Light News API] Redirecting to unified API');
    
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "9", 10), 30);
    
    // توجيه إلى API الموحد
    const unifiedUrl = new URL('/api/unified-featured', request.url);
    unifiedUrl.searchParams.set('limit', limit.toString());
    unifiedUrl.searchParams.set('format', 'lite');
    
    const unifiedResponse = await fetch(unifiedUrl.toString(), {
      headers: {
        'X-Internal-Call': 'light-news',
      },
    });
    
    if (!unifiedResponse.ok) {
      throw new Error(`Unified API error: ${unifiedResponse.status}`);
    }
    
    const unifiedData = await unifiedResponse.json();
    
    // تحويل التنسيق للتوافق مع التوقعات القديمة
    const responseData = {
      ok: true,
      articles: unifiedData.data || unifiedData.articles || [],
      cached: unifiedData.cached || false,
      source: unifiedData.source || 'unified',
    };
    
    console.log(`✅ [Light News API] Got ${responseData.articles.length} articles from unified API`);
    
    const res = NextResponse.json(responseData);
    res.headers.set("Cache-Control", "public, max-age=30, s-maxage=30, stale-while-revalidate=60");
    res.headers.set("X-Unified-Redirect", "true");
    return res;
  } catch (error: any) {
    console.error("❌ [Light News API] Error:", error);
    
    // Fallback بتنسيق متوافق
    return NextResponse.json({ 
      ok: true, 
      articles: [], 
      fallback: true,
      error: "حدث خطأ في جلب الأخبار",
    }, { 
      status: 200,
      headers: {
        "X-Unified-Redirect": "true",
        "X-Error": "true",
      }
    });
  }
}


