/**
 * Helper ذكي لإعداد كوكيز المصادقة بشكل صحيح
 * يحل مشكلة Domain mismatch وانتهاكات __Host- cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

const MAX_AGE_ACCESS = 60 * 60 * 24; // 24 ساعة
const MAX_AGE_REFRESH = 60 * 60 * 24 * 30; // 30 يوم
const MAX_AGE_EXTENDED = 60 * 60 * 24 * 60; // 60 يوم مع "تذكرني"

/**
 * استخراج root domain الصحيح من Host header
 */
function getRootDomainFromHost(host?: string): string | undefined {
  if (!host) return undefined;
  
  // إزالة المنفذ إذا كان موجود
  const cleanHost = host.split(':')[0].toLowerCase();
  
  // تحديد الدومين الجذر بناءً على Host الحالي
  if (cleanHost.endsWith('.sabq.io') || cleanHost === 'sabq.io') {
    return '.sabq.io'; // يدعم جميع subdomains لـ sabq.io
  }
  
  if (cleanHost.endsWith('.sabq.me') || cleanHost === 'sabq.me') {
    return '.sabq.me'; // يدعم جميع subdomains لـ sabq.me
  }
  
  // للتطوير المحلي أو دومينات غير معروفة
  if (cleanHost.startsWith('localhost') || cleanHost.startsWith('127.0.0.1')) {
    return undefined; // host-only cookies للتطوير
  }
  
  // fallback: إرجاع undefined لجعل الكوكيز host-only
  return undefined;
}

/**
 * فحص ما إذا كانت البيئة محلية
 */
function isLocalEnvironment(host?: string): boolean {
  if (!host) return false;
  const cleanHost = host.split(':')[0].toLowerCase();
  return cleanHost.startsWith('localhost') || 
         cleanHost.startsWith('127.0.0.1') || 
         cleanHost === '0.0.0.0';
}

/**
 * فحص ما إذا كانت البيئة آمنة (HTTPS)
 */
function isSecureEnvironment(protocol?: string): boolean {
  return protocol === 'https:' || process.env.NODE_ENV === 'production';
}

/**
 * تعيين كوكيز المصادقة الذكية
 */
export function setSmartAuthCookies(
  request: NextRequest,
  response: NextResponse,
  tokens: {
    access: string;
    refresh: string;
    session?: string;
    csrf?: string;
  },
  options: {
    rememberMe?: boolean;
    userInfo?: any;
  } = {}
) {
  const { rememberMe = false } = options;
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 
                   (request.url?.startsWith('https://') ? 'https:' : 'http:');
  
  const isLocal = isLocalEnvironment(host || undefined);
  const isSecure = isSecureEnvironment(protocol);
  const rootDomain = getRootDomainFromHost(host || undefined);
  const maxAge = rememberMe ? MAX_AGE_EXTENDED : MAX_AGE_REFRESH;
  
  console.log('🍪 إعداد الكوكيز الذكية:');
  console.log(`  - Host: ${host}`);
  console.log(`  - Protocol: ${protocol}`);
  console.log(`  - Is Local: ${isLocal}`);
  console.log(`  - Is Secure: ${isSecure}`);
  console.log(`  - Root Domain: ${rootDomain || 'undefined (host-only)'}`);
  
  const cookies: string[] = [];
  
  if (isLocal) {
    // بيئة التطوير: استخدام كوكيز عادية host-only
    console.log('  - وضع التطوير: كوكيز عادية');
    
    cookies.push(serialize('sabq-access-token', tokens.access, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: MAX_AGE_ACCESS,
      // لا domain للتطوير المحلي
    }));
    
    cookies.push(serialize('sabq_rft', tokens.refresh, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge,
    }));
    
    if (tokens.session) {
      cookies.push(serialize('sabq-user-session', tokens.session, {
        path: '/',
        sameSite: 'lax',
        maxAge,
        // session cookie ليس httpOnly للقراءة من JS
      }));
    }
    
    if (tokens.csrf) {
      cookies.push(serialize('sabq-csrf-token', tokens.csrf, {
        path: '/',
        sameSite: 'lax',
        maxAge,
        // CSRF token ليس httpOnly للإرسال في headers
      }));
    }
    
  } else {
    // بيئة الإنتاج: استخدام __Host- cookies بدون Domain
    console.log('  - وضع الإنتاج: __Host- cookies');
    
    // ✅ __Host- cookies يجب أن تكون بدون Domain
    cookies.push(serialize('__Host-sabq-access-token', tokens.access, {
      path: '/',
      httpOnly: true,
      secure: true, // مطلوب لـ __Host-
      sameSite: 'lax',
      maxAge: MAX_AGE_ACCESS,
      // ❌ لا نضع Domain مع __Host-
    }));
    
    cookies.push(serialize('__Host-sabq-refresh', tokens.refresh, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge,
      // ❌ لا نضع Domain مع __Host-
    }));
    
    if (tokens.session) {
      cookies.push(serialize('__Host-sabq-user-session', tokens.session, {
        path: '/',
        secure: true,
        sameSite: 'lax',
        maxAge,
        // session cookie ليس httpOnly للقراءة من JS
        // ❌ لا نضع Domain مع __Host-
      }));
    }
    
    // CSRF token: كوكي عادي يمكن الوصول إليه من JS
    if (tokens.csrf) {
      cookies.push(serialize('sabq-csrf-token', tokens.csrf, {
        path: '/',
        secure: true,
        sameSite: 'lax',
        maxAge,
        // يمكن إضافة domain للـ CSRF إذا كان مطلوب عبر subdomains
        ...(rootDomain && { domain: rootDomain })
      }));
    }
    
    // ✅ إذا كنت تحتاج كوكي يعمل عبر subdomains، استخدم كوكي عادي مع Domain
    // مثال: كوكي إعدادات عامة
    if (rootDomain) {
      cookies.push(serialize('sabq-domain-scope', '1', {
        path: '/',
        domain: rootDomain, // ✅ مسموح للكوكيز العادية
        secure: true,
        sameSite: 'lax',
        maxAge: MAX_AGE_EXTENDED,
      }));
    }
  }
  
  // تطبيق الكوكيز
  response.headers.set('Set-Cookie', cookies.join(', '));
  
  console.log(`✅ تم تعيين ${cookies.length} كوكيز بنجاح`);
  cookies.forEach((cookie, i) => {
    const name = cookie.split('=')[0];
    console.log(`  ${i + 1}. ${name}`);
  });
}

/**
 * مسح جميع كوكيز المصادقة الذكية
 */
export function clearSmartAuthCookies(
  request: NextRequest,
  response: NextResponse
) {
  const host = request.headers.get('host');
  const isLocal = isLocalEnvironment(host || undefined);
  const rootDomain = getRootDomainFromHost(host || undefined);
  
  console.log('🧹 مسح الكوكيز الذكية...');
  
  const cookiesToClear = isLocal 
    ? [
        'sabq-access-token',
        'sabq_rft', 
        'sabq-user-session',
        'sabq-csrf-token'
      ]
    : [
        '__Host-sabq-access-token',
        '__Host-sabq-refresh',
        '__Host-sabq-user-session',
        'sabq-csrf-token',
        'sabq-domain-scope'
      ];
  
  // إضافة كوكيز قديمة للمسح
  const legacyCookies = [
    'sabq_at', 'sabq_rt', 'access_token', 'refresh_token',
    'auth-token', 'user', 'token', 'jwt'
  ];
  
  cookiesToClear.push(...legacyCookies);
  
  const clearCookies: string[] = [];
  
  cookiesToClear.forEach(cookieName => {
    // مسح host-only
    clearCookies.push(serialize(cookieName, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    }));
    
    // مسح مع domain إذا كان موجود
    if (rootDomain && !cookieName.startsWith('__Host-')) {
      clearCookies.push(serialize(cookieName, '', {
        path: '/',
        domain: rootDomain,
        maxAge: 0,
        expires: new Date(0),
      }));
    }
  });
  
  response.headers.set('Set-Cookie', clearCookies.join(', '));
  console.log(`🧹 تم مسح ${clearCookies.length} كوكيز`);
}

/**
 * قراءة الكوكيز الذكية مع fallback
 */
export function getSmartAuthCookies(request: NextRequest): {
  accessToken: string | null;
  refreshToken: string | null;
  userSession: any | null;
  csrfToken: string | null;
} {
  const host = request.headers.get('host');
  const isLocal = isLocalEnvironment(host || undefined);
  
  // أولوية قراءة الكوكيز حسب البيئة
  const accessCookieNames = isLocal 
    ? ['sabq-access-token', '__Host-sabq-access-token', 'sabq_at']
    : ['__Host-sabq-access-token', 'sabq-access-token', 'sabq_at'];
    
  const refreshCookieNames = ['sabq_rft', '__Host-sabq-refresh', 'sabq_rt'];
  
  const sessionCookieNames = isLocal
    ? ['sabq-user-session', '__Host-sabq-user-session', 'user']
    : ['__Host-sabq-user-session', 'sabq-user-session', 'user'];
  
  // قراءة الكوكيز
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let userSession: any = null;
  let csrfToken: string | null = null;
  
  // البحث عن access token
  for (const name of accessCookieNames) {
    const cookie = request.cookies.get(name);
    if (cookie?.value) {
      accessToken = cookie.value;
      break;
    }
  }
  
  // البحث عن refresh token
  for (const name of refreshCookieNames) {
    const cookie = request.cookies.get(name);
    if (cookie?.value) {
      refreshToken = cookie.value;
      break;
    }
  }
  
  // البحث عن session
  for (const name of sessionCookieNames) {
    const cookie = request.cookies.get(name);
    if (cookie?.value) {
      try {
        userSession = JSON.parse(decodeURIComponent(cookie.value));
        break;
      } catch (e) {
        console.warn(`⚠️ فشل في قراءة ${name}:`, e);
      }
    }
  }
  
  // قراءة CSRF token
  const csrfCookie = request.cookies.get('sabq-csrf-token');
  if (csrfCookie?.value) {
    csrfToken = csrfCookie.value;
  }
  
  return { accessToken, refreshToken, userSession, csrfToken };
}

const smartCookieHelper = {
  setSmartAuthCookies,
  clearSmartAuthCookies,
  getSmartAuthCookies,
  getRootDomainFromHost,
  isLocalEnvironment,
  isSecureEnvironment
};

export default smartCookieHelper;
