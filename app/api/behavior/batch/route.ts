/**
 * API لتتبع السلوك المجمع
 * POST /api/behavior/batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { behaviorTracker, BehaviorEvent } from '@/lib/services/behavior-tracker';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, message: 'قائمة الأحداث مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من عدد الأحداث (حد أقصى 100 حدث في المرة الواحدة)
    if (events.length > 100) {
      return NextResponse.json(
        { success: false, message: 'عدد الأحداث يتجاوز الحد المسموح (100)' },
        { status: 400 }
      );
    }

    // إضافة معلومات الطلب
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     headersList.get('cf-connecting-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // معالجة كل حدث
    for (const eventData of events) {
      try {
        // التحقق من صحة البيانات الأساسية
        if (!eventData.userId || !eventData.eventType || !eventData.pageUrl) {
          results.push({
            success: false,
            message: 'البيانات الأساسية مطلوبة',
            eventType: eventData.eventType
          });
          errorCount++;
          continue;
        }

        // إنشاء حدث السلوك
        const behaviorEvent: BehaviorEvent = {
          userId: eventData.userId,
          sessionId: eventData.sessionId,
          eventType: eventData.eventType,
          pageUrl: eventData.pageUrl,
          contentId: eventData.contentId,
          contentCategory: eventData.contentCategory,
          timeSpent: eventData.timeSpent,
          scrollDepth: eventData.scrollDepth,
          clickCount: eventData.clickCount,
          metadata: {
            ...eventData.metadata,
            ipAddress,
            userAgent,
            batchProcessed: true,
            batchTimestamp: new Date().toISOString()
          }
        };

        // تسجيل الحدث
        const result = await behaviorTracker.trackEvent(behaviorEvent);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }

        results.push({
          success: result.success,
          message: result.message,
          eventType: eventData.eventType
        });

      } catch (error) {
        console.error('خطأ في معالجة حدث:', error);
        results.push({
          success: false,
          message: 'خطأ في معالجة الحدث',
          eventType: eventData.eventType
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: errorCount === 0,
      message: `تم معالجة ${successCount} حدث بنجاح، ${errorCount} حدث فشل`,
      summary: {
        total: events.length,
        successful: successCount,
        failed: errorCount
      },
      results: results
    });

  } catch (error) {
    console.error('خطأ في API تتبع السلوك المجمع:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
