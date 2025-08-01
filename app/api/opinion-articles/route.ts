import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Cache للمقالات
const articleCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cacheKey = 'opinion-articles-' + searchParams.toString();
  
  // التحقق من الكاش أولاً
  const cached = articleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ إرجاع مقالات الرأي من الكاش');
    return NextResponse.json(cached.data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });
  }

  try {
    console.log('🔍 بداية معالجة طلب مقالات الرأي');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status') || 'published';
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'published_at';
    const order = searchParams.get('order') || 'desc';
    const skip = (page - 1) * limit;

    console.log(`🔍 فلترة مقالات الرأي حسب category: ${category_id}`);

    // بناء شروط البحث - مقالات الرأي فقط
    const where: any = {
      // تصفية مقالات الرأي والتحليلات والمقابلات فقط
      article_type: {
        in: ['opinion', 'analysis', 'interview']
      }
    };
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category_id && category_id !== 'all') {
      where.category_id = category_id;
    }
    
    if (search) {
      where.AND = [
        { article_type: { in: ['opinion', 'analysis', 'interview'] } },
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
      // إزالة article_type من where الرئيسي لتجنب التعارض
      delete where.article_type;
    }

    // ترتيب النتائج
    const orderBy: any = {};
    if (sort === 'views') {
      orderBy.views = order;
    } else if (sort === 'likes') {
      orderBy.likes = order;
    } else {
      orderBy.published_at = order;
    }

    console.log('🔍 تنفيذ استعلام مقالات الرأي...');

    // جلب مقالات الرأي مع العد
    const [articles, totalCount] = await Promise.all([
      prisma.articles.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              icon: true
            }
          },
          article_author: {
            select: {
              id: true,
              full_name: true,
              slug: true,
              title: true,
              avatar_url: true,
              specializations: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
      
      prisma.articles.count({ 
        where: Object.fromEntries(
          Object.entries({
            status: status !== 'all' ? status : undefined,
            category_id: (category_id && category_id !== 'all') ? category_id : undefined,
            article_type: { in: ['opinion', 'analysis', 'interview'] }
          }).filter(([_, value]) => value !== undefined)
        )
      })
    ]);

    // إضافة معلومات إضافية
    const enrichedArticles = articles.map(article => ({
      ...article,
      image: article.featured_image,
      category: article.categories,
      // إعطاء أولوية لكاتب المقال الحقيقي من article_authors
      author_name: article.article_author?.full_name || article.author?.name || null,
      author_specialty: article.article_author?.specializations?.[0] || article.article_author?.title || null,
      author_avatar: article.article_author?.avatar_url || article.author?.avatar || null,
      comments_count: 0 // يمكن إضافة عد التعليقات لاحقاً
    }));

    const response = {
      success: true,
      articles: enrichedArticles,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + limit < totalCount
    };

    // حفظ في الكاش
    articleCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    console.log(`✅ تم جلب ${articles.length} مقال رأي من أصل ${totalCount}`);

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب مقالات الرأي:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب مقالات الرأي',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}