/**
 * نظام الكوكيز الموحد للمصادقة - سبق الذكية
 * يعالج جميع مشاكل الكوكيز ويضمن الاتساق عبر المنصة
 */

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// إعدادات الكوكيز الموحدة (تطبيق البرومنت)
/**
 * Enhanced cookie configuration to ensure __Host- cookies work correctly
 * Key fix: Domain attribute must NOT be set for __Host- cookies
 */
const COOKIE_CONFIG = {
  // إعدادات الأمان
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  
  // إعدادات الدومين - CRITICAL FIX: Domain must be undefined for __Host- cookies
  // Domain is explicitly omitted for __Host- prefixed cookies as per spec
  // Legacy cookies will still use domain for backward compatibility
  path: '/',
  
  // SameSite Policy موحدة حسب البرومنت: SameSite=Lax
  sameSite: 'lax' as const,
  
  // مدة البقاء
  accessTokenMaxAge: 24 * 60 * 60, // 24 ساعة
  refreshTokenMaxAge: 30 * 24 * 60 * 60, // 30 يوم
  extendedMaxAge: 60 * 24 * 60 * 60, // 60 يوم مع "تذكرني"
};

// Legacy cookie configuration (with domain for backward compatibility)
const LEGACY_COOKIE_CONFIG = {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  domain: process.env.NODE_ENV === 'production' 
    ? '.sabq.me'  // موحد حسب البرومنت للكوكيز القديمة فقط
    : undefined,
  path: '/',
  sameSite: 'lax' as const,
};

// أسماء الكوكيز الموحدة (حسب البرومنت)
export const COOKIE_NAMES = {
  ACCESS_TOKEN: '__Host-sabq-access-token',
  REFRESH_TOKEN: '__Host-sabq-refresh', // Fixed: use __Host- prefix for refresh token too  
  USER_SESSION: '__Host-sabq-user-session',
  CSRF_TOKEN: 'sabq-csrf-token', // غير __Host لأنه يحتاج JavaScript access
} as const;

// أسماء الكوكيز القديمة للتنظيف والـ Fallback (قابلة للتوسعة)
const LEGACY_COOKIES = [
  'sabq_at', 'sabq_rft', 'sabq_rt', 'access_token', 'refresh_token', 
  'auth-token', 'user', 'token', 'jwt'
];

// Future-proofing: قائمة أولويات قراءة التوكن (يمكن إضافة أسماء جديدة)
export const TOKEN_COOKIE_PRIORITY = [
  '__Host-sabq-access-token', // النظام الموحد الحالي (أولوية عليا)
  'sabq_at',                  // النظام القديم الرئيسي
  'access_token',             // Fallback عام
  'auth-token',               // Fallback عام
  'token',                    // Fallback عام
  'jwt'                       // Fallback عام
] as const;

// Refresh token priority (per requirements)
export const REFRESH_TOKEN_COOKIE_PRIORITY = [
  '__Host-sabq-refresh',      // النظام الموحد الجديد (أولوية عليا)
  'sabq_rft',                 // النظام القديم الرئيسي  
  'sabq_rt',                  // Fallback
  'refresh_token',            // Fallback عام
] as const;

/**
 * تعيين كوكيز المصادقة الموحدة
 */
export function setUnifiedAuthCookies(
  response: NextResponse, 
  accessToken: string, 
  refreshToken: string,
  options: {
    rememberMe?: boolean;
    userInfo?: any;
  } = {}
) {
  const { rememberMe = false, userInfo } = options;
  const maxAge = rememberMe ? COOKIE_CONFIG.extendedMaxAge : COOKIE_CONFIG.refreshTokenMaxAge;
  
  // Access Token (24 ساعة دائماً)
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_CONFIG.accessTokenMaxAge,
  });

  // Refresh Token (30-60 يوم حسب "تذكرني")  
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge,
  });

  // User Session Info (معلومات أساسية محدودة)
  if (userInfo) {
    const sessionData = JSON.stringify({
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      role: userInfo.role,
      isAdmin: userInfo.is_admin || false,
      timestamp: Date.now()
    });

    response.cookies.set(COOKIE_NAMES.USER_SESSION, sessionData, {
      ...COOKIE_CONFIG,
      httpOnly: false, // يحتاج للقراءة من JavaScript
      maxAge,
    });
  }

  // CSRF Token (uses legacy config since it's not __Host- prefixed)
  const csrfToken = generateCSRFToken();
  response.cookies.set(COOKIE_NAMES.CSRF_TOKEN, csrfToken, {
    ...LEGACY_COOKIE_CONFIG, // Use legacy config with domain for CSRF token
    httpOnly: false, // يحتاج للإرسال في headers
    maxAge,
  });

  // تنظيف الكوكيز القديمة
  cleanupLegacyCookies(response);

  console.log('🍪 تم تعيين الكوكيز الموحدة بنجاح');
}

/**
 * تحديث Access Token فقط
 */
export function updateAccessToken(response: NextResponse, accessToken: string) {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_CONFIG.accessTokenMaxAge,
  });
  
  console.log('🔄 تم تحديث Access Token');
}

/**
 * قراءة كوكي المصادقة الموحدة - Enhanced with proper fallback priority
 */
export function getUnifiedAuthTokens(request: NextRequest): {
  accessToken: string | null;
  refreshToken: string | null;
  userSession: any | null;
} {
  // Use priority-based token lookup (per requirements)
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let userSession = null;

  // Access token lookup with priority order
  for (const cookieName of TOKEN_COOKIE_PRIORITY) {
    const cookieValue = request.cookies.get(cookieName)?.value;
    if (cookieValue) {
      accessToken = cookieValue;
      break;
    }
  }

  // Refresh token lookup with priority order (per requirements)
  for (const cookieName of REFRESH_TOKEN_COOKIE_PRIORITY) {
    const cookieValue = request.cookies.get(cookieName)?.value;
    if (cookieValue) {
      refreshToken = cookieValue;
      break;
    }
  }

  // محاولة قراءة معلومات الجلسة
  try {
    const sessionCookie = request.cookies.get(COOKIE_NAMES.USER_SESSION)?.value ||
                         request.cookies.get('user')?.value;
    if (sessionCookie) {
      userSession = JSON.parse(decodeURIComponent(sessionCookie));
    }
  } catch (e) {
    console.warn('⚠️ فشل في قراءة كوكي الجلسة:', e);
  }

  return { accessToken, refreshToken, userSession };
}

/**
 * مسح جميع كوكيز المصادقة
 */
export function clearAllAuthCookies(response: NextResponse) {
  // مسح الكوكيز الموحدة
  Object.values(COOKIE_NAMES).forEach(cookieName => {
    response.cookies.set(cookieName, '', {
      ...COOKIE_CONFIG,
      maxAge: 0,
      expires: new Date(0),
    });
  });

  // مسح الكوكيز القديمة
  cleanupLegacyCookies(response);
  
  console.log('🧹 تم مسح جميع كوكيز المصادقة');
}

/**
 * تنظيف الكوكيز القديمة
 */
function cleanupLegacyCookies(response: NextResponse) {
  LEGACY_COOKIES.forEach(cookieName => {
    // مسح بدون domain (للكوكيز الحالية)
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: LEGACY_COOKIE_CONFIG.secure,
      sameSite: LEGACY_COOKIE_CONFIG.sameSite,
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    // مسح مع domain محدد للإنتاج (للكوكيز القديمة)
    if (process.env.NODE_ENV === 'production') {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: LEGACY_COOKIE_CONFIG.secure,
        sameSite: LEGACY_COOKIE_CONFIG.sameSite,
        path: '/',
        domain: '.sabq.me', // Domain محدد للكوكيز القديمة
        maxAge: 0,
        expires: new Date(0),
      });
    }

    // مسح النسخة غير HttpOnly
    response.cookies.set(cookieName, '', {
      ...LEGACY_COOKIE_CONFIG,
      httpOnly: false,
      maxAge: 0,
      expires: new Date(0),
    });
  });
}

/**
 * توليد CSRF Token آمن
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else if (typeof global !== 'undefined' && global.crypto) {
    global.crypto.getRandomValues(array);
  } else {
    // Fallback للبيئات القديمة
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * التحقق من صحة CSRF Token
 */
export function verifyCSRFToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(COOKIE_NAMES.CSRF_TOKEN)?.value;
  const headerToken = request.headers.get('X-CSRF-Token') || 
                     request.headers.get('x-csrf-token');

  if (!cookieToken || !headerToken) {
    return false;
  }

  return cookieToken === headerToken;
}

/**
 * إعدادات CORS موحدة للمصادقة
 */
export function setCORSHeaders(response: NextResponse, origin?: string) {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://sabq.io', 'https://www.sabq.io', 'https://admin.sabq.io']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  const requestOrigin = origin || '*';
  const corsOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

  response.headers.set('Access-Control-Allow-Origin', corsOrigin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 ساعة

  // رؤوس إضافية للأمان
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
}

/**
 * رؤوس عدم التخزين المؤقت للمسارات المحمية
 */
export function setNoCache(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
}

const AuthCookiesUnified = {
  setUnifiedAuthCookies,
  updateAccessToken,
  getUnifiedAuthTokens,
  clearAllAuthCookies,
  verifyCSRFToken,
  setCORSHeaders,
  setNoCache,
  COOKIE_NAMES,
  COOKIE_CONFIG
};

export default AuthCookiesUnified;