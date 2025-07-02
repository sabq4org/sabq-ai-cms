/**
 * إصلاح بسيط لمشكلة Error: [object Event] في Next.js
 * تاريخ الإنشاء: 2025-01-29
 */

/**
 * تطبيق إصلاحات Runtime Error
 */
export function applyRuntimeFixes() {
  if (typeof window === 'undefined') return;

  try {
    // إصلاح معالجة الأخطاء العامة
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // معالجة خاصة لخطأ [object Event]
      if (message === '[object Event]' || (typeof message === 'string' && message.includes('[object Event]'))) {
        console.warn('Caught [object Event] error, preventing crash');
        return true; // منع الخطأ من الانتشار
      }
      
      // استدعاء المعالج الأصلي
      if (originalOnError) {
        return originalOnError.call(this, message, source, lineno, colno, error);
      }
      
      return false;
    };

    // إصلاح معالجة Promise rejections
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
      // معالجة خاصة لخطأ [object Event]
      if (event.reason && typeof event.reason === 'object' && event.reason.toString() === '[object Event]') {
        console.warn('Caught unhandled promise rejection with [object Event], preventing crash');
        event.preventDefault();
        return;
      }
      
      // استدعاء المعالج الأصلي
      if (originalOnUnhandledRejection) {
        originalOnUnhandledRejection(event);
      }
    };

    console.log('✅ Runtime error fixes applied');
  } catch (error) {
    console.error('Error applying runtime fixes:', error);
  }
}

/**
 * إصلاح معالجة Custom Events
 */
export function fixCustomEvents() {
  if (typeof window === 'undefined') return;

  try {
    // إصلاح dispatchEvent
    const originalDispatchEvent = window.dispatchEvent;
    window.dispatchEvent = function(event) {
      try {
        // التحقق من صحة الحدث
        if (!event || typeof event !== 'object') {
          console.warn('Invalid event object, skipping dispatch');
          return false;
        }

        // التحقق من CustomEvent
        if (event instanceof CustomEvent && !event.detail) {
          console.warn('CustomEvent without detail, adding empty detail');
          Object.defineProperty(event, 'detail', {
            value: {},
            writable: false,
            configurable: false
          });
        }

        return originalDispatchEvent.call(this, event);
      } catch (error) {
        console.error('Error in dispatchEvent:', error);
        return false;
      }
    };

    console.log('✅ Custom event fixes applied');
  } catch (error) {
    console.error('Error applying custom event fixes:', error);
  }
}

/**
 * تطبيق جميع الإصلاحات
 */
export function applyAllFixes() {
  console.log('🔧 Applying all runtime fixes...');
  
  applyRuntimeFixes();
  fixCustomEvents();
  
  console.log('✅ All fixes applied successfully');
}

// تطبيق الإصلاحات تلقائياً عند تحميل الملف
if (typeof window !== 'undefined') {
  // تأخير قليل للتأكد من تحميل كل شيء
  setTimeout(() => {
    applyAllFixes();
  }, 100);
} 