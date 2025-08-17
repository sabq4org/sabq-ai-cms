'use client';

import { useEffect } from 'react';

export default function ProductionErrorHandler() {
  useEffect(() => {
    // التقاط أخطاء JavaScript غير المعالجة
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('🚨 خطأ JavaScript غير معالج:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });

      // منع عرض الخطأ في الكونسول للمستخدمين العاديين
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
      }

      // إرسال التقرير للخادم
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: event.message || 'خطأ JavaScript غير معروف',
          stack: event.error?.stack || '',
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          type: 'javascript_error'
        })
      }).catch(console.error);
    };

    // التقاط Promise rejections غير المعالجة
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Promise rejection غير معالج:', event.reason);

      // منع عرض الخطأ في الكونسول للمستخدمين العاديين
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
      }

      // إرسال التقرير للخادم
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack || '',
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          type: 'promise_rejection'
        })
      }).catch(console.error);
    };

    // إضافة مستمعي الأحداث
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // تنظيف عند إلغاء التركيب
    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // معالجة أخطاء تحميل الموارد (CSS, JS, Images)
  useEffect(() => {
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target) {
        console.warn('⚠️ فشل تحميل مورد:', {
          tagName: target.tagName,
          src: (target as any).src || (target as any).href,
          url: window.location.href
        });

        // إصلاح تلقائي للصور المعطلة
        if (target.tagName === 'IMG') {
          const img = target as HTMLImageElement;
          if (img.src && !img.src.includes('placeholder')) {
            img.src = 'https://via.placeholder.com/400x300/2563eb/ffffff?text=سبق';
          }
        }

        // إصلاح تلقائي لملفات CSS المعطلة
        if (target.tagName === 'LINK' && (target as HTMLLinkElement).rel === 'stylesheet') {
          console.log('🔧 محاولة إعادة تحميل ملف CSS...');
          // يمكن إضافة منطق إعادة التحميل هنا
        }
      }
    };

    // استخدام capture phase للتقاط أخطاء تحميل الموارد
    document.addEventListener('error', handleResourceError, true);

    return () => {
      document.removeEventListener('error', handleResourceError, true);
    };
  }, []);

  // تحسين أداء الصور lazy loading
  useEffect(() => {
    // إضافة Intersection Observer للصور
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            
            // تحميل الصورة عند الحاجة
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // مراقبة جميع الصور المؤجلة التحميل
      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });

      return () => {
        imageObserver.disconnect();
      };
    }
  }, []);

  return null; // لا يعرض أي واجهة مستخدم
}

// Hook للاستخدام في الكومبوننتات
export function useErrorHandler() {
  const reportError = (error: Error, context?: string) => {
    console.error(`🚨 خطأ في ${context || 'المكون'}:`, error);

    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack || '',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        context: context || 'component',
        type: 'component_error'
      })
    }).catch(console.error);
  };

  const reportAPIError = (endpoint: string, status: number, message: string) => {
    console.error(`🌐 خطأ API في ${endpoint}:`, { status, message });

    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `API Error: ${message}`,
        stack: `Endpoint: ${endpoint}, Status: ${status}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        endpoint,
        status,
        type: 'api_error'
      })
    }).catch(console.error);
  };

  return { reportError, reportAPIError };
}