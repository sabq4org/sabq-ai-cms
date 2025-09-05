import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma";

export const runtime = "nodejs";

// كاش مُحسّن خصيصاً للتوصيات
type RecommendationCache = {
  recommendations: any[];
  ts: number;
  articleId: string;
};

const RECOMMENDATIONS_CACHE = new Map<string, RecommendationCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق
const MAX_CACHE_SIZE = 100;

function cleanupRecommendationsCache() {
  if (RECOMMENDATIONS_CACHE.size > MAX_CACHE_SIZE) {
    const oldestKey = RECOMMENDATIONS_CACHE.keys().next().value;
    if (oldestKey) {
      RECOMMENDATIONS_CACHE.delete(oldestKey);
    }
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "5", 10), 10);
    
    if (!articleId) {
      return NextResponse.json({
        success: false,
        error: "articleId مطلوب"
      }, { status: 400 });
    }

    // التحقق من الكاش أولاً
    const cached = RECOMMENDATIONS_CACHE.get(articleId);
    const now = Date.now();
    
    if (cached && (now - cached.ts) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        recommendations: cached.recommendations.slice(0, limit),
        cached: true,
        performance: {
          duration: Date.now() - startTime,
          cached: true
        }
      }, {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=600", // 5 دقائق للمتصفح، 10 للـ CDN
          "X-Cache": "HIT"
        }
      });
    }

    await ensureDbConnected();

    // جلب معلومات المقال الحالي بشكل سريع
    const currentArticle = await retryWithConnection(async () =>
      prisma.articles.findUnique({
        where: { id: articleId },
        select: {
          id: true,
          title: true,
          category_id: true,
          published_at: true,
          views: true
        }
      })
    );

    if (!currentArticle) {
      return NextResponse.json({
        success: false,
        error: "المقال غير موجود"
      }, { status: 404 });
    }

    // خوارزمية توصيات سريعة ومحسنة
    const recommendations = await retryWithConnection(async () => {
      const baseQuery = {
        status: "published",
        id: { not: articleId },
        published_at: { lte: new Date() }
      };

      // البحث المرحلي للحصول على أفضل النتائج
      const queries = [
        // 1. نفس التصنيف + عدد مشاهدات عالي
        currentArticle.category_id ? {
          ...baseQuery,
          category_id: currentArticle.category_id,
          views: { gte: 100 }
        } : {
          ...baseQuery,
          views: { gte: 100 }
        },
        
        // 2. نفس التصنيف
        currentArticle.category_id ? {
          ...baseQuery,
          category_id: currentArticle.category_id
        } : {
          ...baseQuery,
          views: { gte: 10 }
        },
        
        // 3. المقالات الشائعة عموماً
        {
          ...baseQuery,
          views: { gte: 50 }
        },
        
        // 4. أحدث المقالات
        baseQuery
      ];

      const allRecommendations: any[] = [];
      
      for (const query of queries) {
        if (allRecommendations.length >= limit * 2) break;
        
        const results = await prisma.articles.findMany({
          where: query,
          orderBy: [
            { views: "desc" },
            { published_at: "desc" }
          ],
          take: limit,
          select: {
            id: true,
            title: true,
            slug: true,
            featured_image: true,
            published_at: true,
            views: true,
            category_id: true,
            excerpt: true
          }
        });
        
        // إضافة النتائج الجديدة فقط (تجنب التكرار)
        for (const result of results) {
          if (!allRecommendations.find(r => r.id === result.id)) {
            allRecommendations.push({
              ...result,
              relevance_score: calculateRelevanceScore(result, currentArticle),
              featured_image: result.featured_image ? optimizeImageUrl(result.featured_image) : null
            });
          }
        }
      }
      
      // ترتيب حسب نقاط الصلة
      return allRecommendations
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, limit);
    });

    // حفظ في الكاش
    cleanupRecommendationsCache();
    RECOMMENDATIONS_CACHE.set(articleId, {
      recommendations,
      ts: now,
      articleId
    });

    const performance = {
      duration: Date.now() - startTime,
      cached: false,
      itemsReturned: recommendations.length,
      algorithm: "optimized_multi_phase"
    };

    return NextResponse.json({
      success: true,
      recommendations,
      performance,
      cached: false
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "X-Cache": "MISS",
        "X-Performance": JSON.stringify(performance)
      }
    });

  } catch (error: any) {
    console.error("❌ [ai-recommendations/optimized] خطأ:", error);
    
    return NextResponse.json({
      success: false,
      recommendations: [],
      error: "خطأ في جلب التوصيات",
      performance: {
        duration: Date.now() - startTime,
        cached: false,
        error: true
      }
    }, { status: 200 }); // نرجع 200 لتجنب كسر الواجهة
  }
}

// حساب نقاط الصلة بشكل مبسط وسريع
function calculateRelevanceScore(article: any, currentArticle: any): number {
  let score = 0;
  
  // نفس التصنيف = 50 نقطة
  if (article.category_id === currentArticle.category_id) {
    score += 50;
  }
  
  // عدد المشاهدات (محدود بـ 30 نقطة)
  score += Math.min(article.views / 100, 30);
  
  // حداثة المقال (حتى 20 نقطة)
  const daysDiff = Math.abs(
    new Date(article.published_at).getTime() - 
    new Date(currentArticle.published_at).getTime()
  ) / (1000 * 60 * 60 * 24);
  
  score += Math.max(20 - daysDiff, 0);
  
  return score;
}

// تحسين URLs الصور
function optimizeImageUrl(imageUrl: string): string {
  try {
    if (!imageUrl.includes("res.cloudinary.com")) return imageUrl;
    
    const [prefix, rest] = imageUrl.split("/upload/");
    if (/^(c_|w_|h_|f_|q_)/.test(rest)) return imageUrl;
    
    const optimization = "c_fill,w_200,h_150,q_auto:low,f_auto";
    return `${prefix}/upload/${optimization}/${rest}`;
  } catch {
    return imageUrl;
  }
}

// API لمسح الكاش
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    
    if (articleId) {
      RECOMMENDATIONS_CACHE.delete(articleId);
    } else {
      RECOMMENDATIONS_CACHE.clear();
    }
    
    return NextResponse.json({
      success: true,
      message: articleId ? `تم مسح كاش المقال ${articleId}` : "تم مسح جميع التوصيات",
      remainingCache: RECOMMENDATIONS_CACHE.size
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "فشل في مسح الكاش"
    }, { status: 500 });
  }
}
