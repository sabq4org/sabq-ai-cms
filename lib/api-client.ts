/**
 * Axios client مع Silent Refresh للحفاظ على الجلسات
 * يتعامل مع تجديد Access Token تلقائياً عند انتهاء صلاحيته
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// إنشاء instance مخصص
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // مهم لإرسال الكوكيز
});

// متغيرات لإدارة عملية التجديد
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

// Request interceptor - لإضافة CSRF token تلقائياً
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // إضافة CSRF token للطلبات التي تحتاجه
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1];
      
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - للتعامل مع 401 وتجديد التوكن
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response successful:', response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.log('❌ API Error:', error.config?.url, error.response?.status);
    console.log('❌ Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // إذا كان هناك تجديد جاري، أضف الطلب للطابور
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 محاولة تجديد التوكن...');
        
        // محاولة تجديد التوكن
        const response = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 Refresh response status:', response.status);
        console.log('🔍 Refresh response data:', response.data);

        if (response.data.success) {
          // نجح التجديد، معالجة الطابور
          console.log('✅ تم تجديد التوكن بنجاح');
          processQueue(null);
          
          // أطلق حدث لتحديث حالة المصادقة
          window.dispatchEvent(new Event('auth-change'));
          
          // إعادة إرسال الطلب الأصلي
          return apiClient(originalRequest);
        } else {
          console.log('❌ فشل تجديد التوكن - response not successful:', response.data);
          throw new Error('فشل تجديد الجلسة');
        }
      } catch (refreshError) {
        // فشل التجديد، معالجة الطابور بالخطأ
        console.warn('⚠️ Silent refresh failed');
        processQueue(refreshError, null);
        
        // تنظيف الجلسة المحلية
        if (typeof window !== 'undefined') {
          // إزالة أي بيانات محلية متعلقة بالمصادقة
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          
          // إطلاق حدث لتحديث حالة المصادقة
          window.dispatchEvent(new Event('auth-change'));
          
          // إعادة التوجيه فقط إذا كان الطلب يتطلب مصادقة
          // يتم تحديد ذلك من خلال config خاص أو من مسار API محمي
          const requiresAuth = originalRequest.config?.requiresAuth || 
                              originalRequest.url?.includes('/api/profile/') ||
                              originalRequest.url?.includes('/api/admin/') ||
                              originalRequest.url?.includes('/api/interactions/like') ||
                              originalRequest.url?.includes('/api/interactions/save');
          
          if (requiresAuth) {
            const currentPath = window.location.pathname;
            const loginUrl = `/login?next=${encodeURIComponent(currentPath)}`;
            
            // تجنب إعادة التوجيه المتكررة
            if (!window.location.pathname.includes('/login')) {
              console.log('🔄 Redirecting to login for protected route');
              window.location.href = loginUrl;
            }
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions للطلبات الشائعة
export const api = {
  get: <T = any>(url: string, config?: any) => 
    apiClient.get<T>(url, config).then(res => res.data),
  
  post: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.post<T>(url, data, config).then(res => res.data),
  
  put: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.put<T>(url, data, config).then(res => res.data),
  
  delete: <T = any>(url: string, config?: any) => 
    apiClient.delete<T>(url, config).then(res => res.data),
  
  patch: <T = any>(url: string, data?: any, config?: any) => 
    apiClient.patch<T>(url, data, config).then(res => res.data),
};

export default apiClient;
