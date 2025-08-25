// API لتجديد access token - نظام سبق الذكية (محسّن وموحد)
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/lib/auth/user-management';
import { 
  getUnifiedAuthTokens, 
  updateAccessToken, 
  setCORSHeaders, 
  setNoCache 
} from '@/lib/auth-cookies-unified';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 بدء عملية تجديد التوكن...');
    console.log('🔍 Headers:', {
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent')?.includes('Firefox') ? 'Firefox' : 'Other'
    });
    
    // الحصول على refresh token من الكوكيز الموحدة
    const { refreshToken } = getUnifiedAuthTokens(request);
    
    console.log('🔍 الكوكيز المتاحة:', request.cookies.getAll().map(c => ({ 
      name: c.name, 
      hasValue: !!c.value
    })));
    
    // محاولة قراءة refresh token من مصادر إضافية للتوافقية
    let finalRefreshToken = refreshToken;
    if (!finalRefreshToken) {
      // البحث في كوكيز legacy
      const legacyTokens = ['sabq_rt', 'refresh_token', 'sabq-refresh-token'];
      for (const cookieName of legacyTokens) {
        const value = request.cookies.get(cookieName)?.value;
        if (value) {
          console.log(`🔄 وُجد refresh token في ${cookieName}`);
          finalRefreshToken = value;
          break;
        }
      }
    }
    
    if (!finalRefreshToken) {
      console.log('❌ لا يوجد refresh token في أي مصدر');
      
      const response = NextResponse.json(
        {
          success: false,
          error: 'رمز التجديد مطلوب',
          code: 'NO_REFRESH_TOKEN',
          debug: process.env.NODE_ENV === 'development' ? {
            cookies: request.cookies.getAll().map(c => c.name),
            headers: {
              cookie: !!request.headers.get('cookie')
            }
          } : undefined
        },
        { status: 400 }
      );
      
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }

    console.log('✅ تم العثور على refresh token');

    // تجديد الرمز
    console.log('🔑 محاولة تجديد التوكن...');
    const result = await UserManagementService.refreshAccessToken(finalRefreshToken);

    if (result.error || !result.access_token) {
      console.log('❌ فشل تجديد التوكن:', result.error);
      
      const response = NextResponse.json(
        {
          success: false,
          error: result.error || 'فشل في تجديد الرمز',
          code: 'REFRESH_FAILED'
        },
        { status: 401 }
      );
      
      setCORSHeaders(response, request.headers.get('origin') || undefined);
      setNoCache(response);
      return response;
    }

    console.log('✅ تم تجديد التوكن بنجاح');

    // إنشاء الاستجابة الناجحة مع إرسال التوكن (حسب البرومنت)
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تجديد الرمز بنجاح',
        accessToken: result.access_token, // إضافة التوكن للاستجابة
        accessTokenExp: Date.now() + 15 * 60 * 1000, // 15 دقيقة
        userVersion: Date.now() // لتتبع إصدار البيانات
      },
      { status: 200 }
    );

    // تحديث access token في الكوكيز
    updateAccessToken(response, result.access_token);
    
    // تعيين رؤوس CORS وعدم التخزين المؤقت
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);

    console.log('🎉 تم تجديد التوكن ورد الاستجابة بنجاح');
    return response;

  } catch (error: any) {
    console.error('❌ خطأ في API تجديد التوكن:', error);
    
    const response = NextResponse.json(
      {
        success: false,
        error: 'خطأ داخلي في الخادم',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
    
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);
    return response;
  }
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS(request: NextRequest) {
  console.log('🌐 معالجة طلب OPTIONS للـ CORS');
  
  const response = new NextResponse(null, { status: 200 });
  setCORSHeaders(response, request.headers.get('origin') || undefined);
  return response;
}