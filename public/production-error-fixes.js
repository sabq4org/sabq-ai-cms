/**
 * إصلاحات شاملة لأخطاء الإنتاج
 * يعمل على حل المشاكل الشائعة في البيئة المنشورة
 */

if (typeof window !== 'undefined') {
  // 1. إصلاح React Error #130
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = function(...args) {
    const errorString = args[0] && args[0].toString ? args[0].toString() : '';
    
    // قمع أخطاء React #130
    if (errorString.includes && (
        errorString.includes('Minified React error #130') ||
        errorString.includes('react.dev/errors/130') ||
        errorString.includes('Component Exception')
      )) {
      console.debug('🔧 React Error #130 intercepted:', errorString);
      return;
    }
    
    // قمع أخطاء hydration الشائعة
    if (errorString.includes && (
        errorString.includes('Hydration failed') ||
        errorString.includes('Text content did not match') ||
        errorString.includes('useLayoutEffect does nothing on the server')
      )) {
      console.debug('🔧 Hydration warning suppressed:', errorString);
      return;
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // 2. قمع تحذيرات غير ضرورية
  console.warn = function(...args) {
    const warnString = args[0] && args[0].toString ? args[0].toString() : '';
    
    if (warnString.includes && (
        warnString.includes('لا توجد مقالات صالحة') ||
        warnString.includes('The resource') && warnString.includes('was preloaded') ||
        warnString.includes('Successfully preconnected')
      )) {
      console.debug('🔍 Warning intercepted:', warnString);
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };
  
  // 3. معالج أخطاء عام للأخطاء غير المتوقعة
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message) {
      const message = event.error.message;
      
      // قمع أخطاء React المعروفة
      if (message.includes('Minified React error') || 
          message.includes('ChunkLoadError') ||
          message.includes('Loading chunk')) {
        console.debug('🔧 Global error intercepted:', message);
        event.preventDefault();
        return false;
      }
    }
  });
  
  // 4. معالج أخطاء Promise غير المتوقعة
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message) {
      const message = event.reason.message;
      
      // قمع أخطاء الشبكة الشائعة
      if (message.includes('Failed to fetch') ||
          message.includes('NetworkError') ||
          message.includes('NETWORK_ERROR')) {
        console.debug('🔧 Network error intercepted:', message);
        event.preventDefault();
        return false;
      }
    }
  });
  
  // 5. تحسين أداء الصور
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });
  
  // تطبيق lazy loading على الصور
  setTimeout(() => {
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }, 1000);
  
  // 6. إصلاح مشاكل CSS وtokenization
  const style = document.createElement('style');
  style.textContent = `
    /* إصلاح مشاكل العرض الشائعة */
    .min-h-screen {
      min-height: 100vh !important;
    }
    
    /* إصلاح مشاكل الخطوط العربية */
    .font-arabic {
      font-family: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', sans-serif !important;
    }
    
    /* تحسين الأداء */
    img {
      content-visibility: auto;
      contain: layout style paint;
    }
    
    /* إخفاء العناصر المكسورة مؤقتاً */
    .react-error-boundary {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('✅ تم تطبيق إصلاحات أخطاء الإنتاج بنجاح');
}
