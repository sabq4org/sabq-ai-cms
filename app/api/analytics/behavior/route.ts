import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';










// جلب تحليلات سلوك المستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, all
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // حساب تاريخ البداية بناءً على الفترة
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }
    
    // جلب البيانات بشكل متوازي
    const [
      impressions,
      interactions
    ] = await Promise.all([
      // الانطباعات - استخدام user_reading_sessions
      prisma.user_reading_sessions.findMany({
        where: {
          user_id: userId,
          created_at: { gte: startDate }
        }
      }),
      
      // التفاعلات - استخدام activity_logs
      prisma.activity_logs.findMany({
        where: {
          user_id: userId,
          created_at: { gte: startDate },
          entity_type: 'article'
        }
      })
    ]);
    
    // تحليل البيانات
    const analytics = {
      overview: {
        totalImpressions: impressions.length,
        totalInteractions: interactions.length,
        uniqueArticlesRead: new Set(impressions.map((i: any) => i.article_id)).size
      },
      
      interactionBreakdown: analyzeInteractions(interactions),
      
      categoryInsights: analyzeCategoryPreferences(impressions)
    };
    
    return NextResponse.json({
      success: true,
      analytics,
      period,
      startDate,
      endDate: new Date()
    });
    
  } catch (error) {
    console.error('Error fetching behavior analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// دوال التحليل

function analyzeInteractions(interactions: any[]) {
  const breakdown = {
    like: 0,
    save: 0,
    share: 0,
    comment: 0,
    view: 0
  };
  
  interactions.forEach(interaction => {
    // تحليل activity_logs بناءً على action
    const action = interaction.action?.toLowerCase();
    if (action === 'liked' || action === 'like') {
      breakdown.like++;
    } else if (action === 'saved' || action === 'save') {
      breakdown.save++;
    } else if (action === 'shared' || action === 'share') {
      breakdown.share++;
    } else if (action === 'commented' || action === 'comment') {
      breakdown.comment++;
    } else if (action === 'viewed' || action === 'view') {
      breakdown.view++;
    }
  });
  
  return breakdown;
}

function analyzeCategoryPreferences(impressions: any[]) {
  const categoryStats: Record<string, {
    impressions: number;
    articles: Set<string>;
  }> = {};
  
  // مؤقتاً: إرجاع مصفوفة فارغة حتى نصلح العلاقات
  // TODO: إضافة includes للمقالات والفئات في الاستعلام الأساسي
  return [];
  
  /*
  impressions.forEach(impression => {
    const category = impression.article?.category;
    if (!category) return;
    
    if (!categoryStats[category.slug]) {
      categoryStats[category.slug] = {
        impressions: 0,
        articles: new Set()
      };
    }
    
    const stats = categoryStats[category.slug];
    stats.impressions++;
    stats.articles.add(impression.article_id);
  });
  
  // تحويل Set إلى عدد
  const result = Object.entries(categoryStats).map(([slug, stats]) => ({
    category: slug,
    impressions: stats.impressions,
    uniqueArticles: stats.articles.size
  }));
  
  return result.sort((a, b) => b.impressions - a.impressions);
  */
}

 