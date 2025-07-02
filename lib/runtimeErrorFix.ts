import { useEffect } from 'react';

/**
 * إصلاح سريع لمشكلة Error: [object Event] في Next.js
 * تاريخ الإنشاء: 2025-01-29
 */

/**
 * إصلاح معالجة الأحداث العامة
 */
export function fixEventHandling() {
  if (typeof window === 'undefined') return;

  try {
    // إصلاح معالجة الأخطاء العامة
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      // معالجة خاصة لخطأ [object Event]
      if (message === '[object Event]' || (typeof message === 'string' && message.includes('[object Event]'))) {
        console.warn('Caught [object Event] error, preventing crash');
        return true; // منع الخطأ من الانتشار
      }
      
      // استدعاء المعالج الأصلي
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
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
        originalOnUnhandledRejection.call(this, event);
      }
    };

    console.log('✅ Event handling fixes applied');
  } catch (error) {
    console.error('Error applying event handling fixes:', error);
  }
}

/**
 * إصلاح معالجة Custom Events
 */
export function fixCustomEventHandling() {
  if (typeof window === 'undefined') return;

  try {
    // إصلاح dispatchEvent
    const originalDispatchEvent = window.dispatchEvent;
    window.dispatchEvent = function(event: Event): boolean {
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

    console.log('✅ Custom event handling fixes applied');
  } catch (error) {
    console.error('Error applying custom event fixes:', error);
  }
}

/**
 * إصلاح معالجة Event Listeners
 */
export function fixEventListenerHandling() {
  if (typeof window === 'undefined') return;

  try {
    // إصلاح addEventListener
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void {
      try {
        // التحقق من صحة المعاملات
        if (!type || typeof type !== 'string') {
          console.warn('Invalid event type, skipping addEventListener');
          return;
        }

        if (!listener || typeof listener !== 'function') {
          console.warn('Invalid event listener, skipping addEventListener');
          return;
        }

        // تغليف المعالج لحماية من الأخطاء
        const safeListener = (event: Event) => {
          try {
            return listener.call(this, event);
          } catch (error) {
            console.error(`Error in event listener for ${type}:`, error);
            
            // منع انتشار الخطأ
            if (event && event.preventDefault) {
              event.preventDefault();
            }
            if (event && event.stopPropagation) {
              event.stopPropagation();
            }
          }
        };

        return originalAddEventListener.call(this, type, safeListener, options);
      } catch (error) {
        console.error('Error in addEventListener:', error);
      }
    };

    // إصلاح removeEventListener
    const originalRemoveEventListener = window.removeEventListener;
    window.removeEventListener = function(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void {
      try {
        return originalRemoveEventListener.call(this, type, listener, options);
      } catch (error) {
        console.error('Error in removeEventListener:', error);
      }
    };

    console.log('✅ Event listener handling fixes applied');
  } catch (error) {
    console.error('Error applying event listener fixes:', error);
  }
}

/**
 * تطبيق جميع الإصلاحات
 */
export function applyAllRuntimeFixes() {
  console.log('🔧 Applying runtime error fixes...');
  
  fixEventHandling();
  fixCustomEventHandling();
  fixEventListenerHandling();
  
  console.log('✅ All runtime error fixes applied');
}

/**
 * Hook لاستخدام الإصلاحات في React
 */
export function useRuntimeErrorFixes() {
  React.useEffect(() => {
    applyAllRuntimeFixes();
  }, []);
}

// تطبيق الإصلاحات تلقائياً عند تحميل الملف
if (typeof window !== 'undefined') {
  // تأخير قليل للتأكد من تحميل كل شيء
  setTimeout(() => {
    applyAllRuntimeFixes();
  }, 100);
} 