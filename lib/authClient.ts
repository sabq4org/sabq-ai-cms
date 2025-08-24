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
 * قراءة الكوكي من المتصفح مع Fallback للأسماء المختلفة
 */
function getCookieFromDocument(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  // محاولة قراءة الكوكي المحدد أولاً
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift() || null;
    if (cookieValue) {
      return cookieValue;
    }
  }
  
  // Fallback للأسماء البديلة (التطوير/الإنتاج)
  const fallbackNames: Record<string, string[]> = {
    '__Host-sabq-access-token': ['sabq-access-token', 'sabq_at', 'access_token'],
    'sabq-access-token': ['__Host-sabq-access-token', 'sabq_at', 'access_token'],
    'sabq_rft': ['__Host-sabq-refresh', 'sabq_rt', 'refresh_token'],
    '__Host-sabq-user-session': ['sabq-user-session', 'user'],
    'sabq-user-session': ['__Host-sabq-user-session', 'user'],
  };
  
  const alternatives = fallbackNames[name] || [];
  for (const altName of alternatives) {
    const altValue = `; ${document.cookie}`;
    const altParts = altValue.split(`; ${altName}=`);
    if (altParts.length === 2) {
      const altCookieValue = altParts.pop()?.split(';').shift() || null;
      if (altCookieValue) {
        console.log(`📋 [authClient] استخدام fallback cookie: ${altName} بدلاً من ${name}`);
        return altCookieValue;
      }
    }
  }
  
  return null;
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
  refreshPromise = performTokenRefreshInternal();
  
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
 * تنفيذ تحديث التوكن للاستخدام الخارجي
 */
export async function performTokenRefresh(): Promise<{success: boolean; token?: string; error?: string}> {
  try {
    const token = await performTokenRefreshInternal();
    return { success: true, token };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * تنفيذ تجديد التوكن الداخلي مع تسجيل مفصل
 */
async function performTokenRefreshInternal(): Promise<string> {
  lastRefreshAttempt = Date.now();
  refreshAttempts++;

  console.log(`🔄 بدء تجديد التوكن (محاولة ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})...`);

  try {
    console.log('🔗 إرسال طلب التجديد مع credentials...');
    
    // فحص الكوكيز قبل الإرسال
    if (typeof document !== 'undefined') {
      const cookies = document.cookie;
      console.log('🍪 الكوكيز قبل طلب التجديد:');
      ['sabq_rft', '__Host-sabq-refresh', '__Host-sabq-access-token', 'sabq-csrf-token'].forEach(name => {
        const exists = cookies.includes(name);
        console.log(`  ${exists ? '✅' : '❌'} ${name}`);
      });
    }
    
    // تحضير headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    // إضافة CSRF token إذا موجود
    if (typeof document !== 'undefined') {
      const csrf = getCookieFromDocument('sabq-csrf-token');
      if (csrf) {
        headers['X-CSRF-Token'] = csrf;
        console.log('🔐 CSRF Token: موجود');
      } else {
        console.log('🔐 CSRF Token: مفقود');
      }
    }
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // حاسم لإرسال الكوكيز
      headers
    });

    if (!response.ok) {
      // تسجيل مفصل لاستجابة غير ناجحة
      const responseText = await response.text().catch(() => 'لا يمكن قراءة النص');
      console.error(`❌ [authClient] فشل في تجديد التوكن: ${response.status} - ${response.statusText}`);
      console.error('📄 [authClient] نص الاستجابة:', responseText);
      
      // تسجيل headers الاستجابة
      console.log('📋 [authClient] Response Headers:');
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      
      // تحليل خاص للـ 400 Bad Request
      if (response.status === 400) {
        console.error('🚨 [authClient] 400 Bad Request - تحليل السبب:');
        console.error('  📊 البيانات المرسلة:');
        console.error(`    - credentials: include ✓`);
        console.error(`    - CSRF Token: ${headers['X-CSRF-Token'] ? '✓ موجود' : '❌ مفقود'}`);
        
        // تحقق من محتوى الخطأ
        const lowerText = responseText.toLowerCase();
        if (lowerText.includes('csrf')) {
          console.error('  🎯 السبب المحدد: CSRF Token مفقود أو غير مطابق');
        } else if (lowerText.includes('refresh') || lowerText.includes('token')) {
          console.error('  🎯 السبب المحدد: Refresh token غير صالح أو منتهي');
        } else if (lowerText.includes('cookie') || lowerText.includes('credential')) {
          console.error('  🎯 السبب المحدد: الكوكيز لم تُرسل للخادم');
        } else {
          console.error('  🎯 السبب غير محدد - فحص نص الاستجابة أعلاه');
        }
        
        // فحص الكوكيز المرسلة
        if (typeof document !== 'undefined') {
          const cookies = document.cookie;
          console.log('🍪 [authClient] الكوكيز في المتصفح بعد الفشل:');
          ['sabq_rft', '__Host-sabq-refresh', '__Host-sabq-access-token', 'sabq-csrf-token'].forEach(name => {
            const exists = cookies.includes(name);
            console.log(`  ${exists ? '✅' : '❌'} ${name}`);
          });
        }
      }
      
      if (response.status === 401) {
        clearSession();
        throw new Error('Refresh token invalid or expired');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
    }

    const data = await response.json();
    const newToken = data.accessToken || data.token;
    
    if (!newToken) {
      console.error('❌ لم يتم إرجاع التوكن من الخادم');
      throw new Error('No token returned from server');
    }

    // تحديث التوكن في الذاكرة
    setAccessTokenInMemory(newToken);
    
    console.log('✅ تم تجديد التوكن بنجاح');
    refreshAttempts = 0; // إعادة تعيين العداد عند النجاح

    // إطلاق حدث التجديد (بدون reload!)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('token-refreshed', {
        detail: { 
          accessToken: newToken,
          userVersion: data.userVersion || Date.now()
        }
      }));
    }
    
    return newToken;

  } catch (error) {
    console.error('❌ خطأ في تجديد التوكن:', error);
    
    // تنظيف الحالة عند الفشل
    clearSession(); // تنظيف شامل عند الفشل
    
    throw error;
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
