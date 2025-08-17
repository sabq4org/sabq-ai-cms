/**
 * API endpoint لتتبع نقرات الكلمات المفتاحية
 * /api/analytics/keyword-click
 */

import { NextRequest, NextResponse } from 'next/server';

// نوع بيانات تتبع النقر
interface KeywordClickData {
  keywordId: string;
  keyword: string;
  timestamp: string;
  userAgent?: string;
  referer?: string;
  sessionId?: string;
}

// POST: تتبع نقرة على كلمة مفتاحية
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywordId, keyword, timestamp }: KeywordClickData = body;

    // التحقق من البيانات المطلوبة
    if (!keywordId || !keyword || !timestamp) {
      return NextResponse.json({
        success: false,
        error: 'بيانات غير مكتملة'
      }, { status: 400 });
    }

    // الحصول على معلومات إضافية من الطلب
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const realIp = request.headers.get('x-real-ip') || '';

    // إنشاء بيانات التتبع
    const clickData = {
      keywordId,
      keyword,
      timestamp,
      userAgent,
      referer,
      ip: forwardedFor || realIp || 'unknown',
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // في التطبيق الحقيقي، سيتم حفظ البيانات في قاعدة البيانات
    console.log('📊 تتبع نقر على كلمة مفتاحية:', {
      keyword: clickData.keyword,
      timestamp: clickData.timestamp,
      userAgent: clickData.userAgent.substring(0, 50) + '...',
      referer: clickData.referer
    });

    // محاكاة حفظ البيانات
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل النقرة بنجاح',
      clickId: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('خطأ في تتبع النقر:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تسجيل النقرة'
    }, { status: 500 });
  }
}

// GET: جلب إحصائيات النقرات (اختياري)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywordId = searchParams.get('keywordId');
    const period = searchParams.get('period') || '7d';

    // بيانات تجريبية للإحصائيات
    const mockStats = {
      keywordId: keywordId || 'all',
      period,
      totalClicks: Math.floor(Math.random() * 1000) + 100,
      uniqueClicks: Math.floor(Math.random() * 500) + 50,
      clicksToday: Math.floor(Math.random() * 50) + 10,
      topReferrers: [
        { source: 'google.com', clicks: 45 },
        { source: 'facebook.com', clicks: 32 },
        { source: 'twitter.com', clicks: 28 },
        { source: 'direct', clicks: 89 }
      ],
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        clicks: Math.floor(Math.random() * 20) + 1
      })),
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      stats: mockStats
    });

  } catch (error) {
    console.error('خطأ في جلب إحصائيات النقرات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الإحصائيات'
    }, { status: 500 });
  }
}
