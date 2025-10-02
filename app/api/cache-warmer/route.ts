/**
 * API لتسخين Cache للمقالات الشائعة
 * يُستدعى دورياً عبر Cron Job أو يدوياً
 */

import { NextRequest, NextResponse } from 'next/server';
import { warmUpPopularArticlesCache } from '@/lib/article-cache-optimized';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cache-warmer
 * يقوم بتسخين Cache للمقالات الشائعة
 * 
 * Query Parameters:
 * - token: توكن للمصادقة (optional، موصى به في production)
 * 
 * Example:
 * curl -X GET "https://sabq.io/api/cache-warmer?token=your-secret-token"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // المصادقة (optional لكن موصى به)
  const token = searchParams.get('token');
  const expectedToken = process.env.CACHE_WARMER_TOKEN;
  
  if (expectedToken && token !== expectedToken) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or missing token'
      },
      { status: 401 }
    );
  }
  
  try {
    const startTime = performance.now();
    
    console.log('🔥 [Cache Warmer] Starting cache warmup...');
    
    // تنفيذ عملية التسخين
    const result = await warmUpPopularArticlesCache();
    
    const duration = performance.now() - startTime;
    
    console.log(`✅ [Cache Warmer] Completed in ${duration.toFixed(0)}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'Cache warmup completed successfully',
      stats: {
        totalArticles: result.total,
        warmedArticles: result.warmed,
        durationMs: Math.round(duration),
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('❌ [Cache Warmer] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Cache warmup failed',
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cache-warmer
 * يسمح بتسخين مقالات محددة
 * 
 * Body:
 * {
 *   "slugs": ["article-1-slug", "article-2-slug", ...]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slugs = [] } = body;
    
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          message: 'slugs array is required and must not be empty'
        },
        { status: 400 }
      );
    }
    
    const startTime = performance.now();
    
    console.log(`🔥 [Cache Warmer] Warming ${slugs.length} specific articles...`);
    
    // استيراد الدالة المناسبة
    const { getArticleWithCache, getRelatedArticlesWithCache } = await import('@/lib/article-cache-optimized');
    
    let warmed = 0;
    const errors: string[] = [];
    
    for (const slug of slugs) {
      try {
        const article = await getArticleWithCache(slug);
        if (article) {
          // تسخين Related أيضاً
          await getRelatedArticlesWithCache(article.id, article.categories?.id || '', 6);
          warmed++;
        }
      } catch (error: any) {
        console.error(`❌ [Cache Warmer] Error warming ${slug}:`, error);
        errors.push(`${slug}: ${error.message}`);
      }
    }
    
    const duration = performance.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: `Warmed ${warmed}/${slugs.length} articles`,
      stats: {
        totalRequested: slugs.length,
        warmedSuccessfully: warmed,
        errors: errors.length,
        durationMs: Math.round(duration),
      },
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('❌ [Cache Warmer] POST Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Cache warmup failed',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

