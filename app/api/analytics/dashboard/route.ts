import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // استخدام فترة افتراضية (آخر 30 يوم) إذا لم يتم تحديد التواريخ
    const end = startDate ? new Date(endDate!) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return await getAnalyticsData(start, end);
  } catch (error) {
    console.error('خطأ في API لوحة التحليلات:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}

async function getAnalyticsData(start: Date, end: Date) {
  try {
    // إرجاع بيانات وهمية للاختبار
    const mockAnalytics = {
      timeRange: { start, end },
      summary: {
        totalArticles: 45,
        totalUsage: 12580,
        totalViews: 12580,
        averageViews: 279,
      },
      keywordTrends: [
        { keyword: 'تقنية', count: 24, trend: 'up', change: 15 },
        { keyword: 'اقتصاد', count: 18, trend: 'down', change: -8 },
        { keyword: 'رياضة', count: 22, trend: 'stable', change: 2 },
        { keyword: 'سياسة', count: 16, trend: 'up', change: 12 },
        { keyword: 'ثقافة', count: 14, trend: 'down', change: -5 },
      ],
      topContent: [
        { title: 'أحدث التطورات التقنية في 2025', views: 1250, category: 'تقنية' },
        { title: 'تحليل الأسواق المالية', views: 980, category: 'اقتصاد' },
        { title: 'نتائج الدوري السعودي', views: 875, category: 'رياضة' },
      ],
      recentActivity: [
        {
          id: '1',
          type: 'article_published',
          description: 'تم نشر مقال جديد',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          user: 'محرر النظام',
        },
      ],
      alerts: [
        {
          id: 'alert-1',
          type: 'warning',
          message: 'انخفاض في معدل النشر اليومي',
          timestamp: new Date(),
        },
      ],
    };

    return NextResponse.json(mockAnalytics, { status: 200 });
  } catch (error) {
    console.error('خطأ في جلب بيانات التحليلات:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}