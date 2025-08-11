import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, format } from 'date-fns';

// GET /api/analytics/trends-widget - جلب بيانات ويدجت الاتجاهات الشاملة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '7');
    const includeTimeSeries = searchParams.get('includeTimeSeries') === 'true';
    const includeComparison = searchParams.get('includeComparison') === 'true';
    const includeAlerts = searchParams.get('includeAlerts') === 'true';

    // تحديد نطاق التاريخ
    const endDate = new Date();
    const startDate = subDays(endDate, period);
    const previousStartDate = subDays(startDate, period);

    // جلب بيانات التحليلات لكل العلامات
    const currentPeriodData = await prisma.tag_analytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            category: true,
            color: true
          }
        }
      }
    }).catch(() => []);

    const previousPeriodData = await prisma.tag_analytics.findMany({
      where: {
        date: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    }).catch(() => []);

    // تجميع البيانات حسب العلامة
    const tagMap = new Map();
    
    // معالجة الفترة الحالية
    currentPeriodData.forEach(analytics => {
      const tagId = analytics.tag_id;
      if (!tagMap.has(tagId)) {
        tagMap.set(tagId, {
          tag_id: tagId,
          tag_name: analytics.tags?.name || `Tag ${tagId}`,
          tag_category: analytics.tags?.category || 'عام',
          tag_color: analytics.tags?.color || '#3b82f6',
          current_usage: 0,
          current_views: 0,
          current_popularity: 0,
          previous_usage: 0,
          previous_views: 0,
          previous_popularity: 0,
          time_series: []
        });
      }
      
      const tag = tagMap.get(tagId);
      tag.current_usage += analytics.usage_count;
      tag.current_views += analytics.views_count;
      tag.current_popularity += analytics.popularity_score || 0;
      
      if (includeTimeSeries) {
        tag.time_series.push({
          date: analytics.date.toISOString().split('T')[0],
          usage: analytics.usage_count,
          views: analytics.views_count,
          popularity: analytics.popularity_score || 0
        });
      }
    });

    // معالجة الفترة السابقة
    previousPeriodData.forEach(analytics => {
      const tagId = analytics.tag_id;
      if (tagMap.has(tagId)) {
        const tag = tagMap.get(tagId);
        tag.previous_usage += analytics.usage_count;
        tag.previous_views += analytics.views_count;
        tag.previous_popularity += analytics.popularity_score || 0;
      }
    });

    // حساب معدلات النمو والاتجاهات
    const keywordTrends = Array.from(tagMap.values()).map(tag => {
      const usageGrowth = tag.previous_usage > 0 
        ? ((tag.current_usage - tag.previous_usage) / tag.previous_usage) * 100 
        : tag.current_usage > 0 ? 100 : 0;
      
      const viewsGrowth = tag.previous_views > 0 
        ? ((tag.current_views - tag.previous_views) / tag.previous_views) * 100 
        : tag.current_views > 0 ? 100 : 0;
      
      const popularityGrowth = tag.previous_popularity > 0 
        ? ((tag.current_popularity - tag.previous_popularity) / tag.previous_popularity) * 100 
        : tag.current_popularity > 0 ? 100 : 0;

      const compositeGrowth = (usageGrowth + viewsGrowth + popularityGrowth) / 3;

      return {
        keyword: tag.tag_name,
        timeSeriesData: includeTimeSeries ? tag.time_series.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [],
        trend: {
          direction: compositeGrowth > 5 ? 'rising' : compositeGrowth < -5 ? 'falling' : 'stable',
          strength: Math.abs(compositeGrowth) > 20 ? 'strong' : Math.abs(compositeGrowth) > 10 ? 'moderate' : 'weak',
          growth_rate: Math.round(compositeGrowth * 100) / 100
        },
        currentUsage: tag.current_usage,
        currentViews: tag.current_views,
        currentPopularity: tag.current_popularity / Math.max(tag.time_series.length, 1)
      };
    });

    // ترتيب حسب الاستخدام الحالي
    keywordTrends.sort((a, b) => b.currentUsage - a.currentUsage);

    // حساب الاتجاه الإجمالي
    const totalCurrentUsage = keywordTrends.reduce((sum, trend) => sum + trend.currentUsage, 0);
    const totalPreviousUsage = Array.from(tagMap.values()).reduce((sum, tag) => sum + tag.previous_usage, 0);
    const overallGrowthRate = totalPreviousUsage > 0 
      ? ((totalCurrentUsage - totalPreviousUsage) / totalPreviousUsage) * 100 
      : totalCurrentUsage > 0 ? 100 : 0;

    const overallTrend = {
      direction: overallGrowthRate > 5 ? 'rising' : overallGrowthRate < -5 ? 'falling' : 'stable',
      strength: Math.abs(overallGrowthRate) > 20 ? 'strong' : Math.abs(overallGrowthRate) > 10 ? 'moderate' : 'weak',
      growth_rate: Math.round(overallGrowthRate * 100) / 100
    };

    // أهم الكلمات المفتاحية
    const topKeywords = keywordTrends.slice(0, 10).map(trend => ({
      keyword: trend.keyword,
      usage: trend.currentUsage,
      views: trend.currentViews,
      popularity: trend.currentPopularity,
      trend: trend.trend
    }));

    // جلب التنبيهات إذا طُلبت
    let alerts = [];
    let alertRules = [];
    
    if (includeAlerts) {
      try {
        const alertsResponse = await fetch(`${request.nextUrl.origin}/api/analytics/alerts`);
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          alerts = alertsData.alerts || [];
          alertRules = alertsData.rules || [];
        }
      } catch (error) {
        console.warn('تعذر جلب التنبيهات:', error);
      }
    }

    // بناء الاستجابة
    const response = {
      temporalAnalysis: {
        keywordTrends: keywordTrends.slice(0, 10),
        overallTrend,
        periodComparison: {
          current: totalCurrentUsage,
          previous: totalPreviousUsage,
          change: overallGrowthRate
        }
      },
      topKeywords,
      alerts,
      alertRules,
      summary: {
        totalKeywords: keywordTrends.length,
        totalUsage: totalCurrentUsage,
        totalViews: keywordTrends.reduce((sum, trend) => sum + trend.currentViews, 0),
        averagePopularity: keywordTrends.length > 0 
          ? keywordTrends.reduce((sum, trend) => sum + trend.currentPopularity, 0) / keywordTrends.length 
          : 0,
        activeAlerts: alerts.filter((alert: any) => !alert.isRead).length
      },
      metadata: {
        period_days: period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        timestamp: new Date().toISOString(),
        data_points: currentPeriodData.length
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('خطأ في جلب بيانات ويدجت الاتجاهات:', error);
    
    return NextResponse.json(
      { 
        error: 'خطأ في جلب بيانات ويدجت الاتجاهات',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/analytics/trends-widget - تحليل مخصص لويدجت الاتجاهات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      keyword,
      includeTimeSeries = false,
      includeComparison = false,
      includeAlerts = false 
    } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'تاريخ البداية والنهاية مطلوبان' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // شروط البحث
    const whereConditions: any = {
      date: {
        gte: start,
        lte: end
      }
    };

    // إذا كان هناك كلمة مفتاحية محددة
    if (keyword) {
      const tag = await prisma.tags.findFirst({
        where: {
          name: {
            contains: keyword,
            mode: 'insensitive'
          }
        }
      });

      if (tag) {
        whereConditions.tag_id = tag.id;
      } else {
        return NextResponse.json({
          error: 'الكلمة المفتاحية غير موجودة',
          keyword
        }, { status: 404 });
      }
    }

    // جلب البيانات
    const analyticsData = await prisma.tag_analytics.findMany({
      where: whereConditions,
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            category: true,
            color: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    }).catch(() => []);

    // معالجة البيانات
    let response: any = {
      totalUsage: analyticsData.reduce((sum, item) => sum + item.usage_count, 0),
      totalViews: analyticsData.reduce((sum, item) => sum + item.views_count, 0),
      averagePopularity: analyticsData.length > 0 
        ? analyticsData.reduce((sum, item) => sum + (item.popularity_score || 0), 0) / analyticsData.length 
        : 0,
      dataPoints: analyticsData.length,
      periodDays
    };

    // إضافة البيانات الزمنية إذا طُلبت
    if (includeTimeSeries) {
      response.timeSeries = analyticsData.map(item => ({
        date: item.date.toISOString().split('T')[0],
        usage: item.usage_count,
        views: item.views_count,
        popularity: item.popularity_score || 0
      }));
    }

    // حساب معدل النمو
    if (analyticsData.length > 1) {
      const firstHalf = analyticsData.slice(0, Math.floor(analyticsData.length / 2));
      const secondHalf = analyticsData.slice(Math.floor(analyticsData.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.usage_count, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.usage_count, 0) / secondHalf.length;
      
      response.growthRate = firstHalfAvg > 0 
        ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 
        : secondHalfAvg > 0 ? 100 : 0;
    } else {
      response.growthRate = 0;
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('خطأ في التحليل المخصص لويدجت الاتجاهات:', error);
    
    return NextResponse.json(
      { 
        error: 'خطأ في التحليل المخصص',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
