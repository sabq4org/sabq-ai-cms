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
    
    // الحصول على refresh token من الكوكيز الموحدة
    const { refreshToken } = getUnifiedAuthTokens(request);
    
    console.log('🔍 الكوكيز المتاحة:', request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })));
    
    if (!refreshToken) {
      console.log('❌ لا يوجد refresh token');
      
      const response = NextResponse.json(
        {
          success: false,
          error: 'رمز التجديد مطلوب',
          code: 'NO_REFRESH_TOKEN'
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
    const result = await UserManagementService.refreshAccessToken(refreshToken);

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

    // إنشاء الاستجابة الناجحة
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تجديد الرمز بنجاح'
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