import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// إعدادات Cache للأداء الأمثل
const CACHE_DURATION = 300; // 5 دقائق
const CACHE_HEADER = `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // معاملات البحث
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 50);
    const categoryId = searchParams.get('category_id');
    const sort = (searchParams.get('sort') || 'published_at') as keyof any; // سنحول الحقل ديناميكياً
    const orderParam = (searchParams.get('order') || 'desc').toLowerCase();
    const order: 'asc' | 'desc' = orderParam === 'asc' ? 'asc' : 'desc';
    const status = searchParams.get('status') || 'published';

    // بناء شروط البحث
    const where: any = { status };
    if (categoryId) {
      const catIdNum = Number(categoryId);
      where.category_id = Number.isNaN(catIdNum) ? categoryId : catIdNum;
    }

    // الحقول المسموح بها للترتيب لحماية الاستعلام
    const allowedSortFields = new Set([
      'published_at', 'created_at', 'views', 'breaking', 'title'
    ]);
    const orderBy = allowedSortFields.has(String(sort))
      ? { [String(sort)]: order }
      : { published_at: 'desc' as const };

    // جلب البيانات مع تحسينات الأداء
    const [articles, total] = await Promise.all([
      prisma.articles.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          featured_image: true,
          views: true,
          published_at: true,
          created_at: true,
          breaking: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.articles.count({ where }),
    ]);

    // تنسيق البيانات
    const formattedArticles = (articles as any[]).map((article) => ({
      ...article,
      category_name: article?.categories?.name ?? null,
      author_name: article?.author?.name ?? null,
      views_count: article?.views ?? 0,
    }));

    // إرسال الاستجابة مع headers التخزين المؤقت
    return NextResponse.json(
      {
        success: true,
        articles: formattedArticles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      {
        headers: {
          'Cache-Control': CACHE_HEADER,
          'CDN-Cache-Control': CACHE_HEADER,
          'Vercel-CDN-Cache-Control': CACHE_HEADER,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
        articles: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
