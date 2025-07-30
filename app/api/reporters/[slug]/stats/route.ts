import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

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

    // الحصول على إحصائيات المقالات
    const articles = await prisma.articles.findMany({
      where: {
        author_id: reporter.user_id,
        status: 'published'
      },
      include: {
        categories: true
      },
      orderBy: {
        published_at: 'desc'
      }
    });

    // حساب الإحصائيات الأساسية
    const totalArticles = articles.length;
    const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
    const totalLikes = articles.reduce((sum, article) => sum + article.likes, 0);
    const totalShares = articles.reduce((sum, article) => sum + article.shares, 0);
    const totalEngagement = totalLikes + totalShares;

    // حساب المشاهدات الأسبوعية والشهرية
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyArticles = articles.filter(article => 
      article.published_at && new Date(article.published_at) >= oneWeekAgo
    );
    const monthlyArticles = articles.filter(article => 
      article.published_at && new Date(article.published_at) >= oneMonthAgo
    );

    const weeklyViews = weeklyArticles.reduce((sum, article) => sum + article.views, 0);
    const monthlyViews = monthlyArticles.reduce((sum, article) => sum + article.views, 0);

    // حساب معدل التفاعل
    const avgEngagementRate = totalViews > 0 ? (totalEngagement / totalViews) : 0;

    // تحليل التصنيفات
    const categoryStats = articles.reduce((acc, article) => {
      if (article.categories) {
        const categoryName = article.categories.name;
        acc[categoryName] = (acc[categoryName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryStats)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalArticles) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // أحدث المقالات (آخر 10)
    const recentArticles = articles.slice(0, 10).map(article => ({
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
        name: article.categories.name,
        color: '#3B82F6' // لون افتراضي
      } : null
    }));

    // الأكثر مشاهدة (أفضل 10)
    const popularArticles = [...articles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(article => ({
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
          name: article.categories.name,
          color: '#3B82F6'
        } : null
      }));

    // المواضيع الرائجة (من العناوين والمحتوى)
    const trendingTopics = extractTrendingTopics(articles);

    // تحديث الإحصائيات في جدول المراسلين
    await prisma.reporters.update({
      where: { id: reporter.id },
      data: {
        total_articles: totalArticles,
        total_views: totalViews,
        total_likes: totalLikes,
        total_shares: totalShares,
        engagement_rate: avgEngagementRate,
        updated_at: new Date()
      }
    });

    const stats = {
      weeklyViews,
      monthlyViews,
      totalEngagement,
      avgEngagementRate,
      topCategories,
      recentArticles,
      popularArticles,
      trendingTopics
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('خطأ في جلب إحصائيات المراسل:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// دالة لاستخراج المواضيع الرائجة من المقالات
function extractTrendingTopics(articles: any[]): string[] {
  const topics: Record<string, number> = {};
  
  articles.forEach(article => {
    // استخراج كلمات مفتاحية من العنوان
    const titleWords = article.title
      .split(' ')
      .filter((word: string) => word.length > 3)
      .slice(0, 3);
    
    titleWords.forEach((word: string) => {
      const cleanWord = word.replace(/[^\u0600-\u06FF\w]/g, '');
      if (cleanWord.length > 2) {
        topics[cleanWord] = (topics[cleanWord] || 0) + 1;
      }
    });
  });

  return Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([topic]) => topic);
}