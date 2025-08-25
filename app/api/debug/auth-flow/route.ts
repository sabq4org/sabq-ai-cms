/**
 * API endpoint لتشخيص مشاكل تدفق المصادقة
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  // جمع معلومات التشخيص
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent')
    },
    cookies: {
      count: allCookies.length,
      names: allCookies.map(c => c.name),
      authCookies: {
        hasAccessToken: allCookies.some(c => 
          c.name === '__Host-sabq-access-token' || 
          c.name === 'sabq-access-token' || 
          c.name === 'sabq_at'
        ),
        hasRefreshToken: allCookies.some(c => 
          c.name === 'sabq-refresh-token' || 
          c.name === 'sabq_rt'
        ),
        hasCsrfToken: allCookies.some(c => c.name === 'sabq-csrf-token')
      },
      details: allCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        length: c.value?.length || 0
      }))
    },
    sessionStorage: {
      note: 'Cannot access from server side'
    },
    flowCheck: {
      isLoginPage: request.headers.get('referer')?.includes('/login'),
      is2FAPage: request.headers.get('referer')?.includes('/2fa'),
      isAdminFlow: request.headers.get('referer')?.includes('/admin')
    },
    recommendations: []
  };
  
  // توصيات بناءً على التحليل
  if (!diagnostics.cookies.authCookies.hasAccessToken) {
    diagnostics.recommendations.push('لا يوجد access token - المستخدم غير مسجل دخول');
  }
  
  if (diagnostics.flowCheck.is2FAPage && !diagnostics.cookies.authCookies.hasAccessToken) {
    diagnostics.recommendations.push('مشكلة: صفحة 2FA بدون access token - قد يكون هناك خطأ في تدفق المصادقة');
  }
  
  if (diagnostics.flowCheck.isAdminFlow && !diagnostics.cookies.authCookies.hasAccessToken) {
    diagnostics.recommendations.push('محاولة دخول لوحة تحكم بدون مصادقة');
  }
  
  return NextResponse.json({
    success: true,
    diagnostics
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}
