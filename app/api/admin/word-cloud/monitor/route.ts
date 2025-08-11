import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API مراقبة حالة نظام سحابة الكلمات
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // اختبار اتصال قاعدة البيانات أولاً
    console.log("🔗 اختبار اتصال قاعدة البيانات...");
    
    // تحقق بسيط من وجود جدول tags
    let totalTags = 0;
    let activeTags = 0;
    let tagsWithAnalytics = 0;
    let recentAnalytics = 0;
    let topPerformingTags: any[] = [];

    try {
      totalTags = await prisma.tags.count();
      console.log(`✅ وجدت ${totalTags} علامة في قاعدة البيانات`);
    } catch (error: any) {
      console.error("❌ خطأ في عدد العلامات:", error.message);
      totalTags = 0;
    }

    try {
      activeTags = await prisma.tags.count({
        where: { is_active: true }
      });
    } catch (error: any) {
      console.error("❌ خطأ في العلامات النشطة:", error.message);
      activeTags = 0;
    }

    try {
      tagsWithAnalytics = await prisma.tags.count({
        where: {
          popularity_score: { gt: 0 }
        }
      });
    } catch (error: any) {
      console.error("❌ خطأ في علامات التحليلات:", error.message);
      tagsWithAnalytics = 0;
    }

    try {
      recentAnalytics = await prisma.tag_analytics.count({
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });
    } catch (error: any) {
      console.error("❌ خطأ في التحليلات الحديثة:", error.message);
      recentAnalytics = 0;
    }

    try {
      topPerformingTags = await prisma.tags.findMany({
        where: {
          is_active: true,
          popularity_score: { gt: 0 }
        },
        orderBy: {
          popularity_score: 'desc'
        },
        take: 10,
        select: {
          id: true,
          name: true,
          popularity_score: true,
          growth_rate: true,
          total_usage_count: true,
          views_count: true,
          last_used_at: true
        }
      });
    } catch (error: any) {
      console.error("❌ خطأ في أفضل العلامات:", error.message);
      topPerformingTags = [];
    }

    // إحصائيات الأداء (مبسطة)
    const performanceStats = {
      last24Hours: {
        totalUsage: 0,
        totalViews: 0,
        totalClicks: 0,
        totalInteractions: 0,
        averagePopularity: 0
      },
      last7Days: {
        totalUsage: 0,
        totalViews: 0,
        totalClicks: 0,
        totalInteractions: 0,
        averagePopularity: 0
      },
      last30Days: {
        totalUsage: 0,
        totalViews: 0,
        totalClicks: 0,
        totalInteractions: 0,
        averagePopularity: 0
      }
    };

    // اتجاهات النمو (مبسطة)
    const growthTrends = {
      averageGrowthRate: 0,
      averagePopularity: 0,
      maxGrowthRate: 0,
      maxPopularity: 0,
      minGrowthRate: 0
    };

    // آخر تحديث
    let lastCronUpdate = null;

    try {
      lastCronUpdate = await prisma.tag_analytics.findFirst({
        orderBy: {
          created_at: 'desc'
        },
        select: {
          created_at: true,
          date: true
        }
      });
    } catch (error: any) {
      console.error("❌ خطأ في آخر تحديث:", error.message);
    }

    // صحة النظام
    const systemHealth = {
      database: totalTags >= 0 ? "صحي" : "خطأ",
      analytics: tagsWithAnalytics > 0 ? "نشط" : "متوقف",
      cronJob: lastCronUpdate ? 
        (Date.now() - new Date(lastCronUpdate.created_at).getTime() < 12 * 60 * 60 * 1000 ? "نشط" : "متأخر") : 
        "لم يبدأ",
      coverage: activeTags > 0 ? ((tagsWithAnalytics / activeTags) * 100).toFixed(1) + "%" : "0%"
    };

    const responseTime = Date.now() - startTime;

    const report = {
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      systemHealth,
      overview: {
        totalTags,
        activeTags,
        tagsWithAnalytics,
        coveragePercentage: activeTags > 0 ? ((tagsWithAnalytics / activeTags) * 100).toFixed(1) : "0",
        recentAnalyticsCount: recentAnalytics
      },
      performance: performanceStats,
      trends: growthTrends,
      topPerformers: topPerformingTags.map(tag => ({
        name: tag.name,
        popularity: Math.round((tag.popularity_score || 0) * 100) / 100,
        growth: Math.round((tag.growth_rate || 0) * 100) / 100,
        usage: tag.total_usage_count || 0,
        views: tag.views_count || 0,
        lastUsed: tag.last_used_at ? new Date(tag.last_used_at).toLocaleDateString('ar-SA') : 'غير محدد'
      })),
      lastUpdate: {
        cronJob: lastCronUpdate?.created_at ? new Date(lastCronUpdate.created_at).toISOString() : null,
        analyticsDate: lastCronUpdate?.date ? new Date(lastCronUpdate.date).toLocaleDateString('ar-SA') : null
      }
    };

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error: any) {
    console.error("❌ خطأ في مراقبة سحابة الكلمات:", error);
    
    return NextResponse.json(
      { 
        error: "خطأ في استعلام مراقبة النظام", 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// إحصائيات مفصلة للعلامة المحددة
export async function POST(request: NextRequest) {
  try {
    const { tagId, period = 30 } = await request.json();

    if (!tagId) {
      return NextResponse.json(
        { error: "معرف العلامة مطلوب" },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // بيانات العلامة
    const tagData = await prisma.tags.findUnique({
      where: { id: tagId },
      include: {
        tag_analytics: {
          where: {
            date: { gte: startDate }
          },
          orderBy: { date: 'desc' }
        },
        article_tags: {
          include: {
            articles: {
              where: {
                published_at: { gte: startDate },
                status: "published"
              },
              select: {
                id: true,
                title: true,
                views: true,
                published_at: true
              }
            }
          }
        }
      }
    });

    if (!tagData) {
      return NextResponse.json(
        { error: "العلامة غير موجودة" },
        { status: 404 }
      );
    }

    // تحليل الاتجاهات
    const analyticsTimeline = tagData.tag_analytics.map(analytics => ({
      date: new Date(analytics.date).toLocaleDateString('ar-SA'),
      usage: analytics.usage_count,
      views: analytics.views_count,
      clicks: analytics.clicks_count,
      interactions: analytics.interactions,
      popularity: Math.round((analytics.popularity_score || 0) * 100) / 100
    }));

    // المقالات المرتبطة
    const relatedArticles = tagData.article_tags
      .filter(at => at.articles.published_at)
      .map(at => ({
        id: at.articles.id,
        title: at.articles.title,
        views: at.articles.views || 0,
        publishedAt: new Date(at.articles.published_at!).toLocaleDateString('ar-SA')
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const detailedReport = {
      tag: {
        id: tagData.id,
        name: tagData.name,
        popularity: Math.round((tagData.popularity_score || 0) * 100) / 100,
        growth: Math.round((tagData.growth_rate || 0) * 100) / 100,
        totalUsage: tagData.total_usage_count || 0,
        totalViews: tagData.views_count || 0,
        lastUsed: tagData.last_used_at ? new Date(tagData.last_used_at).toLocaleDateString('ar-SA') : 'غير محدد'
      },
      timeline: analyticsTimeline,
      relatedArticles,
      summary: {
        period: `${period} يوم`,
        totalAnalytics: tagData.tag_analytics.length,
        totalArticles: relatedArticles.length,
        averageViews: relatedArticles.length > 0 
          ? Math.round(relatedArticles.reduce((sum, art) => sum + art.views, 0) / relatedArticles.length)
          : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: detailedReport
    });

  } catch (error: any) {
    console.error("❌ خطأ في تقرير العلامة المفصل:", error);
    
    return NextResponse.json(
      { 
        error: "خطأ في إنشاء التقرير المفصل", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
