import { NextRequest, NextResponse } from 'next/server'
import { prisma, ensureConnection } from '@/lib/prisma'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis-improved'

// تحسين CORS headers
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// دالة لإضافة cache headers
function setCacheHeaders(response: NextResponse, seconds: number): NextResponse {
  response.headers.set('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=60`);
  response.headers.set('CDN-Cache-Control', `max-age=${seconds}`);
  response.headers.set('Vercel-CDN-Cache-Control', `max-age=${seconds}`);
  return response;
}

// دالة cache محسنة
async function getCachedArticles(cacheKey: string, fetcher: () => Promise<any>, ttl: number = 180) {
  try {
    // محاولة جلب من cache أولاً
    const cached = await cache.get(cacheKey);
    if (cached && cached !== 'null') {
      console.log('✅ تم جلب المقالات من Redis cache - سرعة فائقة!');
      return { data: cached, fromCache: true };
    }
  } catch (error) {
    console.warn('⚠️ خطأ في Redis cache:', error);
  }

  // جلب من قاعدة البيانات إذا لم توجد في cache
  const data = await fetcher();
  
  // حفظ في cache
  try {
    await cache.set(cacheKey, data, ttl);
  } catch (error) {
    console.warn('⚠️ فشل في حفظ البيانات في cache:', error);
  }

  return { data, fromCache: false };
}

// معالج OPTIONS للـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, Accept',
    },
  });
}

// معالج GET محسن للغاية
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // التحقق من اتصال قاعدة البيانات
    await ensureConnection();
    
    console.log('🔍 بدء معالجة طلب المقالات المحسن...');
    const { searchParams } = new URL(request.url);
    
    // استخراج المعاملات
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '16')));
    const status = searchParams.get('status') || 'published';
    const categoryId = searchParams.get('category_id');
    const sortBy = searchParams.get('sortBy') || 'published_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // إنشاء cache key محسن
    const cacheKey = `articles:${status}:${categoryId || 'all'}:${sortBy}:${order}:${page}:${limit}`;

    // بناء شروط البحث المحسنة
    const where: any = {};
    
    // إضافة فلترة الحالة
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (categoryId && categoryId !== 'all') {
      where.category_id = categoryId;
    }

    // ترتيب محسن
    let orderBy: any = {};
    if (sortBy === 'views') {
      orderBy = { views: order };
    } else if (sortBy === 'latest' || sortBy === 'published_at') {
      orderBy = { published_at: order };
    } else {
      orderBy = { [sortBy]: order };
    }

    // جلب البيانات من cache أو قاعدة البيانات
    const { data: result, fromCache } = await getCachedArticles(
      cacheKey,
      async () => {
        const queryStart = Date.now();
        console.log('⚡ بدء جلب المقالات من قاعدة البيانات...');
        
        const skip = (page - 1) * limit;

        // جلب المقالات والعدد بالتوازي
        const [articles, totalCount] = await Promise.all([
          prisma.articles.findMany({
            where,
            select: {
              // حقول أساسية فقط لتحسين السرعة
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              published_at: true,
              created_at: true,
              featured_image: true,
              views: true,
              likes: true,
              shares: true,
              saves: true,
              featured: true,
              breaking: true,
              reading_time: true,
              status: true,
              author_id: true,
              category_id: true,
              metadata: true
            },
            orderBy,
            take: limit,
            skip
          }),
          
          // عد سريع
          prisma.articles.count({ where })
        ]);

        // معالجة البيانات
        const processedArticles = articles.map(article => {
          const metadata = (article.metadata || {}) as any;
          return {
            ...article,
            author: {
              id: article.author_id || 'unknown',
              name: metadata.author_name || 'فريق التحرير'
            },
            author_name: metadata.author_name || 'فريق التحرير',
            category_id: article.category_id,
            is_featured: article.featured || false,
            is_breaking: article.breaking || false,
            views_count: article.views || 0
          };
        });

        const queryEnd = Date.now();
        console.log(`✅ تم جلب المقالات في ${queryEnd - queryStart}ms`);
        
        return {
          articles: processedArticles,
          total: totalCount,
          page,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page * limit < totalCount
        };
      },
      180 // 3 minutes cache
    );

    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);
    
    console.log(`✅ تم جلب ${result.articles?.length || 0} مقال في ${processingTime}ms`);
    
    if (processingTime > 1000) {
      console.warn(`⚠️ بطء في الأداء: ${processingTime}ms`);
    }

    // إنشاء الاستجابة مع headers محسنة
    const response = NextResponse.json({
      success: true,
      data: result.articles,
      articles: result.articles, // للتوافق
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        hasMore: result.hasMore
      },
      meta: {
        processingTime,
        cached: fromCache
      }
    });

    // Cache headers
    if (fromCache) {
      response.headers.set('X-Cached', 'HIT');
    } else {
      setCacheHeaders(response, 180);
    }

    return addCorsHeaders(response);

  } catch (error: any) {
    console.error('❌ خطأ في API المقالات:', error);
    
    const response = NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب المقالات',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });

    return addCorsHeaders(response);
  }
}

// دالة تنظيف cache (للاستخدام عند التحديث)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern') || 'articles:*';
    
    // استخدام clearPattern بدلاً من keys
    await cache.clearPattern(pattern);
    console.log(`🗑️ تم مسح cache بنمط: ${pattern}`);

    return addCorsHeaders(NextResponse.json({
      success: true,
      message: `تم مسح cache بنمط: ${pattern}`,
      pattern
    }));
  } catch (error: any) {
    console.error('❌ خطأ في مسح cache:', error);
    return addCorsHeaders(NextResponse.json({
      success: false,
      error: 'فشل في مسح cache'
    }, { status: 500 }));
  }
}
