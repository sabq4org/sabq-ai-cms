import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات الأساسية
    if (!body.event || typeof body.event !== 'string') {
      return NextResponse.json(
        { error: 'اسم الحدث مطلوب' },
        { status: 400 }
      );
    }

    // تسجيل الحدث (يمكن إضافة قاعدة بيانات لاحقاً)
    console.log('📊 Analytics Event:', {
      event: body.event,
      sessionId: body.properties?.sessionId,
      userId: body.properties?.userId,
      timestamp: body.properties?.timestamp,
      url: body.properties?.url,
    });

    // يمكن إضافة منطق حفظ في قاعدة البيانات هنا
    // مثل حفظ في جدول analytics_events

    return NextResponse.json({ 
      success: true,
      message: 'تم تتبع الحدث بنجاح'
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    // إرجاع رد ناجح حتى لو فشل التتبع لتجنب تعطيل التطبيق
    return NextResponse.json({ 
      success: true,
      message: 'تم معالجة الطلب'
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Analytics tracking endpoint',
    methods: ['POST'],
    status: 'active'
  });
}
