/**
 * HTTP Client موحد مع منع حلقة 401/refresh
 * تطبيق البرومنت النصي - Single retry, Single refresh
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ensureAccessToken, getAccessToken, clearSession } from './authClient';

// إنشاء HTTP client موحد
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 30000,
  withCredentials: true, // مهم للكوكيز
  headers: {
    'Content-Type': 'application/json',
  },
});

// متغير لمنع تكرار العمليات
let isReplaying = false;

/**
 * Request Interceptor - إضافة التوكن تلقائياً
 */
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // إضافة التوكن من الذاكرة
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 إضافة توكن للطلب:', config.url, '- التوكن:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ لا يوجد توكن للطلب:', config.url);
    }

    // إضافة CSRF token للطلبات المهمة
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = getCookieValue('sabq-csrf-token');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // رؤوس إضافية للأمان
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    console.log('📤 طلب HTTP:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor - معالجة 401 مع Single Retry
 */
http.interceptors.response.use(
  (response) => {
    console.log('✅ استجابة ناجحة:', response.config.url, response.status);
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    
    if (!error.response || !original) {
      return Promise.reject(error);
    }

    console.log('❌ خطأ HTTP:', {
      url: original.url,
      status: error.response.status,
      method: original.method
    });

    // معالجة 401 - Single Retry فقط (تطبيق البرومنت النصي)
    if (error.response.status === 401 && !original._retried) {
      
      // تجاهل الطلبات الحساسة فقط (استثناء /profile لأنه يحتاج تجديد)
      // NOTE: Keep this list minimal and well-documented
      // Future updates: Review when adding new auth endpoints
      const sensitiveEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
      const isSensitive = sensitiveEndpoints.some(endpoint => 
        original.url?.includes(endpoint)
      );
      
      if (isSensitive) {
        console.log('⚠️ طلب حساس - لا يحتاج تجديد');
        return Promise.reject(error);
      }

      try {
        console.log('🔄 محاولة تجديد التوكن وإعادة الطلب...');
        console.log('🔍 التوكن الحالي قبل التجديد:', getAccessToken()?.substring(0, 20) + '...');
        
        // فحص الكوكيز قبل التجديد (محسّن للكوكيز الذكية)
        console.log('🍪 فحص الكوكيز قبل التجديد:');
        const cookiesDebug = typeof document !== 'undefined' ? document.cookie : 'undefined';
        console.log('  - جميع الكوكيز:', cookiesDebug);
        
        // البحث عن كوكيز التجديد مع أولوية ذكية
        const refreshCookieNames = ['sabq_rft', '__Host-sabq-refresh', 'sabq_rt'];
        let refreshCookie = null;
        for (const name of refreshCookieNames) {
          refreshCookie = getCookieValue(name);
          if (refreshCookie) {
            console.log(`  - كوكي التجديد: ${name} ✅`);
            break;
          }
        }
        
        const csrfToken = getCookieValue('sabq-csrf-token');
        console.log('  - CSRF Token:', csrfToken ? 'موجود ✅' : 'مفقود ❌');
        
        if (!refreshCookie) {
          console.warn('⚠️ لا يوجد refresh token - قد تفشل عملية التجديد');
        }
        
        // تجديد التوكن (مع منع السباقات)
        const newToken = await ensureAccessToken();
        
        console.log('🔍 التوكن الجديد بعد التجديد:', newToken?.substring(0, 20) + '...');
        console.log('🔍 التوكن من الذاكرة:', getAccessToken()?.substring(0, 20) + '...');
        
        // تأكد من أن التوكن محدث في الذاكرة
        if (newToken !== getAccessToken()) {
          console.warn('⚠️ تعارض في التوكن - إصلاح...');
          // في حالة عدم التزامن، استخدم التوكن الجديد مباشرة
        }
        
        // وضع علامة أن الطلب تم إعادة محاولته
        original._retried = true;
        original.headers.Authorization = `Bearer ${newToken}`;
        
        console.log('🔄 إعادة تشغيل الطلب بالتوكن الجديد:', original.url);
        console.log('� Authorization header:', original.headers.Authorization?.substring(0, 30) + '...');
        
        // إعادة إرسال الطلب بالتوكن الجديد
        return http(original);
        
      } catch (refreshError) {
        console.error('❌ فشل تجديد التوكن:', refreshError);
        
        // تسجيل تفصيلي لسبب فشل التجديد
        if (refreshError instanceof Error) {
          console.error('📋 تفاصيل الخطأ:', {
            message: refreshError.message,
            name: refreshError.name,
            stack: refreshError.stack?.split('\n').slice(0, 3)
          });
        }
        
        // فحص إضافي للكوكيز بعد الفشل
        console.log('🍪 فحص الكوكيز بعد فشل التجديد:');
        const postFailCookies = typeof document !== 'undefined' ? document.cookie : 'undefined';
        console.log('  - الكوكيز الحالية:', postFailCookies);
        
        // تنظيف الجلسة والإعادة للتسجيل
        clearSession();
        
        // إطلاق حدث انتهاء الجلسة
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-expired', {
            detail: { reason: 'refresh-failed' }
          }));
          
          // توجيه لتسجيل الدخول (بدون location.reload!)
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login')) {
            setTimeout(() => {
              window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
            }, 1000);
          }
        }
        
        return Promise.reject(error);
      }
    }

    // أخطاء أخرى
    return Promise.reject(error);
  }
);

/**
 * Helper functions للطلبات الشائعة
 */
export const httpAPI = {
  get: <T = any>(url: string, config?: any) => 
    http.get<T>(url, config).then(res => res.data),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    http.post<T>(url, data, config).then(res => res.data),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    http.put<T>(url, data, config).then(res => res.data),
  
  delete: <T = any>(url: string, config?: any) => 
    http.delete<T>(url, config).then(res => res.data),
  
  patch: <T = any>(url: string, data?: any, config?: any) => 
    http.patch<T>(url, data, config).then(res => res.data),
};

/**
 * قراءة قيمة الكوكي
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

export default http;
