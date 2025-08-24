/**
 * API لتتبع السلوك
 * POST /api/behavior/track
 */

import { NextRequest, NextResponse } from 'next/server';
import { behaviorTracker, BehaviorEvent } from '@/lib/services/behavior-tracker';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من صحة البيانات الأساسية
    if (!body.userId || !body.eventType || !body.pageUrl) {
      return NextResponse.json(
        { success: false, message: 'البيانات الأساسية مطلوبة (userId, eventType, pageUrl)' },
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

    // إنشاء حدث السلوك
    const behaviorEvent: BehaviorEvent = {
      userId: body.userId,
      sessionId: body.sessionId,
      eventType: body.eventType,
      pageUrl: body.pageUrl,
      contentId: body.contentId,
      contentCategory: body.contentCategory,
      timeSpent: body.timeSpent,
      scrollDepth: body.scrollDepth,
      clickCount: body.clickCount,
      metadata: {
        ...body.metadata,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString()
      }
    };

    // تسجيل الحدث
    const result = await behaviorTracker.trackEvent(behaviorEvent);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الحدث بنجاح'
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message || 'فشل في تسجيل الحدث' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('خطأ في API تتبع السلوك:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// معلومات API
export async function GET() {
  return NextResponse.json({
    name: 'Behavior Tracking API',
    description: 'تتبع سلوك المستخدمين',
    version: '1.0.0',
    endpoints: {
      POST: {
        description: 'تسجيل حدث سلوكي',
        parameters: {
          userId: 'string (required) - معرف المستخدم',
          sessionId: 'string (required) - معرف الجلسة',
          eventType: 'string (required) - نوع الحدث',
          pageUrl: 'string (required) - رابط الصفحة',
          contentId: 'string (optional) - معرف المحتوى',
          contentCategory: 'string (optional) - فئة المحتوى',
          timeSpent: 'number (optional) - الوقت المقضي بالثواني',
          scrollDepth: 'number (optional) - عمق التمرير بالنسبة المئوية',
          clickCount: 'number (optional) - عدد النقرات',
          metadata: 'object (optional) - بيانات إضافية'
        }
      }
    },
    supportedEventTypes: [
      'page_view',
      'time_update',
      'scroll_milestone',
      'click',
      'user_inactive',
      'user_active',
      'page_exit'
    ]
  });
}
