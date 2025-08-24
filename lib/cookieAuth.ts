/**
 * مكتبة قراءة واستخراج معلومات المصادقة من الكوكيز
 * تحل مشكلة عدم تحديث حالة المصادقة في الواجهة بعد تسجيل الدخول
 */

// أسماء الكوكيز بالأولوية (من الأحدث للأقدم)
const TOKEN_COOKIE_NAMES = [
  '__Host-sabq-access-token',  // النظام الجديد - الإنتاج
  'sabq-access-token',         // النظام الجديد - التطوير
  'auth-token',                // النظام الحالي المستخدم
  'sabq_at',                   // النظام الموحد القديم
  'access_token',              // Fallback عام
  'token',                     // Fallback عام
  'jwt'                        // Fallback عام
];

/**
 * قراءة الكوكي من document.cookie
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

/**
 * البحث عن أول كوكي متاح من قائمة الأسماء
 */
function findAvailableTokenCookie(): { name: string; value: string } | null {
  for (const cookieName of TOKEN_COOKIE_NAMES) {
    const value = getCookieValue(cookieName);
    if (value) {
      console.log(`🍪 [cookieAuth] تم العثور على التوكن في: ${cookieName}`);
      return { name: cookieName, value };
    }
  }
  return null;
}

/**
 * فك تشفير JWT بدون التحقق من التوقيع
 */
function decodeJWT(token: string): any | null {
  try {
    // إزالة Bearer إذا موجود
    const cleanToken = token.replace(/^Bearer\s+/, '');
    
    // فصل أجزاء JWT
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('❌ [cookieAuth] تنسيق JWT غير صحيح');
      return null;
    }
    
    // فك تشفير الـ payload
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsedPayload = JSON.parse(decodedPayload);
    
    // فحص انتهاء الصلاحية
    if (parsedPayload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (parsedPayload.exp < now) {
        console.warn('⚠️ [cookieAuth] التوكن منتهي الصلاحية');
        return null;
      }
    }
    
    console.log('✅ [cookieAuth] تم فك تشفير التوكن بنجاح');
    return parsedPayload;
    
  } catch (error) {
    console.error('❌ [cookieAuth] خطأ في فك تشفير JWT:', error);
    return null;
  }
}

/**
 * استخراج معلومات المستخدم من JWT payload
 */
function extractUserFromPayload(payload: any): any | null {
  if (!payload) return null;
  
  try {
    // استخراج معرف المستخدم من حقول مختلفة
    const userId = payload.user_id || payload.userId || payload.sub || payload.id;
    if (!userId) {
      console.error('❌ [cookieAuth] لا يوجد معرف مستخدم في التوكن');
      return null;
    }
    
    // بناء كائن المستخدم
    const user = {
      id: userId,
      email: payload.email || payload.user_email || '',
      name: payload.name || payload.user_name || payload.username || '',
      role: payload.role || payload.user_role || 'user',
      roleId: payload.roleId || payload.role_id,
      is_admin: payload.is_admin || payload.admin || false,
      is_verified: payload.is_verified || payload.verified || false,
      avatar: payload.avatar || payload.picture || payload.avatar_url,
      loyaltyPoints: payload.loyalty_points || payload.loyaltyPoints || 0,
      created_at: payload.created_at || payload.createdAt,
      updated_at: payload.updated_at || payload.updatedAt,
      iat: payload.iat,
      exp: payload.exp
    };
    
    console.log('✅ [cookieAuth] تم استخراج معلومات المستخدم:', user.email);
    return user;
    
  } catch (error) {
    console.error('❌ [cookieAuth] خطأ في استخراج معلومات المستخدم:', error);
    return null;
  }
}

/**
 * قراءة وفك تشفير معلومات المستخدم من الكوكيز
 * الوظيفة الرئيسية التي تستخدمها AuthContext
 */
export function getUserFromCookies(): { user: any | null; token: string | null } {
  console.log('🔍 [cookieAuth] بحث عن معلومات المستخدم في الكوكيز...');
  
  // البحث عن كوكي التوكن
  const tokenCookie = findAvailableTokenCookie();
  if (!tokenCookie) {
    console.log('❌ [cookieAuth] لم يتم العثور على كوكي التوكن');
    return { user: null, token: null };
  }
  
  // فك تشفير JWT
  const payload = decodeJWT(tokenCookie.value);
  if (!payload) {
    console.log('❌ [cookieAuth] فشل في فك تشفير التوكن');
    return { user: null, token: null };
  }
  
  // استخراج معلومات المستخدم
  const user = extractUserFromPayload(payload);
  if (!user) {
    console.log('❌ [cookieAuth] فشل في استخراج معلومات المستخدم');
    return { user: null, token: null };
  }
  
  return { user, token: tokenCookie.value };
}

/**
 * فحص وجود كوكي التوكن
 */
export function hasAuthCookie(): boolean {
  return findAvailableTokenCookie() !== null;
}

/**
 * الحصول على التوكن فقط من الكوكيز
 */
export function getTokenFromCookies(): string | null {
  const tokenCookie = findAvailableTokenCookie();
  return tokenCookie ? tokenCookie.value : null;
}

/**
 * تنظيف كوكيز المصادقة (للاستخدام عند تسجيل الخروج)
 */
export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return;
  
  console.log('🧹 [cookieAuth] تنظيف كوكيز المصادقة...');
  
  // محاولة حذف جميع أسماء الكوكيز المحتملة
  const allCookieNames = [
    ...TOKEN_COOKIE_NAMES,
    'sabq-refresh-token',
    '__Host-sabq-refresh-token',
    'sabq-csrf-token',
    'user',
    'sabq-user-session',
    '__Host-sabq-user-session'
  ];
  
  allCookieNames.forEach(name => {
    // حذف بدون domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // حذف مع domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    // حذف مع subdomain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  });
  
  console.log('✅ [cookieAuth] تم تنظيف الكوكيز');
}