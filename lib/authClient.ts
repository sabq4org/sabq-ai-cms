/**
 * عميل المصادقة الموحد - منع السباقات وإدارة التوكن
 * تطبيق البرومنت النصي التنفيذي لإيقاف حلقة 401/refresh
 */

// متغيرات عامة لإدارة التوكن في الذاكرة
let accessTokenInMemory: string | null = null;
let refreshPromise: Promise<string> | null = null;

// إعدادات الأمان والحدود
const MAX_REFRESH_ATTEMPTS = 1; // محاولة واحدة فقط كما في البرومنت
const REFRESH_COOLDOWN = 30000; // 30 ثانية
let lastRefreshAttempt = 0;
let refreshAttempts = 0;

/**
 * تعيين التوكن في الذاكرة فقط (لا localStorage)
 */
export function setAccessTokenInMemory(token: string | null): void {
  accessTokenInMemory = token;
  console.log('🔑 تم تحديث التوكن في الذاكرة:', token ? 'موجود' : 'محذوف');
}

/**
 * جلب التوكن من الذاكرة
 */
export function getAccessToken(): string | null {
  return accessTokenInMemory;
}

/**
 * ضمان وجود التوكن - مع منع السباقات (Single-flight refresh)
 */
export async function ensureAccessToken(): Promise<string> {
  // إذا كان التوكن موجود، استخدمه
  const token = getAccessToken();
  if (token && !isTokenExpired(token)) {
    return token;
  }

  // إذا كان هناك refresh قيد التنفيذ، انتظره
  if (refreshPromise) {
    console.log('⏳ انتظار تجديد التوكن الجاري...');
    return refreshPromise;
  }

  // فحص Rate Limiting
  const now = Date.now();
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    const timeSinceLastAttempt = now - lastRefreshAttempt;
    if (timeSinceLastAttempt < REFRESH_COOLDOWN) {
      throw new Error('تم تجاوز الحد الأقصى لمحاولات التجديد');
    }
    // إعادة تعيين العداد بعد انتهاء فترة الانتظار
    refreshAttempts = 0;
  }

  // بدء عملية التجديد (Single-flight)
  refreshPromise = performTokenRefresh();
  
  try {
    const newToken = await refreshPromise;
    return newToken;
  } catch (error) {
    console.error('❌ فشل تجديد التوكن:', error);
    throw error;
  } finally {
    refreshPromise = null;
  }
}

/**
 * تنفيذ تجديد التوكن الفعلي
 */
async function performTokenRefresh(): Promise<string> {
  lastRefreshAttempt = Date.now();
  refreshAttempts++;

  console.log(`🔄 بدء تجديد التوكن (محاولة ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})...`);

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.accessToken) {
      throw new Error(data.message || 'فشل في الحصول على التوكن الجديد');
    }

    // حفظ التوكن الجديد في الذاكرة
    setAccessTokenInMemory(data.accessToken);
    
    // إعادة تعيين العداد عند النجاح
    refreshAttempts = 0;

    console.log('✅ تم تجديد التوكن بنجاح');

    // إطلاق حدث التجديد (بدون reload!)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('token-refreshed', {
        detail: { 
          accessToken: data.accessToken,
          userVersion: data.userVersion || Date.now()
        }
      }));
    }

    return data.accessToken;

  } catch (error: any) {
    console.error('❌ خطأ في تجديد التوكن:', error.message);
    
    // تنظيف الجلسة عند الفشل النهائي
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      clearSession();
    }
    
    throw error;
  }
}

/**
 * فحص انتهاء صلاحية التوكن
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // تحويل إلى milliseconds
    const now = Date.now();
    const buffer = 30000; // 30 ثانية buffer
    
    return now > (exp - buffer);
  } catch {
    return true; // إذا فشل parsing، اعتبر التوكن منتهي
  }
}

/**
 * تنظيف الجلسة بالكامل
 */
export function clearSession(): void {
  console.log('🧹 تنظيف الجلسة...');
  
  // حذف التوكن من الذاكرة
  setAccessTokenInMemory(null);
  
  // حذف البيانات المحلية
  if (typeof window !== 'undefined') {
    // حذف من localStorage
    ['auth-token', 'user', 'user_preferences', 'sabq_user'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // إطلاق حدث انتهاء الجلسة
    window.dispatchEvent(new CustomEvent('session-cleared', {
      detail: { reason: 'authentication-failure' }
    }));
  }

  // إعادة تعيين المتغيرات
  refreshAttempts = 0;
  lastRefreshAttempt = 0;
  refreshPromise = null;
}

/**
 * فحص صحة الجلسة الحالية
 */
export async function validateSession(): Promise<boolean> {
  try {
    const token = getAccessToken();
    if (!token) return false;

    if (isTokenExpired(token)) {
      console.log('🔄 التوكن منتهي، محاولة تجديد...');
      await ensureAccessToken();
      return true;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * إعادة تعيين حالة التجديد (للاستخدام في الحالات الطارئة)
 */
export function resetRefreshState(): void {
  console.log('🔄 إعادة تعيين حالة التجديد...');
  refreshPromise = null;
  refreshAttempts = 0;
  lastRefreshAttempt = 0;
}

/**
 * تسجيل الدخول بالتوكن الجديد
 */
export function loginWithToken(token: string): void {
  setAccessTokenInMemory(token);
  console.log('✅ تم تسجيل الدخول بالتوكن الجديد');
}
