/**
 * 📨 API لإرسال الإشعارات الذكية للمستخدمين المهتمين
 * 
 * POST /api/notifications/send-notifications
 * - يرسل إشعارات للمستخدمين المهتمين بفئة معينة
 * - يدعم الأخبار العاجلة والعادية
 * - محسّن للأداء مع دعم الإشعارات الدفعية
 */

import { NextRequest, NextResponse } from 'next/server';
import { SmartNotificationService } from '@/lib/services/smartNotificationService';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      articleId,
      articleTitle,
      categoryName = 'أخبار',
      categorySlug = 'news',
      isBreaking = false,
      articleUrl
    } = body;

    if (!articleId || !articleTitle) {
      return NextResponse.json(
        { error: 'معرف المقال والعنوان مطلوبان' },
        { status: 400 }
      );
    }

    console.log(`🚀 جاري إرسال الإشعارات للمقال: ${articleTitle}`);

    // إرسال الإشعارات للمستخدمين المهتمين
    const result = await SmartNotificationService.sendToInterestedUsers(
      articleId,
      articleTitle,
      categoryName,
      categorySlug,
      isBreaking,
      articleUrl
    );

    const duration = Date.now() - startTime;

    console.log(`✅ تم إرسال ${result.count} إشعار في ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: `تم إرسال ${result.count} إشعار بنجاح`,
      data: {
        count: result.count,
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعارات:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'فشل إرسال الإشعارات',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
