// API لتجديد access token - نظام سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/lib/auth/user-management';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 بدء عملية تجديد التوكن...');
    console.log('🍪 الكوكيز المتاحة:', request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })));
    
    // الحصول على refresh token من cookies أو body (أولوية للكوكيز الموحدة)
    let refreshToken = request.cookies.get('sabq_rt')?.value || request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      console.log('⚠️ لا يوجد refresh token في الكوكيز، محاولة من body...');
      try {
        const body = await request.json();
        refreshToken = body.refresh_token;
      } catch (e) {
        console.log('⚠️ فشل قراءة body');
      }
    }

    if (!refreshToken) {
      console.log('❌ لا يوجد refresh token نهائياً');
      return NextResponse.json(
        {
          success: false,
          error: 'رمز التجديد مطلوب'
        },
        { status: 400 }
      );
    }

    console.log('✅ تم العثور على refresh token');

    // تجديد الرمز
    console.log('🔑 محاولة تجديد التوكن...');
    const result = await UserManagementService.refreshAccessToken(refreshToken);

    if (result.error) {
      console.log('❌ فشل تجديد التوكن:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 401 }
      );
    }

    console.log('✅ تم تجديد التوكن بنجاح');

    // إرسال الاستجابة الناجحة
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تجديد الرمز بنجاح'
      },
      { status: 200 }
    );

    // تحديث access token cookie (موحد + متوافق)
    if (result.access_token) {
      response.cookies.set('sabq_at', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // تغيير من strict إلى lax
        maxAge: 15 * 60, // 15 دقيقة
        path: '/'
      });
      response.cookies.set('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // تغيير من strict إلى lax
        maxAge: 15 * 60,
        path: '/'
      });
    }

    return response;

  } catch (error: any) {
    console.error('Token refresh API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ داخلي في الخادم'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}