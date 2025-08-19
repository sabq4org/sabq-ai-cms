"use client";

import { useEffect, useState, useCallback } from 'react';
import { throttle, debounce, getConnectionInfo, adaptToConnection } from '@/lib/performance';

export function usePerformanceOptimization() {
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo());
  const [adaptiveSettings, setAdaptiveSettings] = useState(adaptToConnection());
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0
  });

  // مراقبة الاتصال
  useEffect(() => {
    const updateConnection = throttle(() => {
      const info = getConnectionInfo();
      setConnectionInfo(info);
      setAdaptiveSettings(adaptToConnection());
    }, 5000);

    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', updateConnection);
      return () => {
        (navigator as any).connection?.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  // قياس الأداء
  const measureRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: prev.renderTime + renderTime
      }));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
    };
  }, []);

  // تحسين الصور
  const optimizeImage = useCallback((src: string, quality?: 'low' | 'medium' | 'high') => {
    const targetQuality = quality || adaptiveSettings.imageQuality;
    
    if (targetQuality === 'low' || connectionInfo.effectiveType === '2g') {
      return `${src}?w=400&q=60`;
    } else if (targetQuality === 'medium' || connectionInfo.effectiveType === '3g') {
      return `${src}?w=800&q=80`;
    } else {
      return `${src}?w=1200&q=90`;
    }
  }, [adaptiveSettings.imageQuality, connectionInfo.effectiveType]);

  // تحسين التحميل
  const shouldPreload = useCallback((priority: 'high' | 'low') => {
    if (adaptiveSettings.prefetchDisabled) return false;
    if (connectionInfo.saveData) return priority === 'high';
    if (connectionInfo.effectiveType === '2g') return false;
    return true;
  }, [adaptiveSettings.prefetchDisabled, connectionInfo]);

  // تحسين الرسوم المتحركة
  const shouldAnimate = useCallback(() => {
    return adaptiveSettings.enableAnimations && 
           !connectionInfo.saveData && 
           connectionInfo.effectiveType !== '2g';
  }, [adaptiveSettings.enableAnimations, connectionInfo]);

  return {
    connectionInfo,
    adaptiveSettings,
    performanceMetrics,
    measureRender,
    optimizeImage,
    shouldPreload,
    shouldAnimate,
    
    // إعدادات مفيدة
    isSlowConnection: connectionInfo.effectiveType === '2g' || connectionInfo.effectiveType === 'slow-2g',
    isSaveDataMode: connectionInfo.saveData,
    recommendedDelay: connectionInfo.effectiveType === '2g' ? 1000 : 300
  };
}

// هوك لمراقبة الأداء
export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState({
    mountTime: 0,
    updateCount: 0,
    lastUpdateTime: 0
  });

  useEffect(() => {
    const mountTime = performance.now();
    setMetrics(prev => ({ ...prev, mountTime }));

    return () => {
      const unmountTime = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} was mounted for ${(unmountTime - mountTime).toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      updateCount: prev.updateCount + 1,
      lastUpdateTime: performance.now()
    }));
  });

  return metrics;
}

// هوك لتحسين إعادة التقديم
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// هوك للتحميل الذكي
export function useSmartLoading<T>(
  loadFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: {
    delay?: number;
    retries?: number;
    fallback?: T;
  } = {}
) {
  const [data, setData] = useState<T | null>(options.fallback || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { recommendedDelay } = usePerformanceOptimization();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // تأخير ذكي حسب سرعة الاتصال
      const delay = options.delay || recommendedDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const result = await loadFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
      if (options.fallback) {
        setData(options.fallback);
      }
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, retry: load };
}
