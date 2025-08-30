import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { toWesternDigits, parseNormalizedInt } from '@/lib/locale';

// إعدادات Cache للأداء الأمثل
const CACHE_DURATION = 300; // 5 دقائق
const CACHE_HEADER = `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // معاملات البحث
    // Normalize possible Eastern Arabic digits in query params
    const page = Math.max(1, parseNormalizedInt(searchParams.get('page') || '1', 1));
    const limit = Math.min(Math.max(1, parseNormalizedInt(searchParams.get('limit') || '20', 20)), 50);
    const rawCategoryId = searchParams.get('category_id');
    const categoryId = rawCategoryId ? toWesternDigits(rawCategoryId) : null;
    const sort = (searchParams.get('sort') || 'published_at') as keyof any; // سنحول الحقل ديناميكياً
    const orderParam = (searchParams.get('order') || 'desc').toLowerCase();
    const order: 'asc' | 'desc' = orderParam === 'asc' ? 'asc' : 'desc';
    const status = searchParams.get('status') || 'published';
    const compact = searchParams.get('compact') === 'true';
    const fieldsParam = searchParams.get('fields');
    const fields = fieldsParam ? new Set(fieldsParam.split(',').map((s) => s.trim())) : null;
    const excludeFeatured = searchParams.get('exclude_featured') === 'true';
    const excludeBreaking = searchParams.get('exclude_breaking') === 'true';

    // بناء شروط البحث
    const where: any = { status };
    if (categoryId) {
      const catIdNum = Number(categoryId);
      where.category_id = Number.isNaN(catIdNum) ? categoryId : catIdNum;
    }
    if (excludeFeatured) where.featured = false;
    if (excludeBreaking) where.breaking = false;

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
          title: toWesternDigits(a.title),
          slug: a.slug,
          featured_image: a.featured_image,
          views: a.views ?? 0,
          published_at: a.published_at ? new Date(a.published_at).toISOString() : null,
          created_at: a.created_at ? new Date(a.created_at).toISOString() : null,
          breaking: a.breaking ?? false,
          category: a?.categories
            ? { id: a.categories.id, name: toWesternDigits(a.categories.name), slug: a.categories.slug, color: a.categories.color }
            : null,
          author: a?.author ? { id: a.author.id, name: toWesternDigits(a.author.name) } : null,
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
      // استجابة متوافقة مع السابق مع فرض التاريخ الميلادي والأرقام الغربية
      formattedArticles = (articles as any[]).map((article) => ({
        ...article,
        title: toWesternDigits(article.title),
        published_at: article.published_at ? new Date(article.published_at).toISOString() : null,
        created_at: article.created_at ? new Date(article.created_at).toISOString() : null,
        category_name: article?.categories?.name ? toWesternDigits(article.categories.name) : null,
        author_name: article?.author?.name ? toWesternDigits(article.author.name) : null,
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
          // Hint language for number formatting consumers
          'Content-Language': 'en-US',
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
