/**
 * مساعدات للتعامل مع Server-Side Rendering
 */

/**
 * التحقق من وجود window object (البيئة المتصفح)
 */
export const isClient = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * التحقق من وجود document object
 */
export const hasDocument = (): boolean => {
  return typeof document !== 'undefined';
};

/**
 * التحقق من وجود navigator object
 */
export const hasNavigator = (): boolean => {
  return typeof navigator !== 'undefined';
};

/**
 * تنفيذ دالة فقط في بيئة المتصفح
 */
export const clientOnly = <T>(fn: () => T, fallback?: T): T | undefined => {
  if (isClient()) {
    try {
      return fn();
    } catch (error) {
      console.warn('Error in client-only function:', error);
      return fallback;
    }
  }
  return fallback;
};

/**
 * الحصول على معلومات المتصفح بأمان
 */
export const getBrowserInfo = () => {
  return clientOnly(() => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  }), {
    userAgent: 'Unknown',
    language: 'ar',
    platform: 'Unknown',
    cookieEnabled: false,
    onLine: false
  });
};

/**
 * الحصول على معلومات النافذة بأمان
 */
export const getWindowInfo = () => {
  return clientOnly(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    location: {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    }
  }), {
    width: 1024,
    height: 768,
    scrollX: 0,
    scrollY: 0,
    location: {
      href: '',
      pathname: '/',
      search: '',
      hash: ''
    }
  });
};

/**
 * التعامل مع localStorage بأمان
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    return clientOnly(() => localStorage.getItem(key), null);
  },
  
  setItem: (key: string, value: string): boolean => {
    return clientOnly(() => {
      localStorage.setItem(key, value);
      return true;
    }, false) || false;
  },
  
  removeItem: (key: string): boolean => {
    return clientOnly(() => {
      localStorage.removeItem(key);
      return true;
    }, false) || false;
  },
  
  clear: (): boolean => {
    return clientOnly(() => {
      localStorage.clear();
      return true;
    }, false) || false;
  }
};

/**
 * التعامل مع sessionStorage بأمان
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    return clientOnly(() => sessionStorage.getItem(key), null);
  },
  
  setItem: (key: string, value: string): boolean => {
    return clientOnly(() => {
      sessionStorage.setItem(key, value);
      return true;
    }, false) || false;
  },
  
  removeItem: (key: string): boolean => {
    return clientOnly(() => {
      sessionStorage.removeItem(key);
      return true;
    }, false) || false;
  },
  
  clear: (): boolean => {
    return clientOnly(() => {
      sessionStorage.clear();
      return true;
    }, false) || false;
  }
};

/**
 * إضافة event listener بأمان
 */
export const safeAddEventListener = (
  target: 'window' | 'document' | EventTarget,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): (() => void) | null => {
  return clientOnly(() => {
    let targetElement: EventTarget | null = null;
    
    if (target === 'window') {
      targetElement = window;
    } else if (target === 'document') {
      targetElement = document;
    } else {
      targetElement = target;
    }
    
    if (targetElement) {
      targetElement.addEventListener(event, handler, options);
      
      // إرجاع دالة cleanup
      return () => {
        targetElement!.removeEventListener(event, handler, options);
      };
    }
    
    return null;
  }, null);
};

/**
 * تنفيذ دالة عند تحميل DOM
 */
export const onDOMReady = (callback: () => void): void => {
  clientOnly(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  });
};

/**
 * Hook للتحقق من حالة التحميل
 */
export const useIsClient = (): boolean => {
  const [isClientState, setIsClientState] = React.useState(false);
  
  React.useEffect(() => {
    setIsClientState(true);
  }, []);
  
  return isClientState;
};

// إضافة React import للـ hook
import React from 'react';