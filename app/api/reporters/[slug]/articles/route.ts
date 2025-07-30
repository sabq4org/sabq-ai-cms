import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    
    // معاملات البحث والتصفية
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const dateFilter = searchParams.get('date') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'published_at';
    const sortOrder = searchParams.get('order') || 'desc';

    // البحث عن المراسل أولاً
    const reporter = await prisma.reporters.findUnique({
      where: { slug, is_active: true },
      include: {
        user: true
      }
    });

    if (!reporter) {
      return NextResponse.json(
        { error: 'المراسل غير موجود' },
        { status: 404 }
      );
    }

    // بناء شروط البحث
    const whereConditions: any = {
      author_id: reporter.user_id,
      status: 'published'
    };

    // البحث في العنوان والمحتوى
    if (search) {
      whereConditions.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // تصفية حسب التصنيف
    if (category !== 'all') {
      whereConditions.categories = {
        name: category
      };
    }

    // تصفية حسب التاريخ
    if (dateFilter !== 'all') {
      const now = new Date();
      let dateFrom: Date;
      
      switch (dateFilter) {
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(0);
      }
      
      whereConditions.published_at = {
        gte: dateFrom
      };
    }

    // بناء ترتيب النتائج
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // جلب المقالات
    const articles = await prisma.articles.findMany({
      where: whereConditions,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    // عد إجمالي المقالات (للـ pagination)
    const totalArticles = await prisma.articles.count({
      where: whereConditions
    });

    // تنسيق البيانات
    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featured_image: article.featured_image,
      published_at: article.published_at,
      views: article.views,
      likes: article.likes,
      shares: article.shares,
      reading_time: article.reading_time,
      category: article.categories ? {
        id: article.categories.id,
        name: article.categories.name,
        slug: article.categories.slug,
        color: article.categories.color || '#3B82F6'
      } : null
    }));

    // جلب التصنيفات المتاحة للمراسل
    const categories = await prisma.categories.findMany({
      where: {
        articles: {
          some: {
            author_id: reporter.user_id,
            status: 'published'
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            articles: {
              where: {
                author_id: reporter.user_id,
                status: 'published'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        total: totalArticles,
        limit,
        offset,
        hasMore: offset + limit < totalArticles
      },
      filters: {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count: cat._count.articles
        }))
      }
    });

  } catch (error) {
    console.error('خطأ في جلب مقالات المراسل:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}