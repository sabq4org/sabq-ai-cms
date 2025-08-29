import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// إعدادات Cache للأداء الأمثل
const CACHE_DURATION = 300; // 5 دقائق
const CACHE_HEADER = `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // معاملات البحث
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const categoryId = searchParams.get('category_id');
    const sort = searchParams.get('sort') || 'published_at';
    const order = searchParams.get('order') || 'desc';
    const status = searchParams.get('status') || 'published';

    // بناء شروط البحث
    const where: any = { status };
    if (categoryId) {
      where.category_id = parseInt(categoryId);
    }

    // جلب البيانات مع تحسينات الأداء
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          views: true,
          published_at: true,
          created_at: true,
          is_breaking: true,
          category: {
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
              name: true
            }
          }
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where })
    ]);

    // تنسيق البيانات
    const formattedArticles = articles.map(article => ({
      ...article,
      category_name: article.category?.name,
      author_name: article.author?.name,
      views_count: article.views
    }));

    // إرسال الاستجابة مع headers التخزين المؤقت
    return NextResponse.json(
      {
        success: true,
        articles: formattedArticles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      {
        headers: {
          'Cache-Control': CACHE_HEADER,
          'CDN-Cache-Control': CACHE_HEADER,
          'Vercel-CDN-Cache-Control': CACHE_HEADER,
        }
      }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch articles',
        articles: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
