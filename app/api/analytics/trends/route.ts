import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

const prisma = getPrismaClient();

// API تحليل الاتجاهات الزمنية للكلمات المفتاحية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get("period") || "30");
    const limit = parseInt(searchParams.get("limit") || "20");
    const trendType = searchParams.get("type") || "all"; // all, rising, falling, stable

    console.log(`📈 تحليل اتجاهات ${period} يوم، النوع: ${trendType}`);

    // تحديد الفترات الزمنية للمقارنة
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - period);

    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (period * 2));
    previousPeriodStart.setHours(0, 0, 0, 0);

    const previousPeriodEnd = new Date(currentPeriodStart);
    previousPeriodEnd.setHours(23, 59, 59, 999);

    // جلب بيانات التحليلات الحالية والسابقة
    const [currentAnalytics, previousAnalytics] = await Promise.all([
      // البيانات الحالية
      prisma.tag_analytics.groupBy({
        by: ['tag_id'],
        where: {
          date: {
            gte: currentPeriodStart
          }
        },
        _sum: {
          usage_count: true,
          views_count: true,
          clicks_count: true,
          interactions: true
        },
        _avg: {
          popularity_score: true
        }
      }).catch(() => []),

      // البيانات السابقة
      prisma.tag_analytics.groupBy({
        by: ['tag_id'],
        where: {
          date: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        },
        _sum: {
          usage_count: true,
          views_count: true,
          clicks_count: true,
          interactions: true
        },
        _avg: {
          popularity_score: true
        }
      }).catch(() => [])
    ]);

    // تجميع البيانات لحساب الاتجاهات
    const trendsMap = new Map();

    // معالجة البيانات الحالية
    for (const current of currentAnalytics) {
      trendsMap.set(current.tag_id, {
        tag_id: current.tag_id,
        current_usage: current._sum.usage_count || 0,
        current_views: current._sum.views_count || 0,
        current_clicks: current._sum.clicks_count || 0,
        current_interactions: current._sum.interactions || 0,
        current_popularity: current._avg.popularity_score || 0,
        previous_usage: 0,
        previous_views: 0,
        previous_clicks: 0,
        previous_interactions: 0,
        previous_popularity: 0
      });
    }

    // معالجة البيانات السابقة
    for (const previous of previousAnalytics) {
      if (trendsMap.has(previous.tag_id)) {
        const trend = trendsMap.get(previous.tag_id);
        trend.previous_usage = previous._sum.usage_count || 0;
        trend.previous_views = previous._sum.views_count || 0;
        trend.previous_clicks = previous._sum.clicks_count || 0;
        trend.previous_interactions = previous._sum.interactions || 0;
        trend.previous_popularity = previous._avg.popularity_score || 0;
      }
    }

    // حساب الاتجاهات ومعدلات النمو
    const trends = Array.from(trendsMap.values()).map(trend => {
      // حساب معدل النمو للاستخدام
      const usageGrowth = trend.previous_usage > 0 
        ? ((trend.current_usage - trend.previous_usage) / trend.previous_usage) * 100
        : trend.current_usage > 0 ? 100 : 0;

      // حساب معدل النمو للمشاهدات
      const viewsGrowth = trend.previous_views > 0
        ? ((trend.current_views - trend.previous_views) / trend.previous_views) * 100
        : trend.current_views > 0 ? 100 : 0;

      // حساب معدل النمو للشعبية
      const popularityGrowth = trend.previous_popularity > 0
        ? ((trend.current_popularity - trend.previous_popularity) / trend.previous_popularity) * 100
        : trend.current_popularity > 0 ? 100 : 0;

      // حساب مؤشر الاتجاه المركب
      const compositeGrowth = (usageGrowth * 0.4) + (viewsGrowth * 0.3) + (popularityGrowth * 0.3);

      // تصنيف الاتجاه
      let trendDirection;
      let trendStrength;
      
      if (Math.abs(compositeGrowth) < 5) {
        trendDirection = 'stable';
        trendStrength = 'weak';
      } else if (compositeGrowth > 0) {
        trendDirection = 'rising';
        trendStrength = compositeGrowth > 25 ? 'strong' : 'moderate';
      } else {
        trendDirection = 'falling';
        trendStrength = compositeGrowth < -25 ? 'strong' : 'moderate';
      }

      return {
        tag_id: trend.tag_id,
        current_period: {
          usage: trend.current_usage,
          views: trend.current_views,
          clicks: trend.current_clicks,
          interactions: trend.current_interactions,
          popularity: Math.round(trend.current_popularity * 100) / 100
        },
        previous_period: {
          usage: trend.previous_usage,
          views: trend.previous_views,
          clicks: trend.previous_clicks,
          interactions: trend.previous_interactions,
          popularity: Math.round(trend.previous_popularity * 100) / 100
        },
        growth_rates: {
          usage: Math.round(usageGrowth * 100) / 100,
          views: Math.round(viewsGrowth * 100) / 100,
          popularity: Math.round(popularityGrowth * 100) / 100,
          composite: Math.round(compositeGrowth * 100) / 100
        },
        trend: {
          direction: trendDirection,
          strength: trendStrength,
          score: Math.round(Math.abs(compositeGrowth) * 100) / 100
        }
      };
    });

    // فلترة النتائج حسب نوع الاتجاه المطلوب
    let filteredTrends = trends;
    if (trendType !== 'all') {
      filteredTrends = trends.filter(trend => trend.trend.direction === trendType);
    }

    // ترتيب النتائج حسب قوة الاتجاه
    filteredTrends.sort((a, b) => b.trend.score - a.trend.score);

    // أخذ العدد المطلوب فقط
    const limitedTrends = filteredTrends.slice(0, limit);

    // جلب معلومات العلامات
    const tagIds = limitedTrends.map(t => t.tag_id);
    const tagInfo = await prisma.tags.findMany({
      where: {
        id: { in: tagIds },
        is_active: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        category: true
      }
    }).catch(() => []);

    // دمج البيانات
    const trendsWithInfo = limitedTrends.map(trend => {
      const tag = tagInfo.find(t => t.id === trend.tag_id);
      return {
        ...trend,
        tag: tag || null
      };
    }).filter(trend => trend.tag !== null);

    // إحصائيات إجمالية
    const stats = {
      total_trends: trends.length,
      rising_count: trends.filter(t => t.trend.direction === 'rising').length,
      falling_count: trends.filter(t => t.trend.direction === 'falling').length,
      stable_count: trends.filter(t => t.trend.direction === 'stable').length,
      period_days: period,
      analysis_date: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        trends: trendsWithInfo,
        stats,
        metadata: {
          period_analyzed: period,
          trend_type_filter: trendType,
          results_count: trendsWithInfo.length,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error("❌ خطأ في تحليل الاتجاهات:", error);
    
    return NextResponse.json(
      { 
        error: "خطأ في تحليل الاتجاهات الزمنية", 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// تحليل تفصيلي لكلمة مفتاحية واحدة
export async function POST(request: NextRequest) {
  try {
    const { tagId, period = 30 } = await request.json();

    if (!tagId) {
      return NextResponse.json(
        { error: "معرف الكلمة المفتاحية مطلوب" },
        { status: 400 }
      );
    }

    // جلب البيانات التفصيلية لفترة أطول
    const extendedPeriod = period * 3; // 3 أضعاف الفترة للحصول على سياق أكبر
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - extendedPeriod);

    const dailyAnalytics = await prisma.tag_analytics.findMany({
      where: {
        tag_id: tagId,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    }).catch(() => []);

    // معلومات العلامة
    const tagInfo = await prisma.tags.findUnique({
      where: { id: tagId },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        category: true,
        popularity_score: true,
        growth_rate: true,
        total_usage_count: true,
        views_count: true
      }
    }).catch(() => null);

    if (!tagInfo) {
      return NextResponse.json(
        { error: "الكلمة المفتاحية غير موجودة" },
        { status: 404 }
      );
    }

    // تحليل البيانات اليومية
    const timeSeriesData = dailyAnalytics.map(analytics => ({
      date: analytics.date.toISOString().split('T')[0],
      usage: analytics.usage_count,
      views: analytics.views_count,
      clicks: analytics.clicks_count,
      interactions: analytics.interactions,
      popularity: Math.round((analytics.popularity_score || 0) * 100) / 100
    }));

    // حساب الاتجاه العام
    const recentDays = timeSeriesData.slice(-period);
    const earlierDays = timeSeriesData.slice(-period * 2, -period);

    const recentAvg = recentDays.reduce((sum, day) => sum + day.usage, 0) / recentDays.length;
    const earlierAvg = earlierDays.reduce((sum, day) => sum + day.usage, 0) / (earlierDays.length || 1);

    const overallTrend = earlierAvg > 0 
      ? ((recentAvg - earlierAvg) / earlierAvg) * 100
      : recentAvg > 0 ? 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        tag: tagInfo,
        time_series: timeSeriesData,
        trend_analysis: {
          overall_trend: Math.round(overallTrend * 100) / 100,
          recent_average: Math.round(recentAvg * 100) / 100,
          earlier_average: Math.round(earlierAvg * 100) / 100,
          direction: overallTrend > 5 ? 'rising' : overallTrend < -5 ? 'falling' : 'stable',
          data_points: timeSeriesData.length,
          period_analyzed: period
        },
        metadata: {
          tag_id: tagId,
          analysis_period: period,
          total_days_analyzed: extendedPeriod,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error("❌ خطأ في التحليل التفصيلي:", error);
    
    return NextResponse.json(
      { 
        error: "خطأ في التحليل التفصيلي للاتجاه", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
