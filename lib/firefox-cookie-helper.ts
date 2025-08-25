/**
 * مساعد خاص لحل مشاكل Firefox مع الكوكيز على sabq.io
 * Firefox له سلوك خاص مع __Host- cookies و SameSite
 */

import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

/**
 * كشف ما إذا كان المتصفح Firefox
 */
export function isFirefox(userAgent: string | null): boolean {
  return userAgent ? userAgent.toLowerCase().includes('firefox') : false;
}

/**
 * إعداد كوكيز متوافقة مع Firefox لـ sabq.io
 */
export function setFirefoxCompatibleCookies(
  response: NextResponse,
  tokens: {
    accessToken: string;
    refreshToken: string;
    csrfToken?: string;
  },
  options: {
    rememberMe?: boolean;
    isProduction?: boolean;
  } = {}
) {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === 'production';
  const baseMaxAge = options.rememberMe ? 60 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 60 أو 7 أيام
  
  console.log('🦊 تعيين كوكيز متوافقة مع Firefox...');
  
  // 1. Access Token - نتجنب __Host- في Firefox لأنه قد يسبب مشاكل
  const accessCookieName = isProduction ? 'sabq-access-token' : 'sabq-access-token';
  const accessCookie = serialize(accessCookieName, tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    domain: isProduction ? '.sabq.io' : undefined, // دعم subdomains في الإنتاج
    maxAge: 24 * 60 * 60 // 24 ساعة
  });
  
  response.headers.append('Set-Cookie', accessCookie);
  console.log(`✅ ${accessCookieName} set with domain: ${isProduction ? '.sabq.io' : 'host-only'}`);
  
  // 2. Refresh Token
  const refreshCookie = serialize('sabq-refresh-token', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    domain: isProduction ? '.sabq.io' : undefined,
    maxAge: baseMaxAge
  });
  
  response.headers.append('Set-Cookie', refreshCookie);
  console.log(`✅ sabq-refresh-token set`);
  
  // 3. Legacy cookies للتوافقية
  const legacyCookies = [
    { name: 'sabq_at', value: tokens.accessToken, maxAge: 24 * 60 * 60 },
    { name: 'sabq_rt', value: tokens.refreshToken, maxAge: baseMaxAge }
  ];
  
  legacyCookies.forEach(({ name, value, maxAge }) => {
    const cookie = serialize(name, value, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain: isProduction ? '.sabq.io' : undefined,
      maxAge
    });
    response.headers.append('Set-Cookie', cookie);
  });
  
  console.log('✅ Legacy cookies set for Firefox compatibility');
  
  // 4. CSRF Token (non-httpOnly)
  if (tokens.csrfToken) {
    const csrfCookie = serialize('sabq-csrf-token', tokens.csrfToken, {
      httpOnly: false, // يحتاج JavaScript access
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain: isProduction ? '.sabq.io' : undefined,
      maxAge: baseMaxAge
    });
    
    response.headers.append('Set-Cookie', csrfCookie);
    console.log('✅ CSRF token set');
  }
  
  return response;
}

/**
 * قراءة التوكن مع أولوية خاصة لـ Firefox
 */
export function getTokenForFirefox(request: NextRequest): string | null {
  const firefoxPriority = [
    'sabq-access-token',      // الكوكي الأساسي بدون __Host-
    'sabq_at',                // Legacy fallback
    'auth-token',             // Fallback عام
    '__Host-sabq-access-token', // محاولة أخيرة
    'access_token',
    'token'
  ];
  
  for (const cookieName of firefoxPriority) {
    const value = request.cookies.get(cookieName)?.value;
    if (value) {
      console.log(`🦊 Firefox: وُجد التوكن في ${cookieName}`);
      return value;
    }
  }
  
  return null;
}

/**
 * التحقق من دعم __Host- في المتصفح الحالي
 */
export function supportsHostPrefix(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Firefox قد يواجه مشاكل مع __Host- في بعض الإصدارات
  if (isFirefox(userAgent)) {
    // فحص إصدار Firefox إذا لزم الأمر
    const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
    if (firefoxMatch) {
      const version = parseInt(firefoxMatch[1], 10);
      // Firefox 91+ يدعم __Host- بشكل أفضل
      return version >= 91;
    }
    return false;
  }
  
  // المتصفحات الأخرى تدعمها بشكل عام
  return true;
}

/**
 * تنظيف الكوكيز المتعارضة
 */
export function cleanupConflictingCookies(response: NextResponse): void {
  const cookiesToClean = [
    // مسح النسخ المتعارضة مع domains مختلفة
    { name: '__Host-sabq-access-token', domain: undefined },
    { name: 'sabq-access-token', domain: undefined },
    { name: 'sabq-access-token', domain: '.sabq.io' },
    { name: 'sabq_at', domain: undefined },
    { name: 'sabq_at', domain: '.sabq.io' }
  ];
  
  cookiesToClean.forEach(({ name, domain }) => {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      ...(domain && { domain })
    };
    
    const cookie = serialize(name, '', cookieOptions);
    response.headers.append('Set-Cookie', cookie);
  });
}

/**
 * مساعد لتشخيص مشاكل الكوكيز
 */
export function debugCookieIssues(request: NextRequest): {
  browser: string;
  cookiesFound: string[];
  possibleIssues: string[];
} {
  const userAgent = request.headers.get('user-agent') || '';
  const isFF = isFirefox(userAgent);
  const cookies = request.cookies.getAll();
  
  const possibleIssues: string[] = [];
  
  if (isFF) {
    // فحص مشاكل Firefox الشائعة
    const hasHostPrefixCookie = cookies.some(c => c.name.startsWith('__Host-'));
    if (hasHostPrefixCookie) {
      possibleIssues.push('Firefox قد يواجه مشاكل مع __Host- cookies');
    }
    
    // فحص الكوكيز المكررة
    const cookieNames = new Set<string>();
    const duplicates = new Set<string>();
    cookies.forEach(c => {
      if (cookieNames.has(c.name)) {
        duplicates.add(c.name);
      }
      cookieNames.add(c.name);
    });
    
    if (duplicates.size > 0) {
      possibleIssues.push(`كوكيز مكررة: ${Array.from(duplicates).join(', ')}`);
    }
  }
  
  // فحص عدم وجود كوكيز المصادقة
  const authCookies = [
    'sabq-access-token', '__Host-sabq-access-token', 
    'sabq_at', 'auth-token', 'access_token'
  ];
  const hasAuthCookie = cookies.some(c => authCookies.includes(c.name));
  if (!hasAuthCookie) {
    possibleIssues.push('لا توجد كوكيز مصادقة');
  }
  
  return {
    browser: isFF ? 'Firefox' : 'Other',
    cookiesFound: cookies.map(c => c.name),
    possibleIssues
  };
}

export default {
  isFirefox,
  setFirefoxCompatibleCookies,
  getTokenForFirefox,
  supportsHostPrefix,
  cleanupConflictingCookies,
  debugCookieIssues
};
