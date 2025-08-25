/**
 * API endpoint لتشخيص مشاكل الكوكيز - خاص بـ Firefox على sabq.io
 */

import { NextRequest, NextResponse } from 'next/server';
import { debugCookieIssues, isFirefox } from '@/lib/firefox-cookie-helper';
import { getUnifiedAuthTokens } from '@/lib/auth-cookies-unified';
import { getAuthenticatedUser } from '@/lib/getAuthenticatedUser';

export async function GET(request: NextRequest) {
  console.log('🔍 بدء تشخيص الكوكيز...');
  
  const userAgent = request.headers.get('user-agent') || '';
  const host = request.headers.get('host') || '';
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  
  // تشخيص مشاكل الكوكيز
  const cookieDebug = debugCookieIssues(request);
  
  // قراءة الكوكيز الموحدة
  const { accessToken, refreshToken, userSession } = getUnifiedAuthTokens(request);
  
  // محاولة المصادقة
  let authStatus = 'not_checked';
  let authUser = null;
  try {
    const authResult = await getAuthenticatedUser(request);
    if (authResult.user) {
      authStatus = 'authenticated';
      authUser = {
        id: authResult.user.id,
        email: authResult.user.email,
        tokenSource: authResult.tokenSource
      };
    } else {
      authStatus = `failed: ${authResult.reason}`;
    }
  } catch (e: any) {
    authStatus = `error: ${e.message}`;
  }
  
  // جمع جميع الكوكيز مع تفاصيلها
  const allCookies = request.cookies.getAll().map(cookie => ({
    name: cookie.name,
    hasValue: !!cookie.value,
    length: cookie.value?.length || 0,
    // Note: RequestCookie type doesn't expose these properties
    // sameSite, secure, httpOnly, path are not available in Next.js cookie API
  }));
  
  // تحليل المشاكل المحتملة
  const analysis = {
    browser: {
      isFirefox: isFirefox(userAgent),
      userAgent: userAgent.substring(0, 100) + '...'
    },
    environment: {
      host,
      origin,
      referer,
      protocol: request.url.startsWith('https') ? 'https' : 'http',
      isProduction: process.env.NODE_ENV === 'production'
    },
    cookies: {
      total: allCookies.length,
      authCookiesFound: cookieDebug.cookiesFound.filter(name => 
        name.includes('sabq') || name.includes('auth') || name.includes('token')
      ),
      allCookies
    },
    tokens: {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUserSession: !!userSession
    },
    authentication: {
      status: authStatus,
      user: authUser
    },
    possibleIssues: cookieDebug.possibleIssues,
    recommendations: []
  };
  
  // توصيات بناءً على التحليل
  if (isFirefox(userAgent)) {
    analysis.recommendations.push('Firefox detected - using compatible cookie settings');
    
    if (allCookies.some(c => c.name.startsWith('__Host-'))) {
      analysis.recommendations.push('WARNING: __Host- cookies found in Firefox - may cause issues');
    }
    
    if (!accessToken && !refreshToken) {
      analysis.recommendations.push('No auth tokens found - user needs to login');
    }
  }
  
  if (host.includes('sabq.io') && !host.startsWith('www.')) {
    analysis.recommendations.push('Consider using www.sabq.io for better cookie consistency');
  }
  
  // إرجاع النتائج
  const response = NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    analysis
  }, { status: 200 });
  
  // إضافة headers للتشخيص
  response.headers.set('X-Debug-Mode', 'true');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  return response;
}

// دعم OPTIONS للـ CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
