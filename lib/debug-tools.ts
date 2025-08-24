/**
 * أدوات تشخيص متقدمة للمصادقة وتجديد التوكن
 */

import { getAccessToken } from './authClient';

/**
 * اختبار شامل للتوكن الحالي على endpoint محدد
 * مع إعادة المحاولة وتشخيص متقدم
 */
export async function testTokenWithEndpoint(endpoint: string): Promise<{
  success: boolean;
  status: number | null;
  error: any;
  attemptDetails: any[];
  data?: any;
}> {
  const attemptDetails: any[] = [];
  
  try {
    console.log(`🔬 اختبار ${endpoint} مع التوكن الحالي...`);
    
    const token = getAccessToken();
    if (!token) {
      const result = {
        success: false,
        status: null,
        error: 'لا يوجد توكن',
        attemptDetails: [{ attempt: 1, error: 'No token found' }]
      };
      console.log(`❌ ${endpoint}: لا يوجد توكن`);
      return result;
    }
    
    // محاولة أولى مع التوكن الحالي
    let response;
    try {
      console.log(`📡 المحاولة الأولى لـ ${endpoint}...`);
      response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      attemptDetails.push({
        attempt: 1,
        status: response.status,
        statusText: response.statusText,
        tokenUsed: token.slice(0, 20) + '...',
        success: response.ok
      });
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: نجح بالتوكن الحالي`);
        const data = await response.json().catch(() => null);
        return {
          success: true,
          status: response.status,
          error: null,
          attemptDetails,
          data
        };
      }
      
      if (response.status === 401) {
        console.log(`🔄 ${endpoint}: 401 - محاولة تحديث التوكن...`);
        
        // استيراد وتشغيل تحديث التوكن (يجب استيراد authClient)
        try {
          const { performTokenRefresh } = await import('./authClient');
          const refreshResult = await performTokenRefresh();
          
          if (refreshResult.success && refreshResult.token) {
            console.log(`🔄 تم تحديث التوكن، إعادة المحاولة...`);
            
            const newToken = refreshResult.token;
            const retryResponse = await fetch(endpoint, {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            });
            
            attemptDetails.push({
              attempt: 2,
              status: retryResponse.status,
              statusText: retryResponse.statusText,
              tokenUsed: newToken?.slice(0, 20) + '...',
              success: retryResponse.ok,
              afterRefresh: true
            });
            
            const data = retryResponse.ok ? await retryResponse.json().catch(() => null) : null;
            
            return {
              success: retryResponse.ok,
              status: retryResponse.status,
              error: retryResponse.ok ? null : `Still ${retryResponse.status} after refresh`,
              attemptDetails,
              data
            };
          } else {
            console.log(`❌ ${endpoint}: فشل تحديث التوكن`);
            attemptDetails.push({
              attempt: 2,
              error: 'Token refresh failed',
              refreshError: refreshResult.error
            });
            
            return {
              success: false,
              status: response.status,
              error: 'Token refresh failed',
              attemptDetails
            };
          }
        } catch (refreshError) {
          console.log(`❌ ${endpoint}: خطأ في استيراد أو تشغيل تحديث التوكن`);
          attemptDetails.push({
            attempt: 2,
            error: 'Token refresh import/execution failed',
            refreshError: refreshError instanceof Error ? refreshError.message : refreshError
          });
          
          return {
            success: false,
            status: response.status,
            error: 'Token refresh failed',
            attemptDetails
          };
        }
      } else {
        console.log(`❌ ${endpoint}: خطأ غير متوقع ${response.status}`);
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}`,
          attemptDetails
        };
      }
      
    } catch (error) {
      console.error(`❌ ${endpoint}: خطأ في الشبكة`, error);
      attemptDetails.push({
        attempt: 1,
        error: error instanceof Error ? error.message : String(error),
        networkError: true
      });
      
      return {
        success: false,
        status: null,
        error: error instanceof Error ? error.message : String(error),
        attemptDetails
      };
    }
    
  } catch (outerError) {
    console.error(`❌ ${endpoint}: خطأ عام`, outerError);
    return {
      success: false,
      status: null,
      error: outerError instanceof Error ? outerError.message : String(outerError),
      attemptDetails: [...attemptDetails, { 
        attempt: 'final',
        error: outerError instanceof Error ? outerError.message : String(outerError)
      }]
    };
  }
}

/**
 * مقارنة التوكن في الذاكرة مع الكوكيز
 */
export function compareTokens(): {
  memoryToken: string | null;
  cookieTokens: { [key: string]: string | null };
  matches: boolean;
} {
  const memoryToken = getAccessToken();
  
  const cookieTokens: { [key: string]: string | null } = {};
  
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    
    ['__Host-sabq-access-token', 'sabq_at', 'auth-token', 'access_token', 'token', 'jwt'].forEach(cookieName => {
      const cookie = cookies.find(c => c.trim().startsWith(`${cookieName}=`));
      cookieTokens[cookieName] = cookie ? cookie.split('=')[1] : null;
    });
  }
  
  // فحص التطابق
  const availableCookieTokens = Object.values(cookieTokens).filter(Boolean);
  const matches = availableCookieTokens.some(cookieToken => cookieToken === memoryToken);
  
  console.log('🔍 مقارنة التوكن:');
  console.log('  - في الذاكرة:', memoryToken?.substring(0, 20) + '...');
  console.log('  - في الكوكيز:', cookieTokens);
  console.log('  - التطابق:', matches);
  
  return {
    memoryToken,
    cookieTokens,
    matches
  };
}

/**
 * فحص شامل لحالة المصادقة
 */
export async function debugAuthState(): Promise<void> {
  console.log('🔍 بدء فحص شامل لحالة المصادقة...');
  
  // 1. مقارنة التوكن
  const tokenComparison = compareTokens();
  
  // 2. اختبار endpoints مختلفة مع الأولوية
  const endpoints = [
    '/api/profile/me/loyalty',  // الهدف الأساسي
    '/api/auth/me',             // فحص المصادقة
    '/api/profile/me'           // بيانات المستخدم
  ];
  
  console.log('🧪 اختبار Endpoints بالترتيب...');
  for (const endpoint of endpoints) {
    const result = await testTokenWithEndpoint(endpoint);
    console.log(`🧪 ${endpoint}:`, result.success ? '✅ نجح' : '❌ فشل', result);
  }
  
  // 3. فحص تواريخ انتهاء التوكن
  const token = getAccessToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = new Date(payload.exp * 1000);
      const now = new Date();
      const remaining = exp.getTime() - now.getTime();
      
      console.log('⏰ صلاحية التوكن:');
      console.log('  - ينتهي في:', exp.toISOString());
      console.log('  - الوقت المتبقي:', Math.floor(remaining / 1000), 'ثانية');
      console.log('  - منتهي؟', remaining <= 0);
      console.log('  - معرف المستخدم:', payload.id || payload.sub);
      console.log('  - البريد الإلكتروني:', payload.email);
    } catch (e) {
      console.error('❌ فشل في تحليل التوكن:', e);
    }
  }
  
  // 4. فحص الكوكيز الموحدة vs القديمة  
  if (typeof document !== 'undefined') {
    const unifiedCookies = ['__Host-sabq-access-token', 'sabq_rft', '__Host-sabq-user-session'];
    const legacyCookies = ['sabq_at', 'sabq_rt', 'auth-token', 'user'];
    
    console.log('🍪 حالة الكوكيز:');
    console.log('  - الكوكيز الموحدة:', unifiedCookies.map(name => ({
      name,
      exists: document.cookie.includes(name)
    })));
    console.log('  - الكوكيز القديمة:', legacyCookies.map(name => ({
      name, 
      exists: document.cookie.includes(name)
    })));
  }
  
  console.log('✅ انتهى الفحص الشامل');
}

/**
 * تنظيف وإعادة تعيين شاملة
 */
export function resetEverything(): void {
  console.log('🧹 إعادة تعيين شاملة...');
  
  // حذف جميع البيانات المحلية
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    
    // محاولة حذف جميع الكوكيز ذات الصلة
    const cookiesToDelete = [
      '__Host-sabq-access-token',
      '__Host-sabq-refresh-token', 
      '__Host-sabq-user-session',
      'sabq_rft',
      'sabq_at',
      'sabq-csrf-token',
      'auth-token',
      'access_token',
      'refresh_token',
      'user',
      'token',
      'jwt'
    ];
    
    cookiesToDelete.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.sabq.me;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // إطلاق حدث إعادة التعيين
    window.dispatchEvent(new CustomEvent('auth-reset', {
      detail: { reason: 'manual-reset' }
    }));
    
    console.log('✅ تم حذف جميع البيانات والكوكيز');
  }
}

// إتاحة الدوال في وضع التطوير
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugAuth = {
    testToken: testTokenWithEndpoint,
    compareTokens,
    debugAuthState,
    resetEverything
  };
  
  // تحميل أدوات loyalty المتخصصة
  import('./loyalty-debug').then(loyaltyDebug => {
    (window as any).debugLoyalty = loyaltyDebug;
    console.log('🎯 أدوات Loyalty متاحة: window.debugLoyalty');
  });
  
  console.log('🔧 أدوات التشخيص متاحة: window.debugAuth');
  console.log('📚 الاستخدام:');
  console.log('  - debugAuth.debugAuthState()');
  console.log('  - debugAuth.testToken("/api/profile/me/loyalty")');
  console.log('  - debugLoyalty.diagnoseLoyaltyEndpoint()');
}
