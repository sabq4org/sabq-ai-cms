/**
 * مكتبة تحسين الأداء للموقع
 */

// تحسين الصور
export const optimizeImages = () => {
  if (typeof window === 'undefined') return;
  
  // تحميل الصور بشكل lazy
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

// تحسين التمرير
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// debounce للبحث والفلترة
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// تحسين الذاكرة
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  cacheSize = 100
): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  }) as T;
};

// تحسين الـ DOM
export const batchDOMUpdates = (callback: () => void) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

// قياس الأداء
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// تنظيف الذاكرة
export const cleanupResources = () => {
  // تنظيف event listeners
  const cleanup: (() => void)[] = [];
  
  return {
    add: (cleanupFn: () => void) => cleanup.push(cleanupFn),
    cleanup: () => cleanup.forEach(fn => fn())
  };
};

// تحسين الشبكة
export const prefetchRoute = (url: string) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;
  
  // تحميل الخطوط المهمة مسبقاً
  const criticalFonts = [
    '/fonts/arabic-font.woff2',
    '/fonts/main-font.woff2'
  ];
  
  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// فحص اتصال الشبكة
export const getConnectionInfo = () => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return { effectiveType: '4g', saveData: false };
  }
  
  const connection = (navigator as any).connection;
  return {
    effectiveType: connection.effectiveType || '4g',
    saveData: connection.saveData || false,
    downlink: connection.downlink || 10
  };
};

// تحسين الأداء حسب نوع الاتصال
export const adaptToConnection = () => {
  const { effectiveType, saveData } = getConnectionInfo();
  
  // تقليل جودة الصور للاتصال البطيء
  if (effectiveType === '2g' || effectiveType === 'slow-2g' || saveData) {
    return {
      imageQuality: 'low',
      enableAnimations: false,
      lazyLoadThreshold: '50px',
      prefetchDisabled: true
    };
  }
  
  return {
    imageQuality: 'high',
    enableAnimations: true,
    lazyLoadThreshold: '200px',
    prefetchDisabled: false
  };
};
