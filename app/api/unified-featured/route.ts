/**
 * API موحد للأخبار المميزة - يضمن التزامن 100% بين النسختين الكاملة والخفيفة
 * 
 * يستبدل جميع APIs المتعددة بنظام موحد يضمن:
 * - نفس البيانات للنسختين
 * - نفس منطق Fallback
 * - نفس معالجة الصور والCache
 */

import { NextRequest, NextResponse } from "next/server";
import UnifiedFeaturedManager from "@/lib/services/unified-featured-manager";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "3", 10), 12);
    const format = searchParams.get("format") || "full"; // "full" or "lite"
    
    console.log(`🔄 [UnifiedAPI] Fetching ${limit} articles in ${format} format`);

    // استخدام المدير الموحد
    const result = await UnifiedFeaturedManager.getFeaturedArticles(limit, format);
    
    // تنسيق الاستجابة حسب النوع المطلوب
    let responseData;
    
    if (format === "lite") {
      // تنسيق مبسط للنسخة الخفيفة
      responseData = {
        ok: true,
        success: true,
        data: result.articles.map(article => ({
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
    } else {
      // تنسيق كامل للنسخة الرئيسية
      responseData = {
        success: true,
        articles: result.articles,
        count: result.count,
        timestamp: result.timestamp,
        source: result.source,
        cached: result.cached,
      };
    }

    // Headers موحدة للتحكم في Cache
    const headers = {
      "Cache-Control": result.cached 
        ? "public, max-age=30, s-maxage=30, stale-while-revalidate=60"
        : "public, max-age=5, s-maxage=5, stale-while-revalidate=30",
      "Content-Type": "application/json",
      "X-Cache": result.cached ? "HIT" : "MISS",
      "X-Source": result.source,
      "X-Unified-API": "v1",
    };

    console.log(`✅ [UnifiedAPI] Success: ${result.count} articles from ${result.source}, cached: ${result.cached}`);

    return NextResponse.json(responseData, { headers });
    
  } catch (error: any) {
    console.error("❌ [UnifiedAPI] Error:", error);
    
    // استجابة خطأ موحدة
    return NextResponse.json(
      {
        success: false,
        ok: false,
        articles: [],
        data: [],
        error: "حدث خطأ في جلب الأخبار المميزة",
        details: error.message,
        fallback: true,
      },
      { 
        status: 500,
        headers: {
          "X-Unified-API": "v1",
          "X-Error": "true",
        }
      }
    );
  }
}
