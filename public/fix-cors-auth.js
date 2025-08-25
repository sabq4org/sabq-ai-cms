// إصلاح مشاكل CORS والمصادقة في الإنتاج
(function() {
  'use strict';
  
  // تجاوز fetch لإضافة معالجة أخطاء CORS ومنع فرض Content-Type على FormData
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options = {}] = args;
    
    // إضافة credentials للطلبات المحلية
    if (typeof url === 'string' && (url.startsWith('/api/') || url.includes('sabq.io/api/'))) {
      options.credentials = options.credentials || 'include';
      options.mode = options.mode || 'cors';
      
      // إضافة headers افتراضية مع احترام FormData/Blob
      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
      const isBlob = typeof Blob !== 'undefined' && options.body instanceof Blob;
      const isArrayBuffer = options.body instanceof ArrayBuffer || (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView && ArrayBuffer.isView(options.body));
      const isStream = options.body && typeof options.body === 'object' && typeof options.body.pipe === 'function';

      // ابدأ من الرؤوس الحالية إن وجدت
      const baseHeaders = { ...(options.headers || {}) };

      if (isFormData || isBlob || isArrayBuffer || isStream) {
        // لا تضع Content-Type، اترك المتصفح يحدد boundary
        delete baseHeaders['Content-Type'];
        delete baseHeaders['content-type'];
        delete baseHeaders['Content-type'];
        options.headers = {
          'Accept': 'application/json',
          ...baseHeaders,
        };
      } else {
        // طلبات JSON فقط
        options.headers = {
          'Accept': 'application/json',
          ...baseHeaders,
        };
        // ضع Content-Type: application/json فقط إذا كان الجسم نصاً JSONياً أو محدداً من الطرف المستدعي
        if (!('Content-Type' in options.headers) && !('content-type' in options.headers)) {
          if (typeof options.body === 'string') {
            options.headers['Content-Type'] = 'application/json';
          }
        }
      }
    }
    
    return originalFetch.apply(this, [url, options])
      .catch(error => {
        // إذا كان خطأ CORS مع /api/auth/me أو /api/user/me، أرجع استجابة فارغة
        if (error.message && error.message.includes('access control checks')) {
          const urlStr = typeof url === 'string' ? url : url.toString();
          if (urlStr.includes('/api/auth/me') || urlStr.includes('/api/user/me')) {
            console.warn('تجاوز خطأ CORS للمصادقة:', urlStr);
            return new Response(JSON.stringify({ success: false, user: null }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        throw error;
      });
  };
  
  // إصلاح مشاكل CSS
  document.addEventListener('error', function(event) {
    const el = event.target;
    if (el && el.tagName === 'LINK' && el.rel === 'stylesheet') {
      const href = el.href || '';
      
      // إذا كان الخطأ بسبب @ في CSS
      if (href.includes('.css')) {
        console.log('محاولة إعادة تحميل CSS:', href);
        event.preventDefault();
        
        // إنشاء style tag بدلاً من link
        fetch(href)
          .then(resp => resp.text())
          .then(css => {
            // تنظيف CSS من الأحرف الغريبة
            css = css.replace(/^\uFEFF/, ''); // Remove BOM
            css = css.replace(/^@charset\s+["'][^"']+["'];\s*/i, ''); // Remove @charset
            
            const style = document.createElement('style');
            style.textContent = css;
            style.setAttribute('data-href', href);
            document.head.appendChild(style);
            
            // إزالة link الأصلي
            el.remove();
          })
          .catch(err => {
            console.error('فشل تحميل CSS:', err);
          });
      }
    }
  }, true);
  
  // معالجة الأخطاء 401
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message) {
      const msg = event.reason.message;
      if (msg.includes('401') || msg.includes('Unauthorized')) {
        console.log('تجاهل خطأ 401 - المستخدم غير مسجل');
        event.preventDefault();
      }
    }
  });
  
})();
