/**
 * Axios client محسّن مع Silent Refresh للحفاظ على الجلسات
 * يتعامل مع تجديد Access Token تلقائياً مع نظام الكوكيز الموحد
 * معدّل لحل مشاكل الجلسات والـ 401 errors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// إنشاء instance مخصص مع إعدادات محسّنة
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // مهم جداً لإرسال الكوكيز الآمنة
});

// متغيرات لإدارة عملية التجديد (منع Race Conditions)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// معالجة طابور الطلبات المعلقة
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - لإضافة CSRF token وتحسين الرؤوس
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // إضافة CSRF token للطلبات التي تحتاجه
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = getCookieValue('sabq-csrf-token') || getCookieValue('csrf-token');
      
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    // إضافة رؤوس إضافية للأمان
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    console.log('📤 طلب API:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ خطأ في إعداد الطلب:', error);
    return Promise.reject(error);
  }
);

// Response interceptor محسّن للتعامل مع 401 وتجديد التوكن
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ استجابة API ناجحة:', response.config.url, response.status);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    console.log('❌ خطأ API:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.message
    });
    
    // التعامل مع 401 - جلسة منتهية الصلاحية
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      console.log('🔐 تم اكتشاف 401 - محاولة تجديد التوكن...');
      
      // تجنب تجديد التوكن للطلبات الحساسة
      const sensitiveEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/refresh-token'];
      const isSensitive = sensitiveEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );
      
      if (isSensitive) {
        console.log('⚠️ طلب حساس - لا يحتاج تجديد توكن');
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // إذا كان هناك تجديد جاري، أضف الطلب للطابور
        console.log('⏳ تجديد جاري - إضافة للطابور...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          console.log('🔄 إعادة تشغيل الطلب بعد التجديد');
          return apiClient(originalRequest);
        }).catch(err => {
          console.log('❌ فشل الطلب بعد التجديد');
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 بدء عملية تجديد التوكن...');
        
        // محاولة تجديد التوكن باستخدام endpoint الصحيح
        const refreshResponse = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 10000 // مهلة زمنية قصيرة للتجديد
        });

        console.log('🔍 استجابة التجديد:', {
          status: refreshResponse.status,
          success: refreshResponse.data?.success
        });

        if (refreshResponse.data?.success) {
          console.log('✅ تم تجديد التوكن بنجاح');
          
          // معالجة الطابور بنجاح
          processQueue(null);
          
          // إطلاق حدث لتحديث حالة المصادقة
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth-change', { 
              detail: { type: 'token-refreshed' } 
            }));
          }
          
          // إعادة إرسال الطلب الأصلي
          console.log('🔄 إعادة تشغيل الطلب الأصلي...');
          return apiClient(originalRequest);
        } else {
          throw new Error('فشل تجديد الجلسة - response not successful');
        }
        
      } catch (refreshError: any) {
        console.warn('⚠️ فشل تجديد التوكن:', {
          message: refreshError.message,
          status: refreshError.response?.status,
          data: refreshError.response?.data
        });
        
        // معالجة الطابور بالخطأ
        processQueue(refreshError, null);
        
        // تنظيف الجلسة المحلية
        if (typeof window !== 'undefined') {
          console.log('🧹 تنظيف الجلسة المحلية...');
          
          // إزالة بيانات محلية
          ['auth-token', 'user', 'user_preferences'].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });
          
          // إطلاق حدث انتهاء الجلسة
          window.dispatchEvent(new CustomEvent('auth-change', { 
            detail: { type: 'session-expired' } 
          }));
          
          // تحديد ما إذا كان الطلب يتطلب مصادقة
          const requiresAuth = isProtectedRoute(originalRequest.url || '');
          
          if (requiresAuth) {
            const currentPath = window.location.pathname;
            const isAlreadyOnLogin = currentPath.includes('/login');
            
            // تجنب إعادة التوجيه المتكررة وحفظ الصفحة المقصودة
            if (!isAlreadyOnLogin) {
              console.log('🔄 إعادة توجيه لصفحة تسجيل الدخول...');
              const loginUrl = `/login?next=${encodeURIComponent(currentPath)}`;
              
              // تأخير قصير لتجنب الإرباك
              setTimeout(() => {
                window.location.href = loginUrl;
              }, 1000);
            }
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // التعامل مع أخطاء أخرى
    if (error.response?.status && error.response.status >= 500) {
      console.error('🚨 خطأ خادم:', error.response.status, error.response.data);
    } else if (error.response?.status === 403) {
      console.warn('🚫 ممنوع - صلاحيات غير كافية');
    } else if (error.response?.status === 404) {
      console.warn('🔍 غير موجود:', originalRequest?.url);
    }

    return Promise.reject(error);
  }
);

/**
 * تحديد ما إذا كان المسار يتطلب مصادقة
 */
function isProtectedRoute(url: string): boolean {
  const protectedPatterns = [
    '/api/profile',
    '/api/admin',
    '/api/interactions/like',
    '/api/interactions/save',
    '/api/comments',
    '/api/users/me',
    '/api/user/',
    '/api/notifications'
  ];
  
  return protectedPatterns.some(pattern => url.includes(pattern));
}

/**
 * قراءة قيمة كوكي بأمان
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

/**
 * Helper functions محسّنة للطلبات الشائعة
 */
export const api = {
  get: <T = any>(url: string, config?: any) => {
    console.log('📍 GET:', url);
    return apiClient.get<T>(url, config).then((res: any) => res.data);
  },
  
  post: <T = any>(url: string, data?: any, config?: any) => {
    console.log('📍 POST:', url);
    return apiClient.post<T>(url, data, config).then((res: any) => res.data);
  },
  
  put: <T = any>(url: string, data?: any, config?: any) => {
    console.log('📍 PUT:', url);
    return apiClient.put<T>(url, data, config).then((res: any) => res.data);
  },
  
  delete: <T = any>(url: string, config?: any) => {
    console.log('📍 DELETE:', url);
    return apiClient.delete<T>(url, config).then((res: any) => res.data);
  },
  
  patch: <T = any>(url: string, data?: any, config?: any) => {
    console.log('📍 PATCH:', url);
    return apiClient.patch<T>(url, data, config).then((res: any) => res.data);
  },
};

// تصدير instance للاستخدام المتقدم
export default apiClient;

// دالة إضافية لفحص صحة الجلسة
export const checkSession = async (): Promise<boolean> => {
  try {
    const response = await api.get('/auth/me');
    return response?.success === true;
  } catch {
    return false;
  }
};

// دالة لفرض تجديد التوكن يدوياً
export const forceRefreshToken = async (): Promise<boolean> => {
  try {
    const response = await axios.post('/api/auth/refresh', {}, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data?.success === true;
  } catch {
    return false;
  }
};
