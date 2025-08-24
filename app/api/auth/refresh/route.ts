// API لتجديد access token - نظام سبق الذكية (محسّن وموحد)
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/lib/auth/user-management';
import { 
  getUnifiedAuthTokens, 
  updateAccessToken, 
  setCORSHeaders, 
  setNoCache 
} from '@/lib/auth-cookies-unified';

// Helper function to mask tokens for safe logging
function maskToken(token: string | null | undefined): string {
  if (!token) return 'null';
  if (token.length <= 10) return '***masked***';
  return token.substring(0, 6) + '...' + token.substring(token.length - 4);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 [SERVER] Token refresh request received...');
    
    // Enhanced debugging: log request details
    console.log('📋 [SERVER] Request details:');
    console.log('  - Method:', request.method);
    console.log('  - URL:', request.url);
    console.log('  - User-Agent:', request.headers.get('user-agent')?.substring(0, 50) + '...');
    console.log('  - Origin:', request.headers.get('origin'));
    console.log('  - Referer:', request.headers.get('referer'));
    
    // Log important headers
    console.log('🔍 [SERVER] Important headers:');
    const importantHeaders = [
      'content-type',
      'x-requested-with', 
      'x-csrf-token',
      'authorization',
      'cookie'
    ];
    
    importantHeaders.forEach(headerName => {
      const headerValue = request.headers.get(headerName);
      if (headerName === 'cookie') {
        console.log(`  ${headerName}: ${headerValue ? 'present (' + headerValue.split(';').length + ' cookies)' : 'missing'}`);
      } else if (headerName === 'authorization') {
        console.log(`  ${headerName}: ${headerValue ? maskToken(headerValue) : 'missing'}`);
      } else {
        console.log(`  ${headerName}: ${headerValue || 'missing'}`);
      }
    });
    
    // Log all cookies for debugging
    console.log('🍪 [SERVER] All cookies received:');
    request.cookies.getAll().forEach(cookie => {
      if (cookie.name.includes('token') || cookie.name.includes('rft') || cookie.name.includes('sabq')) {
        console.log(`  ${cookie.name}: ${maskToken(cookie.value)}`);
      } else {
        console.log(`  ${cookie.name}: ${cookie.value ? 'present' : 'empty'}`);
      }
    });
    
    // الحصول على refresh token من الكوكيز الموحدة
    const { refreshToken } = getUnifiedAuthTokens(request);
    
    if (!refreshToken) {
      console.log('❌ [SERVER] No refresh token found in cookies');
      console.log('📊 [SERVER] Rejection reason: missing refresh token cookie');
      
      // Log specific cookie names checked
      const checkedCookies = ['sabq_rft', '__Host-sabq-refresh', 'refresh_token'];
      console.log('🔍 [SERVER] Checked cookie names:', checkedCookies);
      checkedCookies.forEach(name => {
        const value = request.cookies.get(name)?.value;
        console.log(`  ${name}: ${value ? 'found but empty/invalid' : 'not found'}`);
      });
      
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

    console.log('✅ [SERVER] Refresh token found - masked:', maskToken(refreshToken));

    // تجديد الرمز
    console.log('🔑 [SERVER] Attempting token refresh...');
    const result = await UserManagementService.refreshAccessToken(refreshToken);

    if (result.error || !result.access_token) {
      console.log('❌ [SERVER] Token refresh failed:', result.error);
      console.log('📊 [SERVER] Rejection reason: refresh token validation failed');
      
      // Log specific error details
      if (result.error) {
        const errorLower = result.error.toLowerCase();
        if (errorLower.includes('expired')) {
          console.log('🎯 [SERVER] Specific reason: refresh token expired');
        } else if (errorLower.includes('invalid') || errorLower.includes('malformed')) {
          console.log('🎯 [SERVER] Specific reason: refresh token invalid or malformed');
        } else if (errorLower.includes('user')) {
          console.log('🎯 [SERVER] Specific reason: user not found or disabled');
        } else {
          console.log('🎯 [SERVER] Specific reason: unknown -', result.error);
        }
      }
      
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

    console.log('✅ [SERVER] Token refresh successful');
    console.log('🔑 [SERVER] New access token generated - masked:', maskToken(result.access_token));

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
    console.log('🍪 [SERVER] Setting access token in cookies...');
    updateAccessToken(response, result.access_token);
    
    // Log cookie headers being set (for debugging)
    console.log('📤 [SERVER] Response headers being set:');
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        // Mask cookie values in logs
        const maskedValue = value.includes('__Host-sabq-access-token') 
          ? value.replace(/=([^;]+)/, `=${maskToken('$1')}`)
          : value;
        console.log(`  ${key}: ${maskedValue}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    // تعيين رؤوس CORS وعدم التخزين المؤقت
    setCORSHeaders(response, request.headers.get('origin') || undefined);
    setNoCache(response);

    console.log('🎉 [SERVER] Token refresh completed successfully');
    return response;

  } catch (error: any) {
    console.error('❌ [SERVER] Unexpected error in token refresh:', error);
    console.error('📊 [SERVER] Error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack?.split('\n').slice(0, 3) || 'No stack trace',
      name: error?.name || 'Unknown'
    });
    
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