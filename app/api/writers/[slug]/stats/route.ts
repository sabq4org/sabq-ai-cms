import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug: rawSlug } = params;
    
    if (!rawSlug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'معرف الكاتب مطلوب' 
        },
        { status: 400 }
      );
    }
    
    // فك ترميز الـ slug للتعامل مع الأسماء العربية
    const slug = decodeURIComponent(rawSlug);
    
    console.log(`📊 جلب إحصائيات الكاتب:`, {
      rawSlug,
      decodedSlug: slug
    });
    
    // البحث عن الكاتب
    const writer = await prisma.article_authors.findFirst({
      where: { 
        slug: slug,
        is_active: true 
      },
      select: {
        id: true,
        full_name: true,
        total_articles: true,
        total_views: true,
        total_likes: true,
        total_shares: true,
        ai_score: true
      }
    });
    
    if (!writer) {
      return NextResponse.json({
        success: false,
        error: 'الكاتب غير موجود'
      }, { status: 404 });
    }

    // جلب الإحصائيات التفصيلية من المقالات
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalArticles,
      thisMonthArticles,
      totalViews,
      totalLikes,
      thisMonthViews,
      topCategories,
      recentActivity
    ] = await Promise.all([
      // إجمالي المقالات المنشورة
      prisma.articles.count({
        where: {
          article_author_id: writer.id,
          status: 'published',
          article_type: { in: ['opinion', 'analysis', 'interview'] }
        }
      }),

      // مقالات هذا الشهر
      prisma.articles.count({
        where: {
          article_author_id: writer.id,
          status: 'published',
          article_type: { in: ['opinion', 'analysis', 'interview'] },
          published_at: { gte: thirtyDaysAgo }
        }
      }),

      // إجمالي المشاهدات
      prisma.articles.aggregate({
        where: {
          article_author_id: writer.id,
          status: 'published',
          article_type: { in: ['opinion', 'analysis', 'interview'] }
        },
        _sum: { views: true }
      }),

      // إجمالي الإعجابات
      prisma.articles.aggregate({
        where: {
          article_author_id: writer.id,
          status: 'published',
          article_type: { in: ['opinion', 'analysis', 'interview'] }
        },
        _sum: { likes: true }
      }),

      // مشاهدات هذا الشهر
      prisma.articles.aggregate({
        where: {
          article_author_id: writer.id,
          status: 'published',
          article_type: { in: ['opinion', 'analysis', 'interview'] },
          published_at: { gte: thirtyDaysAgo }
        },
        _sum: { views: true }
      }),

      // أهم التصنيفات
      prisma.$queryRaw`
        SELECT 
          c.name,
          c.color,
          COUNT(a.id) as count
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.article_author_id = ${writer.id}
          AND a.status = 'published'
          AND a.article_type IN ('opinion', 'analysis', 'interview')
        GROUP BY c.id, c.name, c.color
        ORDER BY count DESC
        LIMIT 5
      `,

      // النشاط الأخير
      prisma.articles.findMany({
        where: {
          article_author_id: writer.id,
          status: 'published',
          article_type: { in: ['opinion', 'analysis', 'interview'] }
        },
        select: {
          id: true,
          title: true,
          published_at: true,
          article_type: true,
          views: true,
          likes: true
        },
        orderBy: { published_at: 'desc' },
        take: 10
      })
    ]);

    // حساب متوسط وقت القراءة
    const avgReadingTimeResult = await prisma.articles.aggregate({
      where: {
        article_author_id: writer.id,
        status: 'published',
        article_type: { in: ['opinion', 'analysis', 'interview'] }
      },
      _avg: { reading_time: true }
    });

    const stats = {
      total_articles: totalArticles,
      total_views: totalViews._sum.views || 0,
      total_likes: totalLikes._sum.likes || 0,
      this_month_articles: thisMonthArticles,
      this_month_views: thisMonthViews._sum.views || 0,
      avg_reading_time: Math.round(avgReadingTimeResult._avg.reading_time || 0),
      
      // نسب الأداء
      avg_views_per_article: totalArticles > 0 
        ? Math.round((totalViews._sum.views || 0) / totalArticles)
        : 0,
      engagement_rate: (totalViews._sum.views || 0) > 0
        ? Math.round(((totalLikes._sum.likes || 0) / (totalViews._sum.views || 1)) * 100 * 100) / 100
        : 0,
      
      // التصنيفات الرئيسية
      top_categories: (topCategories as any[]).map((cat: any) => ({
        name: cat.name || 'غير مصنف',
        count: Number(cat.count),
        color: cat.color || '#3B82F6'
      })),
      
      // النشاط الأخير
      recent_activity: recentActivity.map(article => ({
        type: 'article_published',
        date: article.published_at,
        title: article.title,
        article_type: article.article_type,
        stats: {
          views: article.views,
          likes: article.likes
        }
      }))
    };
    
    console.log(`✅ إحصائيات ${writer.full_name}:`, {
      total_articles: stats.total_articles,
      total_views: stats.total_views,
      total_likes: stats.total_likes
    });
    
    return NextResponse.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الكاتب:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب إحصائيات الكاتب',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}