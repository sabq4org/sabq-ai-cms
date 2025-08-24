// API لتسجيل الخروج - نظام سبق الذكية (محسّن وموحد)
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/lib/auth/user-management';
import { 
  getUnifiedAuthTokens, 
  clearAllAuthCookies, 
  setCORSHeaders, 
  setNoCache 
} from '@/lib/auth-cookies-unified';

export async function POST(request: NextRequest) {
  try {
    console.log('👋 بدء عملية تسجيل الخروج...');

    // الحصول على access token من الكوكيز الموحدة أو headers
    const { accessToken } = getUnifiedAuthTokens(request);
    let token = accessToken;

    if (!token) {
      // محاولة من Authorization header كـ fallback
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('🔑 تم العثور على التوكن في Header');
      }
    }

    if (token) {
      try {
        // تسجيل الخروج من النظام
        const result = await UserManagementService.logoutUser(token);
        console.log('✅ تم تسجيل الخروج من النظام:', result.message);
      } catch (logoutError) {
        console.warn('⚠️ خطأ في تسجيل الخروج من النظام (غير حاسم):', logoutError);
      }
    }

    // إنشاء الاستجابة الناجحة
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تسجيل الخروج بنجاح',
        code: 'LOGOUT_SUCCESS'
      },
      { status: 200 }
    );

    // مسح جميع كوكيز المصادقة (الموحدة والقديمة)
    clearAllAuthCookies(response);
    
    // تعيين رؤوس CORS وعدم التخزين المؤقت
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);

    console.log('🎉 تم تسجيل الخروج بنجاح ومسح جميع الكوكيز');
    return response;

  } catch (error: any) {
    console.error('❌ خطأ في API تسجيل الخروج:', error);
    
    // حتى لو حدث خطأ، نعتبر الخروج ناجحاً لأغراض الأمان
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تسجيل الخروج',
        code: 'LOGOUT_FORCED'
      },
      { status: 200 }
    );

    // مسح الكوكيز حتى في حالة الخطأ
    clearAllAuthCookies(response);
    
    // تعيين رؤوس CORS وعدم التخزين المؤقت
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