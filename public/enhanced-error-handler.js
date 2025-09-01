// معالج متقدم للأخطاء 401 المتوقعة
(() => {
  'use strict';
  
  // إخفاء أخطاء 401 المتوقعة من APIs المصادقة
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const [url, options] = args;
    
    return originalFetch.apply(this, args)
      .catch(error => {
        const urlStr = typeof url === 'string' ? url : url.toString();
        
        // إخفاء أخطاء 401 المتوقعة من APIs المصادقة
        if (urlStr.includes('/api/auth/me') && error.status === 401) {
          // لا تطبع الخطأ في الكونسول، هذا متوقع
          return Promise.resolve(new Response(
            JSON.stringify({ success: false, authenticated: false }),
            { 
              status: 401, 
              headers: { 'Content-Type': 'application/json' }
            }
          ));
        }
        
        return Promise.reject(error);
      });
  };
  
  // إخفاء أخطاء الشبكة غير المهمة
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    // إخفاء أخطاء معينة
    const ignoredErrors = [
      'Failed to preconnect to https://d2kdkzp4dtcikk.cloudfront.net',
      'A server with the specified hostname could not be found',
      'Failed to load resource: the server responded with a status of 401',
      'X-Content-Type-Options: nosniff'
    ];
    
    if (ignoredErrors.some(ignored => message.includes(ignored))) {
      return; // لا تطبع هذه الأخطاء
    }
    
    return originalError.apply(this, args);
  };
  
  // إخفاء تحذيرات preconnect للنطاقات غير الموجودة
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('preconnect') || message.includes('cloudfront')) {
      return; // لا تطبع هذه التحذيرات
    }
    
    return originalWarn.apply(this, args);
  };
  
  console.log('✅ تم تفعيل معالج الأخطاء المحسن');
})();
