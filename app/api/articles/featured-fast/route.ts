import { NextRequest, NextResponse } from 'next/server';
import UnifiedFeaturedManager from '@/lib/services/unified-featured-manager';
import { processArticleImage } from '@/lib/image-utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '3'), 10);
    
    console.log(`🔄 [Featured Fast API] Using unified system - requested ${limit} articles`);
    
    // استخدام النظام الموحد
    const result = await UnifiedFeaturedManager.getFeaturedArticles(limit, 'full');
    
    // تحويل البيانات لتتوافق مع featured-fast API
    const processedArticles = result.articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      // معالجة الصورة المميزة (النظام الموحد يعالجها بالفعل، لكن نضيف معالجة إضافية)
      featured_image: processArticleImage(article.featured_image, article.title, 'featured'),
      social_image: processArticleImage(article.featured_image, article.title, 'article'),
      breaking: article.breaking,
      featured: article.featured,
      status: 'published', // المقالات المرجعة من النظام الموحد منشورة بالفعل
      published_at: article.published_at,
      views: article.views,
    }));
    
    console.log(`✅ [Featured Fast API] Unified success: ${processedArticles.length} articles from ${result.source}, cached: ${result.cached}`);
    
    const payload = {
      success: true,
      data: processedArticles,
      message: 'تم جلب الأخبار المميزة عبر النظام الموحد',
      source: result.source,
      cached: result.cached,
    };
    
    // Headers موحدة للتحكم في Cache
    const headers = {
      "Cache-Control": result.cached 
        ? "public, max-age=300, s-maxage=600, stale-while-revalidate=1800"
        : "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      "Content-Type": "application/json",
      "X-Cache": result.cached ? "HIT" : "MISS",
      "X-Source": result.source,
      "X-Unified-API": "v1",
      "X-Featured-Fast": "true",
    };
    
    return NextResponse.json(payload, { headers });
    
  } catch (error) {
    console.error('❌ [Featured Fast API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        data: [], 
        error: 'حدث خطأ في جلب الأخبار المميزة', 
        details: error instanceof Error ? error.message : String(error),
        fallback: true,
      },
      { 
        status: 500,
        headers: {
          "X-Error": "true",
          "X-Featured-Fast": "true",
        }
      }
    );
  }
}
