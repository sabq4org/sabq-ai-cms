import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from '@/app/lib/auth';
import UnifiedTrackingSystem from '@/lib/unified-tracking-system';

/**
 * 🎯 API موحد للتتبع الذكي
 * يربط جميع الأنشطة بنقاط الولاء والملف الشخصي
 */

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await requireAuthFromRequest(request);
    
    const body = await request.json();
    const { articleId, interactionType, metadata = {} } = body;

    if (!articleId || !interactionType) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال ونوع التفاعل مطلوبان'
      }, { status: 400 });
    }

    // تسجيل التفاعل باستخدام النظام الموحد
    const result = await UnifiedTrackingSystem.trackInteraction({
      userId: user.id,
      articleId,
      interactionType,
      metadata: {
        ...metadata,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            '127.0.0.1',
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ خطأ في API التتبع الموحد:', error);
    
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: 'غير مصرح'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في تسجيل التفاعل'
    }, { status: 500 });
  }
}

/**
 * جلب إحصائيات المستخدم
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    
    const stats = await UnifiedTrackingSystem.getUserStats(user.id);
    
    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('❌ خطأ في جلب إحصائيات المستخدم:', error);
    
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({
        success: false,
        error: 'غير مصرح'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الإحصائيات'
    }, { status: 500 });
  }
}
