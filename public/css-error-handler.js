// معالج أخطاء CSS لتجنب عطل الواجهة
(function() {
  if (typeof window === 'undefined') return;
  
  // معالج أخطاء CSS chunks
  window.addEventListener('error', function(event) {
    if (event.target && event.target.tagName === 'LINK') {
      const link = event.target;
      if (link.rel === 'stylesheet' && link.href) {
        console.warn('CSS load error:', link.href);
        
        // منع إظهار الخطأ للمستخدم
        event.preventDefault();
        event.stopPropagation();
        
        // إزالة الرابط المعطوب
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        
        // محاولة تحميل CSS احتياطي إذا كان ضرورياً
        if (link.href.includes('globals') || link.href.includes('critical')) {
          // لا تفعل شيء - CSS حرج
          console.error('Critical CSS failed to load');
        }
      }
    }
  }, true);
  
  // معالج أخطاء JavaScript Syntax
  const originalError = console.error;
  console.error = function() {
    const args = Array.prototype.slice.call(arguments);
    const message = String(args[0] || '');
    
    // تصفية أخطاء CSS Syntax
    if (message.includes('SyntaxError') && message.includes('.css')) {
      console.warn('CSS syntax error suppressed:', message.substring(0, 100));
      return; // لا تظهر الخطأ
    }
    
    // أخطاء أخرى تمرر عادي
    originalError.apply(console, args);
  };
})();
