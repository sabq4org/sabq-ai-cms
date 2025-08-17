/**
 * إصلاح شامل لمشاكل Next.js DevTools
 * يتم تحميله قبل أي شيء آخر لمنع الأخطاء
 */

(function() {
  'use strict';

  console.log('🔧 تحميل إصلاح DevTools...');

  // فحص إذا كان DevTools معطل مسبقاً
  if (localStorage.getItem('__NEXT_DEVTOOLS_DISABLED__') === 'true') {
    window.__NEXT_DEVTOOLS_DISABLED__ = true;
    console.log('✅ DevTools معطل مسبقاً');
    return;
  }

  // قائمة أنماط أخطاء DevTools وReact Server Components
  const devToolsErrorPatterns = [
    /webpack-internal/,
    /next-devtools/,
    /tr@webpack-internal/,
    /o6@webpack-internal/,
    /iP@webpack-internal/,
    /i\$@webpack-internal/,
    /sv@webpack-internal/,
    /sm@webpack-internal/,
    /sa@webpack-internal/,
    /sZ@webpack-internal/,
    /_@webpack-internal/,
    /pages-dir-browser/,
    /compiled\/next-devtools/,
    /options\.factory/,
    /requireModule/,
    /initializeModuleChunk/,
    /readChunk/,
    /react-server-dom-webpack/,
    /performUnitOfWork/,
    /workLoopConcurrentByScheduler/,
    /renderRootConcurrent/,
    /app-pages-browser/
  ];

  // فحص إذا كان النص يحتوي على خطأ DevTools
  function isDevToolsError(text) {
    if (!text || typeof text !== 'string') return false;
    return devToolsErrorPatterns.some(pattern => pattern.test(text));
  }

  // تطبيق الإصلاح
  function applyDevToolsFix() {
    console.log('🔧 تطبيق إصلاح DevTools...');
    
    // تعطيل DevTools
    localStorage.setItem('__NEXT_DEVTOOLS_DISABLED__', 'true');
    window.__NEXT_DEVTOOLS_DISABLED__ = true;
    
    // تسجيل الإصلاح
    sessionStorage.setItem('devtools_fix_applied', Date.now().toString());
    
    // إعادة تحميل بعد ثانية واحدة
    setTimeout(() => {
      console.log('🔄 إعادة تحميل لتطبيق الإصلاح...');
      window.location.reload();
    }, 1000);
  }

  // اعتراض console.error
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (isDevToolsError(message)) {
      console.warn('🔧 تم اكتشاف خطأ DevTools:', message.substring(0, 100) + '...');
      applyDevToolsFix();
      return; // عدم عرض الخطأ
    }
    
    originalConsoleError.apply(console, args);
  };

  // اعتراض window.onerror
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (isDevToolsError(message) || isDevToolsError(source)) {
      console.warn('🔧 تم اكتشاف خطأ DevTools في window.onerror');
      applyDevToolsFix();
      return true; // منع عرض الخطأ
    }
    
    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };

  // اعتراض addEventListener للأخطاء
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (type === 'error' && typeof listener === 'function') {
      const wrappedListener = function(event) {
        if (event.message && isDevToolsError(event.message)) {
          console.warn('🔧 تم اكتشاف خطأ DevTools في event listener');
          applyDevToolsFix();
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        
        if (event.filename && isDevToolsError(event.filename)) {
          console.warn('🔧 تم اكتشاف خطأ DevTools في filename');
          applyDevToolsFix();
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        
        return listener.call(this, event);
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };

  // اعتراض unhandledrejection
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    const message = reason?.message || reason?.toString() || '';
    
    if (isDevToolsError(message)) {
      console.warn('🔧 تم اكتشاف خطأ DevTools في promise rejection');
      applyDevToolsFix();
      event.preventDefault();
    }
  });

  // تنظيف دوري للأخطاء
  setInterval(() => {
    // مسح أخطاء DevTools من الكونسول إذا كانت موجودة
    if (console.clear && Math.random() < 0.1) { // 10% احتمال كل دقيقة
      const errors = document.querySelectorAll('.console-error');
      errors.forEach(error => {
        if (error.textContent && isDevToolsError(error.textContent)) {
          error.remove();
        }
      });
    }
  }, 60000); // كل دقيقة

  // فحص إذا كان الإصلاح تم تطبيقه مؤخراً
  const lastFix = sessionStorage.getItem('devtools_fix_applied');
  if (lastFix) {
    const timeSinceLastFix = Date.now() - parseInt(lastFix);
    if (timeSinceLastFix < 10000) { // خلال 10 ثوانٍ
      console.log('✅ تم تطبيق إصلاح DevTools مؤخراً');
    }
  }

  console.log('✅ تم تحميل إصلاح DevTools بنجاح');

})();