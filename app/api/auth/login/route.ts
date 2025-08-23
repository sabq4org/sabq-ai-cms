// API لتسجيل الدخول - نظام سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService, UserLoginSchema, SecurityManager } from '@/lib/auth/user-management';
import { authRateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  // تطبيق Rate Limiting للحماية من Brute Force
  return authRateLimit(request, async () => {
    try {
    const body = await request.json();
    
    // التحقق من صحة البيانات
    const validationResult = UserLoginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات غير صحيحة',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    // جمع معلومات الجلسة
    const sessionInfo = {
      ip_address: SecurityManager.cleanIpAddress(request),
      user_agent: request.headers.get('user-agent') || undefined,
      device_type: getDeviceType(request.headers.get('user-agent') || '')
    };

    // تسجيل الدخول
    const result = await UserManagementService.loginUser(
      validationResult.data, 
      sessionInfo
    );

    if (!result.success) {
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
        message: result.message,
        user: {
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.name,
          role: result.user?.role,
          is_admin: result.user?.is_admin,
          is_verified: result.user?.is_verified,
          avatar: result.user?.avatar,
          profile_completed: result.user?.profile_completed,
          loyalty_points: result.user?.loyalty_points,
          preferred_language: result.user?.preferred_language
        },
        token: result.access_token
      },
      { status: 200 }
    );

    // تعيين cookies آمنة (دعم الدومين العلوي لمشاركة الجلسة بين sabq.io و www.sabq.io)
    if (result.access_token && result.refresh_token) {
      const cookieDomain = process.env.COOKIE_DOMAIN || process.env.NEXT_PUBLIC_COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.sabq.io' : undefined);
      const remember = validationResult.data.remember_me === true;
      // توليد CSRF token بسيط
      const csrfToken = Math.random().toString(36).slice(2);

      // كوكيز موحدة: sabq_at (access) + sabq_rt (refresh)
      response.cookies.set('sabq_at', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 دقيقة
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } as any : {}),
      });

      // إبقاء كوكي متوافق للواجهة الحالية (قابل للإزالة لاحقًا)
      response.cookies.set('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60,
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } as any : {}),
      });

      // auth-token (غير HttpOnly) للاستخدام المؤقت في الواجهة القديمة – سيزال لاحقًا
      response.cookies.set('auth-token', result.access_token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: remember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } as any : {}),
      });

      response.cookies.set('sabq_rt', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: remember ? 60 * 24 * 60 * 60 : 30 * 24 * 60 * 60, // 60 يوم مع تذكرني
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } as any : {}),
      });

      // إبقاء refresh_token لأغراض التوافق مع بعض المسارات القديمة
      response.cookies.set('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: remember ? 60 * 24 * 60 * 60 : 30 * 24 * 60 * 60,
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } as any : {}),
      });

      // تعيين CSRF token غير HttpOnly
      response.cookies.set('csrf-token', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: remember ? 60 * 24 * 60 * 60 : 30 * 24 * 60 * 60,
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } as any : {}),
      });
    }

    return response;

    } catch (error: any) {
      console.error('Login API error:', error);
      
      return NextResponse.json(
        {
          success: false,
          error: 'خطأ داخلي في الخادم'
        },
        { status: 500 }
      );
    }
  });
}

// دالة لتحديد نوع الجهاز
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) {
    return 'mobile';
  } else if (/tablet/i.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
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