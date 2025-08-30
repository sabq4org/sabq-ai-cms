import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCachedHomepageArticles, getCachedCategoryArticles } from "@/lib/redis-performance-cache";

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
    where.is_featured = true;
  }

  const orderBy: any = {};
  if (sortBy === 'latest') {
    orderBy.published_at = 'desc';
  } else if (sortBy === 'views') {
    orderBy.views = order;
  } else {
    orderBy[sortBy] = order;
  }

  try {
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

    console.log(`✅ تم جلب ${articles.length} خبر من أصل ${total}`);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ خطأ في جلب الأخبار:', error);
    
    return NextResponse.json({
      success: false,
      articles: [],
      error: 'فشل في جلب الأخبار',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 503 });
  }
}
