// components/performance/PerformanceMonitor.tsx
'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiCalls: number;
  cacheHits: number;
  isSlowConnection: boolean;
}

export default function PerformanceMonitor({ 
  pageName = 'page',
  showWarnings = true 
}: { 
  pageName?: string;
  showWarnings?: boolean;
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // قياس الأداء عند تحميل الصفحة
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const now = performance.now();

      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      
      // تقدير سرعة الاتصال
      const connection = (navigator as any).connection;
      const isSlowConnection = connection ? 
        connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false;

      // حساب عدد API calls من network entries
      const resourceEntries = performance.getEntriesByType('resource');
      const apiCalls = resourceEntries.filter(entry => 
        entry.name.includes('/api/')
      ).length;

      // محاولة حساب cache hits من headers
      let cacheHits = 0;
      if (typeof window !== 'undefined' && window.performance) {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        cacheHits = entries.filter(entry => entry.transferSize === 0).length;
      }

      const newMetrics: PerformanceMetrics = {
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        apiCalls,
        cacheHits,
        isSlowConnection
      };

      setMetrics(newMetrics);

      // تحذيرات الأداء
      if (showWarnings && process.env.NODE_ENV === 'development') {
        if (loadTime > 3000) {
          console.warn(`🐌 ${pageName} بطيء: ${Math.round(loadTime)}ms`);
        }
        if (apiCalls > 10) {
          console.warn(`📡 عدد كبير من API calls: ${apiCalls}`);
        }
        if (cacheHits === 0 && apiCalls > 0) {
          console.warn(`💾 لا توجد cache hits - تحقق من التخزين المؤقت`);
        }
      }
    };

    // انتظار تحميل كامل ثم قياس
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [pageName, showWarnings]);

  // إظهار المقاييس في development mode فقط
  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  return (
    <>
      {/* زر إظهار/إخفاء المقاييس */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`
            px-3 py-2 rounded-lg text-xs font-mono shadow-lg border
            ${metrics.loadTime > 3000 ? 'bg-red-500 text-white border-red-600' : 
              metrics.loadTime > 1500 ? 'bg-yellow-500 text-black border-yellow-600' : 
              'bg-green-500 text-white border-green-600'}
            hover:opacity-80 transition-opacity
          `}
          title="Performance Monitor"
        >
          {Math.round(metrics.loadTime)}ms
        </button>
      </div>

      {/* لوحة المقاييس المفصلة */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
          <h4 className="font-bold mb-2 text-yellow-400">📊 Performance Metrics</h4>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Load Time:</span>
              <span className={metrics.loadTime > 3000 ? 'text-red-400' : 'text-green-400'}>
                {metrics.loadTime}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Render Time:</span>
              <span className={metrics.renderTime > 2000 ? 'text-red-400' : 'text-green-400'}>
                {metrics.renderTime}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>API Calls:</span>
              <span className={metrics.apiCalls > 10 ? 'text-red-400' : 'text-blue-400'}>
                {metrics.apiCalls}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Cache Hits:</span>
              <span className={metrics.cacheHits === 0 ? 'text-red-400' : 'text-green-400'}>
                {metrics.cacheHits}
              </span>
            </div>
            
            {metrics.isSlowConnection && (
              <div className="text-orange-400 mt-2 text-center">
                🐌 Slow Connection
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="mt-2 text-gray-400 hover:text-white text-right w-full"
          >
            ✕ إغلاق
          </button>
        </div>
      )}
    </>
  );
}
