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

    // معالجة 401 - لا نكرر للأبد (Single Retry كما في البرومنت)
    if (error.response.status === 401 && !original._retried) {
      
      // تجاهل الطلبات الحساسة
      const sensitiveEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/me'];
      const isSensitive = sensitiveEndpoints.some(endpoint => 
        original.url?.includes(endpoint)
      );
      
      if (isSensitive) {
        console.log('⚠️ طلب حساس - لا يحتاج تجديد');
        return Promise.reject(error);
      }

      try {
        console.log('🔄 محاولة تجديد التوكن وإعادة الطلب...');
        
        // تجديد التوكن (مع منع السباقات)
        const newToken = await ensureAccessToken();
        
        // وضع علامة أن الطلب تم إعادة محاولته
        original._retried = true;
        original.headers.Authorization = `Bearer ${newToken}`;
        
        // إعادة إرسال الطلب بالتوكن الجديد
        console.log('🔄 إعادة تشغيل الطلب بالتوكن الجديد');
        return http(original);
        
      } catch (refreshError) {
        console.error('❌ فشل تجديد التوكن:', refreshError);
        
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
