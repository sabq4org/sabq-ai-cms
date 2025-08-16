// API لتجديد access token - نظام سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/lib/auth/user-management';

export async function POST(request: NextRequest) {
  try {
    // الحصول على refresh token من cookies أو body
    let refreshToken = request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      const body = await request.json();
      refreshToken = body.refresh_token;
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'رمز التجديد مطلوب'
        },
        { status: 400 }
      );
    }

    // تجديد الرمز
    const result = await UserManagementService.refreshAccessToken(refreshToken);

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 401 }
      );
    }

    // إرسال الاستجابة الناجحة
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تجديد الرمز بنجاح'
      },
      { status: 200 }
    );

    // تحديث access token cookie
    if (result.access_token) {
      response.cookies.set('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 دقيقة
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