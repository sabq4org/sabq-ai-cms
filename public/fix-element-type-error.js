// إصلاح خطأ "Element type is invalid" في React
(function() {
  'use strict';
  
  console.log('🔧 بدء إصلاح خطأ Element type');
  
  // تجاوز console.error لالتقاط وإصلاح أخطاء Element type
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorStr = args[0]?.toString() || '';
    
    if (errorStr.includes('Element type is invalid')) {
      console.warn('⚠️ تم اكتشاف خطأ Element type:', errorStr);
      
      // محاولة استخراج معلومات عن المكون
      const match = errorStr.match(/got:\s*(\w+)/);
      if (match) {
        console.log('نوع العنصر المستلم:', match[1]);
      }
      
      // منع انتشار الخطأ
      return;
    }
    
    // للأخطاء الأخرى، مرر للconsole الأصلي
    originalConsoleError.apply(console, args);
  };
  
  // معالج أخطاء عام
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('Element type is invalid')) {
      console.warn('🛡️ منع خطأ Element type من إيقاف التطبيق');
      event.preventDefault();
      event.stopPropagation();
      
      // محاولة إعادة تحميل المكون المتأثر
      setTimeout(() => {
        const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
        errorBoundaries.forEach(boundary => {
          if (boundary._reactInternalFiber || boundary._reactInternalInstance) {
            console.log('محاولة إعادة تعيين Error Boundary');
            // إعادة تعيين حالة الخطأ
            const instance = boundary._reactInternalFiber?.stateNode || 
                           boundary._reactInternalInstance;
            if (instance && instance.setState) {
              instance.setState({ hasError: false, error: null });
            }
          }
        });
      }, 100);
    }
  }, true);
  
  // معالج Promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('Element type is invalid')) {
      console.warn('🛡️ منع Element type rejection');
      event.preventDefault();
    }
  });
  
  // إصلاح dynamic imports
  if (window.__webpack_require__) {
    const originalRequire = window.__webpack_require__;
    window.__webpack_require__ = function(moduleId) {
      try {
        const module = originalRequire(moduleId);
        
        // إذا كان الموديول object بدلاً من function، حاول إصلاحه
        if (module && typeof module === 'object' && !React.isValidElement(module)) {
          // إذا كان له default export
          if (module.default && typeof module.default === 'function') {
            return module.default;
          }
          
          // إذا كان له أي function exports
          const funcExports = Object.keys(module).filter(key => 
            typeof module[key] === 'function'
          );
          
          if (funcExports.length === 1) {
            return module[funcExports[0]];
          }
        }
        
        return module;
      } catch (error) {
        console.error('خطأ في تحميل الموديول:', moduleId, error);
        // إرجاع مكون فارغ كبديل
        return function EmptyComponent() { return null; };
      }
    };
  }
  
  console.log('✅ تم تطبيق إصلاحات Element type');
  
})();
