import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ArticleInsight {
  id: string;
  title: string;
  slug: string;
  category: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  growthRate: number; // نسبة النمو بالساعة
  trendingScore: number; // درجة الترند
  insightTag: string; // وسم ذكي
  insightColor: string; // لون الوسم
  icon: string; // أيقونة مناسبة
  publishedAt: Date;
}

async function calculateInsights(): Promise<ArticleInsight[]> {
  const cache = await getRedisClient();
  const cacheKey = 'ai-insights:v1';
  
  // محاولة جلب من الكاش
  try {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Cache error:', error);
  }

  // جلب المقالات مع إحصائياتها
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      published_at: {
        not: null
      }
    },
    include: {
      interactions: {
        where: {
          created_at: {
            gte: new Date(Date.now() - 3 * 60 * 60 * 1000) // آخر 3 ساعات
          }
        }
      },
      comments: true,
      category: true
    },
    orderBy: {
      published_at: 'desc'
    },
    take: 50
  });

  // حساب المؤشرات الذكية
  const insights: ArticleInsight[] = articles.map(article => {
    // حساب المشاهدات والتفاعلات
    const recentViews = article.interactions.filter(i => i.type === 'view').length;
    const recentLikes = article.interactions.filter(i => i.type === 'like').length;
    const totalViews = article.view_count || 0;
    const totalLikes = article.like_count || 0;
    const totalComments = article.comments.length;
    const totalShares = article.share_count || 0;
    
    // حساب معدل النمو (مشاهدات آخر 3 ساعات مقابل المعدل)
    const avgHourlyViews = totalViews / Math.max(1, 
      Math.floor((Date.now() - new Date(article.published_at!).getTime()) / (1000 * 60 * 60))
    );
    const growthRate = recentViews > 0 ? (recentViews / 3 - avgHourlyViews) / Math.max(1, avgHourlyViews) * 100 : 0;
    
    // حساب درجة الترند
    const trendingScore = 
      (recentViews * 10) + 
      (recentLikes * 50) + 
      (totalComments * 30) + 
      (totalShares * 40) +
      (growthRate > 50 ? 100 : growthRate);
    
    // تحديد الوسم الذكي
    let insightTag = '';
    let insightColor = '';
    let icon = '';
    
    if (recentViews > 1000 || totalViews > 10000) {
      insightTag = 'الأكثر قراءة';
      insightColor = 'text-red-600 bg-red-50';
      icon = '🔥';
    } else if (growthRate > 100) {
      insightTag = 'صاعد بقوة';
      insightColor = 'text-orange-600 bg-orange-50';
      icon = '📈';
    } else if (totalComments > 50) {
      insightTag = 'الأكثر نقاشاً';
      insightColor = 'text-blue-600 bg-blue-50';
      icon = '💬';
    } else if (totalShares > 100) {
      insightTag = 'الأكثر مشاركة';
      insightColor = 'text-green-600 bg-green-50';
      icon = '🔄';
    } else if (recentLikes > 50) {
      insightTag = 'محبوب';
      insightColor = 'text-pink-600 bg-pink-50';
      icon = '❤️';
    } else if (article.published_at && 
      (Date.now() - new Date(article.published_at).getTime()) < 60 * 60 * 1000) {
      insightTag = 'جديد';
      insightColor = 'text-purple-600 bg-purple-50';
      icon = '⚡';
    } else {
      insightTag = 'مميز';
      insightColor = 'text-gray-600 bg-gray-50';
      icon = '⭐';
    }
    
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category?.name || 'عام',
      viewCount: totalViews,
      likeCount: totalLikes,
      commentCount: totalComments,
      shareCount: totalShares,
      growthRate,
      trendingScore,
      insightTag,
      insightColor,
      icon,
      publishedAt: article.published_at!
    };
  });
  
  // ترتيب حسب درجة الترند
  insights.sort((a, b) => b.trendingScore - a.trendingScore);
  
  // أخذ أفضل 10
  const topInsights = insights.slice(0, 10);
  
  // حفظ في الكاش لمدة 3 دقائق
  try {
    await cache.setex(cacheKey, 180, JSON.stringify(topInsights));
  } catch (error) {
    console.error('Cache save error:', error);
  }
  
  return topInsights;
}

export async function GET(request: NextRequest) {
  try {
    const insights = await calculateInsights();
    
    return NextResponse.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    console.error('AI Insights error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
