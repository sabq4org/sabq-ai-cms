import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // حساب التاريخ بناءً على المدى الزمني
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // بناء شروط البحث
    const whereConditions: any = {
      status: 'published',
      published_at: {
        gte: startDate,
        lte: now
      }
    };

    if (category) {
      whereConditions.category_id = category;
    }

    // جلب المقالات مع بيانات الفئة
    const articles = await prisma.articles.findMany({
      where: whereConditions,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
          }
        }
      },
      orderBy: [
        { views: 'desc' },
        { published_at: 'desc' }
      ],
      take: limit,
      skip: (page - 1) * limit
    });

    // حساب إجمالي المقالات
    const totalArticles = await prisma.articles.count({
      where: whereConditions
    });

    // جلب إحصائيات الفئات
    const categoryStats = await prisma.categories.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        icon: true,
        _count: {
          select: {
            articles: {
              where: {
                status: 'published',
                published_at: {
                  gte: startDate,
                  lte: now
                }
              }
            }
          }
        }
      },
      orderBy: {
        articles: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // تحليل الاتجاهات
    const trendingTopics = await prisma.articles.findMany({
      where: {
        status: 'published',
        published_at: {
          gte: startDate,
          lte: now
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        categories: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        views: 'desc'
      },
      take: 5
    });

    // حساب معدلات النمو
    const previousPeriodStart = new Date(startDate);
    const periodDuration = now.getTime() - startDate.getTime();
    previousPeriodStart.setTime(startDate.getTime() - periodDuration);

    const currentPeriodCount = await prisma.articles.count({
      where: {
        status: 'published',
        published_at: {
          gte: startDate,
          lte: now
        }
      }
    });

    const previousPeriodCount = await prisma.articles.count({
      where: {
        status: 'published',
        published_at: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    const growthRate = previousPeriodCount > 0 
      ? ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100 
      : 0;

    // تجميع البيانات
    const insights = {
      summary: {
        totalArticles: currentPeriodCount,
        growthRate: Math.round(growthRate * 100) / 100,
        timeRange,
        period: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      },
      articles: articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        image: article.featured_image,
        views: article.views || 0,
        category: article.categories,
        publishedAt: article.published_at,
        breaking: article.breaking || false
      })),
      categories: categoryStats.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        icon: cat.icon,
        articleCount: cat._count.articles
      })),
      trending: trendingTopics.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        views: topic.views || 0,
        category: topic.categories
      })),
      pagination: {
        page,
        limit,
        total: totalArticles,
        hasMore: (page * limit) < totalArticles,
        totalPages: Math.ceil(totalArticles / limit)
      }
    };

    return NextResponse.json({
      success: true,
      data: insights
    });

  } catch (error: any) {
    console.error('خطأ في جلب التحليلات العميقة:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'فشل في جلب التحليلات العميقة',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
