import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache للإحصائيات
const statsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    console.log(`📊 طلب إحصائيات التصنيف: ${categoryId}`);

    // التحقق من الكاش
    const cacheKey = `category_stats_${categoryId}`;
    const cached = statsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ إرجاع إحصائيات التصنيف من الكاش');
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        }
      });
    }

    // التحقق من وجود التصنيف
    const category = await prisma.categories.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { slug: categoryId }
        ],
        is_active: true
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'التصنيف غير موجود أو غير نشط'
      }, { status: 404 });
    }

    console.log(`✅ التصنيف موجود: ${category.name}`);

    // جلب الإحصائيات بشكل متوازي
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalLikes,
      totalShares,
      mostViewedArticle,
      latestArticle,
      weeklyArticles
    ] = await Promise.all([
      // إجمالي المقالات
      prisma.articles.count({
        where: {
          category_id: category.id,
          article_type: 'news'
        }
      }),
      
      // المقالات المنشورة
      prisma.articles.count({
        where: {
          category_id: category.id,
          status: 'published',
          article_type: 'news'
        }
      }),
      
      // المسودات
      prisma.articles.count({
        where: {
          category_id: category.id,
          status: 'draft',
          article_type: 'news'
        }
      }),
      
      // إجمالي المشاهدات
      prisma.articles.aggregate({
        where: {
          category_id: category.id,
          status: 'published',
          article_type: 'news'
        },
        _sum: {
          views: true
        }
      }),
      
      // إجمالي الإعجابات
      prisma.articles.aggregate({
        where: {
          category_id: category.id,
          status: 'published',
          article_type: 'news'
        },
        _sum: {
          likes: true
        }
      }),
      
      // إجمالي المشاركات
      prisma.articles.aggregate({
        where: {
          category_id: category.id,
          status: 'published',
          article_type: 'news'
        },
        _sum: {
          shares: true
        }
      }),
      
      // أكثر المقالات مشاهدة
      prisma.articles.findFirst({
        where: {
          category_id: category.id,
          status: 'published',
          article_type: 'news'
        },
        select: {
          id: true,
          title: true,
          views: true,
          slug: true
        },
        orderBy: {
          views: 'desc'
        }
      }),
      
      // أحدث مقال
      prisma.articles.findFirst({
        where: {
          category_id: category.id,
          status: 'published',
          article_type: 'news'
        },
        select: {
          id: true,
          title: true,
          published_at: true,
          slug: true
        },
        orderBy: {
          published_at: 'desc'
        }
      }),
      
      // المقالات الأسبوعية (آخر 7 أيام)
      prisma.articles.count({
        where: {
          category_id: category.id,
          status: 'published',
          article_type: 'news',
          published_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // حساب متوسط المشاهدات
    const averageViews = publishedArticles > 0 
      ? Math.round((totalViews._sum.views || 0) / publishedArticles) 
      : 0;

    // إحصائيات إضافية
    const monthlyArticles = await prisma.articles.count({
      where: {
        category_id: category.id,
        status: 'published',
        article_type: 'news',
        published_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // أفضل 5 مقالات حسب المشاهدات
    const topArticles = await prisma.articles.findMany({
      where: {
        category_id: category.id,
        status: 'published',
        article_type: 'news'
      },
      select: {
        id: true,
        title: true,
        views: true,
        likes: true,
        slug: true,
        published_at: true
      },
      orderBy: {
        views: 'desc'
      },
      take: 5
    });

    // بناء الاستجابة
    const stats = {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      },
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
        weekly: weeklyArticles,
        monthly: monthlyArticles
      },
      engagement: {
        totalViews: totalViews._sum.views || 0,
        totalLikes: totalLikes._sum.likes || 0,
        totalShares: totalShares._sum.shares || 0,
        averageViews
      },
      highlights: {
        mostViewed: mostViewedArticle,
        latest: latestArticle,
        topArticles
      },
      performance: {
        engagementRate: publishedArticles > 0 
          ? ((totalLikes._sum.likes || 0) / publishedArticles).toFixed(2) 
          : 0,
        viewsPerArticle: averageViews,
        weeklyGrowth: weeklyArticles,
        monthlyGrowth: monthlyArticles
      }
    };

    const response = {
      success: true,
      data: stats,
      cached: false,
      timestamp: new Date().toISOString()
    };

    // حفظ في الكاش
    statsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    console.log(`📊 إحصائيات التصنيف "${category.name}":`, {
      articles: publishedArticles,
      views: totalViews._sum.views,
      likes: totalLikes._sum.likes
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات التصنيف:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الإحصائيات',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
    
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}