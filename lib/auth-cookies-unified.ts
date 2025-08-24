/**
 * نظام الكوكيز الموحد للمصادقة - سبق الذكية
 * يعالج جميع مشاكل الكوكيز ويضمن الاتساق عبر المنصة
 */

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// إعدادات الكوكيز الموحدة (تطبيق البرومنت)
const COOKIE_CONFIG = {
  // إعدادات الأمان
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  
  // ❌ تم إزالة hardcoded domain - سيتم تحديدها ديناميكياً
  // إعدادات الدومين موحدة حسب البرومنت: ديناميكية حسب الـ Host
  domain: undefined, // سيتم تحديدها في setAuthCookies ديناميكياً
  
  path: '/',
  
  // SameSite Policy موحدة حسب البرومنت: SameSite=Lax
  sameSite: 'lax' as const,
  
  // مدة البقاء
  accessTokenMaxAge: 24 * 60 * 60, // 24 ساعة
  refreshTokenMaxAge: 30 * 24 * 60 * 60, // 30 يوم
  extendedMaxAge: 60 * 24 * 60 * 60, // 60 يوم مع "تذكرني"
};

// أسماء الكوكيز الموحدة (حسب البرومنت) - مع دعم بيئة التطوير
export const COOKIE_NAMES = {
  ACCESS_TOKEN: process.env.NODE_ENV === 'production' 
    ? '__Host-sabq-access-token' 
    : 'sabq-access-token', // كوكي عادي في التطوير
  REFRESH_TOKEN: 'sabq_rft', // اسم موحد حسب البرومنت  
  USER_SESSION: process.env.NODE_ENV === 'production' 
    ? '__Host-sabq-user-session' 
    : 'sabq-user-session', // كوكي عادي في التطوير
  CSRF_TOKEN: 'sabq-csrf-token', // غير __Host لأنه يحتاج JavaScript access
} as const;

// أسماء الكوكيز القديمة للتنظيف والـ Fallback (قابلة للتوسعة)
const LEGACY_COOKIES = [
  'sabq_at', 'sabq_rt', 'access_token', 'refresh_token', 
  'auth-token', 'user', 'token', 'jwt'
];

// Future-proofing: قائمة أولويات قراءة التوكن (يمكن إضافة أسماء جديدة)
export const TOKEN_COOKIE_PRIORITY = [
  process.env.NODE_ENV === 'production' ? '__Host-sabq-access-token' : 'sabq-access-token', // النظام الموحد الحالي (أولوية عليا)
  '__Host-sabq-access-token', // للإنتاج
  'sabq-access-token',        // للتطوير
  'sabq_at',                  // النظام القديم الرئيسي
  'access_token',             // Fallback عام
  'auth-token',               // Fallback عام
  'token',                    // Fallback عام
  'jwt'                       // Fallback عام
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
  
  console.log('🍪 تعيين الكوكيز الموحدة...');
  console.log(`  - بيئة: ${process.env.NODE_ENV}`);
  console.log(`  - Secure: ${COOKIE_CONFIG.secure}`);
  console.log(`  - Domain: ${COOKIE_CONFIG.domain || 'undefined (localhost)'}`);
  
  // Access Token (24 ساعة دائماً)
  const accessCookieConfig = {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_CONFIG.accessTokenMaxAge,
  };
  
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, accessCookieConfig);
  console.log(`  ✅ Access Token: ${COOKIE_NAMES.ACCESS_TOKEN}`);

  // Refresh Token (30-60 يوم حسب "تذكرني")  
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge,
  });
  console.log(`  ✅ Refresh Token: ${COOKIE_NAMES.REFRESH_TOKEN}`);

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
    console.log(`  ✅ User Session: ${COOKIE_NAMES.USER_SESSION}`);
  }

  // CSRF Token
  const csrfToken = generateCSRFToken();
  response.cookies.set(COOKIE_NAMES.CSRF_TOKEN, csrfToken, {
    secure: COOKIE_CONFIG.secure,
    httpOnly: false, // يحتاج للإرسال في headers
    sameSite: COOKIE_CONFIG.sameSite,
    domain: COOKIE_CONFIG.domain,
    path: COOKIE_CONFIG.path,
    maxAge,
  });
  console.log(`  ✅ CSRF Token: ${COOKIE_NAMES.CSRF_TOKEN}`);

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
 * قراءة كوكي المصادقة الموحدة
 */
export function getUnifiedAuthTokens(request: NextRequest): {
  accessToken: string | null;
  refreshToken: string | null;
  userSession: any | null;
} {
  // NOTE: Always prefer unified cookie names for new system
  // محاولة قراءة الكوكيز الموحدة أولاً (أولوية عالية)
  let accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value || null;
  let refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value || null;
  let userSession = null;

  // Legacy fallback support for backward compatibility
  // Fallback للكوكيز القديمة (دعم التوافق مع الأنظمة القديمة)
  if (!accessToken) {
    accessToken = request.cookies.get('sabq_at')?.value || 
                  request.cookies.get('access_token')?.value ||
                  request.cookies.get('auth-token')?.value || null;
  }

  if (!refreshToken) {
    refreshToken = request.cookies.get('sabq_rt')?.value || 
                   request.cookies.get('refresh_token')?.value || null;
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
    // مسح مع domain عادي
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    // مسح مع domain محدد للإنتاج
    if (COOKIE_CONFIG.domain) {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: COOKIE_CONFIG.secure,
        sameSite: COOKIE_CONFIG.sameSite,
        path: '/',
        domain: COOKIE_CONFIG.domain,
        maxAge: 0,
        expires: new Date(0),
      });
    }

    // مسح النسخة غير HttpOnly
    response.cookies.set(cookieName, '', {
      httpOnly: false,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      path: '/',
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