import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET - جلب إحصائيات الكيانات الذكية
export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    console.log('📊 جلب إحصائيات الكيانات الذكية...');

    // إحصائيات أساسية
    const totalEntities = await prisma.smartEntities.count();
    const activeEntities = await prisma.smartEntities.count({
      where: { is_active: true }
    });

    // إجمالي الإشارات والنقرات
    const mentionStats = await prisma.smartEntities.aggregate({
      _sum: {
        mention_count: true,
        click_count: true
      }
    });

    // أفضل الكيانات (الأكثر ذكراً)
    const topEntities = await prisma.smartEntities.findMany({
      where: { is_active: true },
      include: {
        entity_type: true
      },
      orderBy: [
        { mention_count: 'desc' },
        { click_count: 'desc' },
        { importance_score: 'desc' }
      ],
      take: 10
    });

    // أحدث الكيانات
    const recentEntities = await prisma.smartEntities.findMany({
      where: { is_active: true },
      include: {
        entity_type: true
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // إحصائيات حسب نوع الكيان
    const entityTypeStats = await prisma.smartEntities.groupBy({
      by: ['entity_type_id'],
      _count: {
        entity_type_id: true
      },
      _sum: {
        mention_count: true,
        click_count: true
      },
      where: { is_active: true }
    });

    // جلب أسماء أنواع الكيانات
    const entityTypes = await prisma.smartEntityTypes.findMany();
    const typeStatsWithNames = entityTypeStats.map(stat => {
      const type = entityTypes.find(t => t.id === stat.entity_type_id);
      return {
        ...stat,
        type_name: type?.name_ar || 'غير محدد',
        type_icon: type?.icon || '❓',
        type_color: type?.color || '#gray'
      };
    });

    // إحصائيات الأداء (آخر 30 يوم)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.linkAnalytics.groupBy({
      by: ['event_type'],
      _count: {
        event_type: true
      },
      where: {
        timestamp: {
          gte: thirtyDaysAgo
        }
      }
    });

    // تحليل الترندات (الكيانات الأكثر نشاطاً مؤخراً)
    const trendingEntities = await prisma.smartEntities.findMany({
      where: {
        is_active: true,
        last_mentioned: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر 7 أيام
        }
      },
      include: {
        entity_type: true
      },
      orderBy: [
        { mention_count: 'desc' },
        { last_mentioned: 'desc' }
      ],
      take: 5
    });

    // معدل النشاط اليومي
    const dailyActivity = await prisma.linkAnalytics.groupBy({
      by: ['timestamp'],
      _count: {
        timestamp: true
      },
      where: {
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const stats = {
      // إحصائيات أساسية
      totalEntities,
      activeEntities,
      totalMentions: mentionStats._sum.mention_count || 0,
      totalClicks: mentionStats._sum.click_count || 0,
      
      // قوائم أفضل
      topEntities,
      recentEntities,
      trendingEntities,
      
      // إحصائيات حسب النوع
      entityTypeStats: typeStatsWithNames,
      
      // نشاط حديث
      recentActivity,
      dailyActivity: dailyActivity.slice(0, 7), // آخر 7 أيام
      
      // معدلات
      averageMentionsPerEntity: totalEntities > 0 
        ? Math.round((mentionStats._sum.mention_count || 0) / totalEntities) 
        : 0,
      averageClicksPerEntity: totalEntities > 0 
        ? Math.round((mentionStats._sum.click_count || 0) / totalEntities) 
        : 0,
      
      // معلومات إضافية
      metadata: {
        lastUpdated: new Date().toISOString(),
        periodDays: 30,
        activeEntityPercentage: totalEntities > 0 
          ? Math.round((activeEntities / totalEntities) * 100) 
          : 0
      }
    };

    console.log(`✅ تم جلب الإحصائيات: ${totalEntities} كيان، ${stats.totalMentions} إشارة`);

    return NextResponse.json({
      success: true,
      ...stats
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الإحصائيات',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}