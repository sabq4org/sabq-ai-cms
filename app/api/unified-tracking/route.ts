import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('❌ [tracking] خطأ في قراءة body:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: "Invalid request body" 
      }, { status: 400 });
    }

    const { event, data } = body;
    
    if (!event) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing event type" 
      }, { status: 400 });
    }

    // لا نوقف الطلب إذا فشل التسجيل في قاعدة البيانات
    try {
      await prisma.user_activities.create({
        data: {
          id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: data?.userId || 'anonymous',
          session_id: data?.sessionId || 'unknown',
          activity_type: event,
          activity_data: data || {},
          created_at: new Date()
        }
      });
    } catch (dbError) {
      console.error('⚠️ [tracking] فشل حفظ التتبع في قاعدة البيانات (سيتم تجاهله):', dbError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error: any) {
    console.error('❌ [tracking] خطأ عام في unified-tracking:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : 'Unknown error'
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
