// API لتسجيل الدخول - نظام سبق الذكية (محسّن وموحد)
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService, UserLoginSchema, SecurityManager } from '@/lib/auth/user-management';
import { authRateLimit } from '@/lib/rate-limiter';
import { 
  setAuthCookies, 
  generateCSRFToken 
} from '@/lib/setAuthCookies';
import { setCORSHeaders, setNoCache } from '@/lib/auth-cookies-unified';

export async function POST(request: NextRequest) {
  // تطبيق Rate Limiting للحماية من Brute Force
  return authRateLimit(request, async () => {
    try {
      console.log('🔐 بدء عملية تسجيل الدخول...');
      
      const body = await request.json();
      
      // التحقق من صحة البيانات
      const validationResult = UserLoginSchema.safeParse(body);
      
      if (!validationResult.success) {
        console.log('❌ بيانات تسجيل الدخول غير صحيحة:', validationResult.error);
        
        const response = NextResponse.json(
          {
            success: false,
            error: 'بيانات غير صحيحة',
            details: validationResult.error.format()
          },
          { status: 400 }
        );
        
        setCORSHeaders(response, request.headers.get('origin') || undefined);
        setNoCache(response);
        return response;
      }

      // جمع معلومات الجلسة للأمان
      const sessionInfo = {
        ip_address: SecurityManager.cleanIpAddress(request),
        user_agent: request.headers.get('user-agent') || undefined,
        device_type: getDeviceType(request.headers.get('user-agent') || '')
      };

      console.log('🔍 محاولة تسجيل دخول للمستخدم:', validationResult.data.email);

      // تسجيل الدخول
      const result = await UserManagementService.loginUser(
        validationResult.data, 
        sessionInfo
      );

      if (!result.success) {
        console.log('❌ فشل تسجيل الدخول:', result.error);
        
        const response = NextResponse.json(
          {
            success: false,
            error: result.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            code: "INVALID_CREDENTIALS"
          },
          { status: 401 }
        );
        
        setCORSHeaders(response, request.headers.get('origin') || undefined);
        setNoCache(response);
        return response;
      }

      // التحقق من 2FA
      if (result.requires2FA) {
        console.log('🔐 يتطلب تحقق ثنائي العامل');
        
        const response = NextResponse.json(
          {
            success: true,
            requires2FA: true,
            tempToken: result.tempToken,
            message: result.message
          },
          { status: 200 }
        );
        
        setCORSHeaders(response, request.headers.get('origin') || undefined);
        setNoCache(response);
        return response;
      }

      console.log('✅ نجح تسجيل الدخول للمستخدم:', result.user?.email);

      // إنشاء الاستجابة الناجحة
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
          }
        },
        { status: 200 }
      );

      // تعيين الكوكيز الديناميكية الآمنة (يحل مشكلة Domain mismatch)
      if (result.access_token && result.refresh_token) {
        const csrfToken = generateCSRFToken();
        const cookieStrings = setAuthCookies(
          request,
          {
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            csrfToken
          },
          {
            rememberMe: validationResult.data.remember_me || false
          }
        );
        
        // إضافة الكوكيز إلى الاستجابة
        cookieStrings.forEach(cookie => {
          response.headers.append('Set-Cookie', cookie);
        });
        
        console.log('🍪 تم تعيين كوكيز المصادقة الديناميكية (حل مشكلة Domain)');
      }

      // تعيين رؤوس CORS وعدم التخزين المؤقت
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);

      console.log('🎉 تم تسجيل الدخول بنجاح');
      return response;

    } catch (error: any) {
      console.error('❌ خطأ في API تسجيل الدخول:', error);
      
      const response = NextResponse.json(
        {
          success: false,
          error: 'خطأ داخلي في الخادم',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
      
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }
  });
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS(request: NextRequest) {
  console.log('🌐 معالجة طلب OPTIONS للـ CORS');
  
  const response = new NextResponse(null, { status: 200 });
  setCORSHeaders(response, request.headers.get('origin') || undefined);
  return response;
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