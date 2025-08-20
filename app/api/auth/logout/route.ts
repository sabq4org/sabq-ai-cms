// API لتسجيل الخروج - نظام سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/lib/auth/user-management';

export async function POST(request: NextRequest) {
  try {
    // الحصول على access token من headers أو cookies
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      accessToken = request.cookies.get('access_token')?.value;
    }

    if (accessToken) {
      // تسجيل الخروج
      await UserManagementService.logoutUser(accessToken);
    }

    // إرسال الاستجابة الناجحة
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
      },
      { status: 200 }
    );

    // حذف cookies (مع دعم الدومين لضمان المسح)
    const cookieDomain = process.env.COOKIE_DOMAIN || process.env.NEXT_PUBLIC_COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.sabq.io' : undefined);
    const deleteCookie = (name: string) => {
      response.cookies.set(name, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } as any : {}),
      });
    };
    // HttpOnly
    deleteCookie('sabq_at');
    deleteCookie('sabq_rt');
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    // واجهة غير حساسة
    response.cookies.set('auth-token', '', { httpOnly: false, maxAge: 0, path: '/', ...(cookieDomain ? { domain: cookieDomain } as any : {}) });
    response.cookies.set('user', '', { httpOnly: false, maxAge: 0, path: '/', ...(cookieDomain ? { domain: cookieDomain } as any : {}) });

    return response;

  } catch (error: any) {
    console.error('Logout API error:', error);
    
    // حتى لو حدث خطأ، نعتبر الخروج ناجحاً لأغراض الأمان
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تسجيل الخروج'
      },
      { status: 200 }
    );

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('auth-token');
    response.cookies.delete('user');

    return response;
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