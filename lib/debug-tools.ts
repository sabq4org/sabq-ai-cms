/**
 * أدوات تشخيص متقدمة للمصادقة وتجديد التوكن
 */

import { getAccessToken } from './authClient';

/**
 * اختبار التوكن مع endpoint محدد
 */
export async function testTokenWithEndpoint(endpoint: string): Promise<{
  success: boolean;
  status: number;
  error?: string;
  tokenUsed?: string;
}> {
  const token = getAccessToken();
  
  if (!token) {
    return {
      success: false,
      status: 0,
      error: 'No token available'
    };
  }

  try {
    console.log('🧪 اختبار التوكن مع:', endpoint);
    console.log('🔑 التوكن المستخدم:', token.substring(0, 20) + '...');
    
    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const result: any = {
      success: response.ok,
      status: response.status,
      tokenUsed: token.substring(0, 20) + '...'
    };

    if (!response.ok) {
      const errorData = await response.text();
      result.error = errorData;
      console.log('❌ فشل الاختبار:', response.status, errorData);
    } else {
      const data = await response.json();
      console.log('✅ نجح الاختبار:', data);
    }

    return result;
    
  } catch (error: any) {
    console.error('❌ خطأ في اختبار التوكن:', error);
    return {
      success: false,
      status: 0,
      error: error.message,
      tokenUsed: token.substring(0, 20) + '...'
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
  
  // 2. اختبار endpoints مختلفة
  const endpoints = [
    '/api/auth/me',
    '/api/profile/me',
    '/api/profile/me/loyalty'
  ];
  
  for (const endpoint of endpoints) {
    const result = await testTokenWithEndpoint(endpoint);
    console.log(`🧪 ${endpoint}:`, result);
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
    } catch (e) {
      console.error('❌ فشل في تحليل التوكن:', e);
    }
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
  
  console.log('🔧 أدوات التشخيص متاحة: window.debugAuth');
}
