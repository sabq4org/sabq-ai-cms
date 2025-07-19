'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotifications } from './useNotifications';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  isSlowPage: boolean;
}

export const usePagePerformance = (pageName: string, threshold = 3000) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    isSlowPage: false
  });
  
  const { showPerformanceWarning } = useNotifications();
  const startTimeRef = useRef(performance.now());
  const renderStartRef = useRef<number | null>(null);

  useEffect(() => {
    // بدء قياس وقت الرندر
    renderStartRef.current = performance.now();

    // قياس الأداء بعد اكتمال الرندر
    const measurePerformance = () => {
      const loadTime = performance.now() - startTimeRef.current;
      const renderTime = renderStartRef.current 
        ? performance.now() - renderStartRef.current 
        : 0;

      // قياس استهلاك الذاكرة إذا كان متاحاً
      let memoryUsage = 0;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      const isSlowPage = loadTime > threshold;

      const newMetrics: PerformanceMetrics = {
        loadTime,
        renderTime,
        memoryUsage,
        isSlowPage
      };

      setMetrics(newMetrics);

      // إظهار تحذير إذا كانت الصفحة بطيئة
      if (isSlowPage) {
        showPerformanceWarning(pageName, Math.round(loadTime));
      }

      // تسجيل المقاييس في وضع التطوير
      if (process.env.NODE_ENV === 'development') {
        console.group(`📊 Page Performance: ${pageName}`);
        console.log(`⏱️ Load Time: ${Math.round(loadTime)}ms`);
        console.log(`🎨 Render Time: ${Math.round(renderTime)}ms`);
        console.log(`💾 Memory Usage: ${memoryUsage.toFixed(2)}MB`);
        console.log(`🐌 Is Slow: ${isSlowPage ? 'Yes' : 'No'}`);
        console.groupEnd();
      }
    };

    // قياس الأداء بعد تحميل الصفحة
    const timer = setTimeout(measurePerformance, 100);

    return () => clearTimeout(timer);
  }, [pageName, threshold, showPerformanceWarning]);

  // دالة لقياس أداء عملية معينة
  const measureOperation = (operationName: string, operation: () => void | Promise<void>) => {
    const start = performance.now();
    
    const finish = () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${operationName}: ${Math.round(duration)}ms`);
      }
      
      // تحذير إذا كانت العملية بطيئة
      if (duration > 1000) {
        showPerformanceWarning(`${pageName} - ${operationName}`, Math.round(duration));
      }
    };

    try {
      const result = operation();
      if (result instanceof Promise) {
        return result.finally(finish);
      } else {
        finish();
        return result;
      }
    } catch (error) {
      finish();
      throw error;
    }
  };

  // دالة لتحسين الأداء
  const optimizePerformance = () => {
    // تنظيف الذاكرة إذا كان متاحاً
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch (e) {
        // تجاهل الخطأ إذا لم يكن متاحاً
      }
    }

    // إزالة event listeners غير المستخدمة
    const unusedListeners = document.querySelectorAll('[data-cleanup]');
    unusedListeners.forEach(element => {
      element.remove();
    });

    // تنظيف timers منتهية الصلاحية
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
  };

  return {
    metrics,
    measureOperation,
    optimizePerformance
  };
};

export default usePagePerformance;