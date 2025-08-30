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
    const compact = searchParams.get('compact') === 'true';
    const fieldsParam = searchParams.get('fields');
    const fields = fieldsParam ? new Set(fieldsParam.split(',').map((s) => s.trim())) : null;

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

    // ترتيب ثابت لتجنب تكرار/فقد عناصر بين الصفحات
    const orderBy: any[] = [];
    if (allowedSortFields.has(String(sort))) {
      orderBy.push({ [String(sort)]: order });
    } else {
      orderBy.push({ published_at: 'desc' as const });
    }
    // أربِط بترتيب ثانوي لتثبيت النتائج
    if (String(sort) !== 'published_at') orderBy.push({ published_at: 'desc' as const });
    orderBy.push({ created_at: 'desc' as const });
    orderBy.push({ id: 'desc' as const });

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
    let formattedArticles: any[];
    if (compact) {
      // استجابة مضغوطة: حقول أساسية فقط مع كائنات مبسطة للفئات والكاتب
      formattedArticles = (articles as any[]).map((a) => {
        const base: any = {
          id: a.id,
          title: a.title,
          slug: a.slug,
          featured_image: a.featured_image,
          views: a.views ?? 0,
          published_at: a.published_at,
          created_at: a.created_at,
          breaking: a.breaking ?? false,
          category: a?.categories
            ? { id: a.categories.id, name: a.categories.name, slug: a.categories.slug, color: a.categories.color }
            : null,
          author: a?.author ? { id: a.author.id, name: a.author.name } : null,
        };
        if (fields && fields.size > 0) {
          const picked: any = {};
          for (const f of fields) {
            // دعم الوصول المتداخل البسيط category.name/author.name لاحقاً إذا لزم
            if (f in base) picked[f] = base[f];
            else if (f === 'category' && base.category) picked['category'] = base.category;
            else if (f === 'author' && base.author) picked['author'] = base.author;
          }
          return picked;
        }
        return base;
      });
    } else {
      // استجابة متوافقة مع السابق
      formattedArticles = (articles as any[]).map((article) => ({
        ...article,
        category_name: article?.categories?.name ?? null,
        author_name: article?.author?.name ?? null,
        views_count: article?.views ?? 0,
      }));
    }

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
