import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('📰 بدء جلب الأخبار...');
  
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');
  const status = searchParams.get('status') || 'published';
  const sortBy = searchParams.get('sortBy') || 'published_at';
  const order = searchParams.get('order') || 'desc';
  const featured = searchParams.get('featured') === 'true';
  const offset = (page - 1) * limit;

  const where: any = {};

  // إضافة شرط الحالة فقط إذا لم تكن "all"
  if (status && status !== 'all') {
    where.status = status;
  }

  if (category) {
    where.category_id = category;
  }

  if (featured) {
    where.featured = true;
  }

  // تحديد ترتيب النتائج
  const orderBy: any = {};
  if (sortBy === 'latest') {
    orderBy.published_at = 'desc';
  } else if (sortBy === 'published_at') {
    orderBy.published_at = order;
  } else if (sortBy === 'views') {
    orderBy.views = order;
  } else {
    orderBy.published_at = 'desc';
  }

  const result = await safeQuery(async () => {
    const [articles, total] = await Promise.all([
      prisma.articles.findMany({
        where,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          // إضافة معلومات المؤلف
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              interactions: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.articles.count({ where })
    ]);

    return { articles, total };
  }, { articles: [], total: 0 });

  if (result.success && result.data) {
    console.log(`✅ تم جلب ${result.data.articles.length} خبر من أصل ${result.data.total}`);

    return NextResponse.json({
      success: true,
      articles: result.data.articles || [],
      pagination: {
        page,
        limit,
        total: result.data.total,
        pages: Math.ceil(result.data.total / limit)
      },
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn('❌ خطأ في جلب الأخبار:', result.error);
    
    return NextResponse.json({
      success: false,
      articles: [],
      error: result.error || 'فشل في جلب الأخبار',
      details: process.env.NODE_ENV === 'development' ? result.error : undefined
    }, { status: 503 });
  }
}
