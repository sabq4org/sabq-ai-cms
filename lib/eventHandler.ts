/**
 * مكتبة آمنة لمعالجة الأحداث
 * لحل مشكلة Error: [object Event] في Next.js
 */

interface SafeEventOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
}

/**
 * إضافة مستمع حدث بشكل آمن
 */
export function safeAddEventListener(
  target: EventTarget | null,
  type: string,
  listener: EventListener,
  options?: SafeEventOptions
): boolean {
  try {
    if (!target || typeof target.addEventListener !== 'function') {
      console.warn(`Cannot add event listener: target is not valid for type ${type}`);
      return false;
    }

    target.addEventListener(type, listener, options);
    return true;
  } catch (error) {
    console.error(`Error adding event listener for ${type}:`, error);
    return false;
  }
}

/**
 * إزالة مستمع حدث بشكل آمن
 */
export function safeRemoveEventListener(
  target: EventTarget | null,
  type: string,
  listener: EventListener,
  options?: SafeEventOptions
): boolean {
  try {
    if (!target || typeof target.removeEventListener !== 'function') {
      console.warn(`Cannot remove event listener: target is not valid for type ${type}`);
      return false;
    }

    target.removeEventListener(type, listener, options);
    return true;
  } catch (error) {
    console.error(`Error removing event listener for ${type}:`, error);
    return false;
  }
}

/**
 * إطلاق حدث مخصص بشكل آمن
 */
export function safeDispatchEvent(
  target: EventTarget | null,
  event: Event
): boolean {
  try {
    if (!target || typeof target.dispatchEvent !== 'function') {
      console.warn('Cannot dispatch event: target is not valid');
      return false;
    }

    return target.dispatchEvent(event);
  } catch (error) {
    console.error('Error dispatching event:', error);
    return false;
  }
}

/**
 * إنشاء حدث مخصص بشكل آمن
 */
export function safeCreateCustomEvent(
  type: string,
  detail?: any,
  options?: CustomEventInit
): CustomEvent | null {
  try {
    if (typeof CustomEvent === 'undefined') {
      console.warn('CustomEvent is not supported in this environment');
      return null;
    }

    return new CustomEvent(type, {
      detail,
      bubbles: true,
      cancelable: true,
      ...options
    });
  } catch (error) {
    console.error('Error creating custom event:', error);
    return null;
  }
}

/**
 * معالج آمن للأحداث مع حماية من الأخطاء
 */
export function createSafeEventHandler(
  handler: (event: Event) => void,
  context?: string
): EventListener {
  return (event: Event) => {
    try {
      if (!event) {
        console.warn(`${context || 'Event handler'}: Received null or undefined event`);
        return;
      }

      handler(event);
    } catch (error) {
      console.error(`${context || 'Event handler'} error:`, error);
      
      // منع انتشار الخطأ
      if (event && event.preventDefault) {
        event.preventDefault();
      }
    }
  };
}

/**
 * Hook لمعالجة الأحداث بشكل آمن في React
 */
export function useSafeEventListener(
  target: EventTarget | null,
  type: string,
  handler: (event: Event) => void,
  options?: SafeEventOptions,
  context?: string
) {
  const safeHandler = createSafeEventHandler(handler, context);

  const addListener = () => {
    return safeAddEventListener(target, type, safeHandler, options);
  };

  const removeListener = () => {
    return safeRemoveEventListener(target, type, safeHandler, options);
  };

  return { addListener, removeListener, safeHandler };
}

/**
 * التحقق من توفر API الأحداث
 */
export function isEventAPISupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof Event !== 'undefined' && 
         typeof EventTarget !== 'undefined' &&
         typeof addEventListener !== 'undefined';
}

/**
 * تنظيف جميع مستمعي الأحداث لمكون معين
 */
export function cleanupEventListeners(
  target: EventTarget | null,
  listeners: Array<{ type: string; handler: EventListener; options?: SafeEventOptions }>
): void {
  listeners.forEach(({ type, handler, options }) => {
    safeRemoveEventListener(target, type, handler, options);
  });
}

/**
 * مثال على الاستخدام:
 * 
 * import { useSafeEventListener, safeCreateCustomEvent, safeDispatchEvent } from '@/lib/eventHandler';
 * 
 * // في مكون React
 * const { addListener, removeListener } = useSafeEventListener(
 *   window,
 *   'custom-event',
 *   (event) => {
 *     console.log('Custom event received:', event);
 *   },
 *   undefined,
 *   'MyComponent'
 * );
 * 
 * useEffect(() => {
 *   addListener();
 *   return removeListener;
 * }, []);
 * 
 * // إطلاق حدث مخصص
 * const customEvent = safeCreateCustomEvent('my-event', { data: 'test' });
 * if (customEvent) {
 *   safeDispatchEvent(window, customEvent);
 * }
 */ 