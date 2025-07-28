import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { dbConnectionManager } from '@/lib/db-connection-manager';

// Cache في الذاكرة
const articleCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // دقيقة واحدة

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cacheKey = searchParams.toString();
  
  // التحقق من الكاش أولاً
  const cached = articleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ إرجاع المقالات من الكاش');
    return NextResponse.json(cached.data, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });
  }

  try {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 200);
    const status = searchParams.get('status') || 'published';
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'published_at';
    const order = searchParams.get('order') || 'desc';
    const skip = (page - 1) * limit;

    console.log(`🔍 فلترة المقالات حسب category: ${category_id}`);

    // بناء شروط البحث
    const where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }
    
    if (category_id && category_id !== 'all') {
      where.category_id = category_id;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } }
      ];
    }

    // إنشاء ترتيب ديناميكي
    const orderBy: any = {};
    orderBy[sort] = order;

    // جلب المقالات مع العد بشكل متوازي
    const [articles, totalCount] = await Promise.all([
      dbConnectionManager.executeWithConnection(async () => {
        return await prisma.articles.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            categories: {
              select: {
                id: true,
                name: true,
                slug: true
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
        });
      }),
      
      dbConnectionManager.executeWithConnection(async () => {
        return await prisma.articles.count({ where });
      })
    ]);

    // إضافة معلومات إضافية
    const enrichedArticles = articles.map(article => ({
      ...article,
      image: article.featured_image,
      category: article.categories,
      author_name: article.author?.name || null,
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
    articleCache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    // تنظيف الكاش القديم
    if (articleCache.size > 100) {
      const oldestKey = Array.from(articleCache.keys())[0];
      articleCache.delete(oldestKey);
    }

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب المقالات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب المقالات',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// إنشاء مقال جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const article = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.create({
        data: {
          ...data,
          id: data.id || generateId(),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    })
    
    return NextResponse.json({
      success: true,
      article
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المقال:', error)
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}

// دالة مساعدة لتوليد ID
function generateId() {
  return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
