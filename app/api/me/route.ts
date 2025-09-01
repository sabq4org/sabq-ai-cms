import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // التحقق من وجود cookie أو header للمصادقة
    const authHeader = request.headers.get('authorization');
    const authCookie = request.cookies.get('auth-token');
    
    if (!authHeader && !authCookie) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // إرجاع بيانات وهمية للمستخدم (يمكن تطويرها لاحقاً)
    return NextResponse.json({
      success: true,
      user: {
        id: 'guest',
        name: 'مستخدم ضيف',
        email: 'guest@sabq.io',
        role: 'reader',
        avatar: null,
      }
    });

  } catch (error) {
    console.error('خطأ في /api/me:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
