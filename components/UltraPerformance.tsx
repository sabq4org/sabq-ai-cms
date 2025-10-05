'use client';

import { useEffect, useRef, memo, Suspense } from 'react';
import { EdgePerformance, SmartCache, PerformanceMonitor } from '@/lib/ultra-performance';

// مكون محسن للأداء العالي
export const UltraPerformanceProvider = memo(({ children }: { children: React.ReactNode }) => {
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // بدء مراقبة الأداء
    PerformanceMonitor.startMonitoring();
    
    // تنظيف الكاش كل 5 دقائق
    const cacheCleanup = setInterval(() => {
      SmartCache.cleanup();
    }, 5 * 60 * 1000);
    
    // تسجيل إحصائيات الأداء كل دقيقة
    const performanceLogging = setInterval(() => {
      const report = EdgePerformance.getPerformanceReport();
      const cacheStats = SmartCache.getCacheStats();
      
      console.log('📊 Performance Report:', report);
      console.log('🗄️ Cache Stats:', cacheStats);
    }, 60 * 1000);
    
    return () => {
      PerformanceMonitor.stopMonitoring();
      clearInterval(cacheCleanup);
      clearInterval(performanceLogging);
    };
  }, []);
  
  return <>{children}</>;
});

UltraPerformanceProvider.displayName = 'UltraPerformanceProvider';

// Hook للأداء المتقدم
export function useUltraPerformance() {
  const measureAsync = <T,>(name: string, operation: () => Promise<T>) => {
    return EdgePerformance.measure(name, operation);
  };
  
  const cache = {
    set: SmartCache.set,
    get: SmartCache.get,
    stats: SmartCache.getCacheStats
  };
  
  const getPerformanceStats = () => EdgePerformance.getPerformanceReport();
  
  return {
    measureAsync,
    cache,
    getPerformanceStats
  };
}

// مكون تحميل محسن للأداء
export const UltraFastLoader = memo(() => (
  <div className="flex items-center justify-center min-h-[200px] bg-gradient-to-r from-blue-50 to-indigo-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="w-6 h-6 border-2 border-indigo-300 rounded-full animate-ping absolute top-1 left-1"></div>
      </div>
      <div className="text-sm text-gray-600 font-medium">
        ⚡ تحميل فائق السرعة...
      </div>
    </div>
  </div>
));

UltraFastLoader.displayName = 'UltraFastLoader';

// مكون صورة محسنة للأداء العالي
interface UltraImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export const UltraImage = memo(({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: UltraImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (!imgRef.current || !('loading' in HTMLImageElement.prototype)) return;
    
    const img = imgRef.current;
    
    // تحسين lazy loading
    if (!priority) {
      img.loading = 'lazy';
    }
    
    // تتبع تحميل الصورة
    const handleLoad = () => {
      console.log('⚡ Image loaded:', src);
    };
    
    const handleError = () => {
      console.error('❌ Image failed to load:', src);
    };
    
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    
    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, priority]);
  
  // توليد srcset للاستجابة المثلى
  const generateSrcSet = () => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(w => `${src}?w=${w}&q=80&f=webp ${w}w`)
      .join(', ');
  };
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={`${src}?w=${width || 800}&q=80&f=webp`}
      srcSet={generateSrcSet()}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
});

UltraImage.displayName = 'UltraImage';

// مكون للتحميل المسبق للصفحات
export const PagePreloader = memo(({ href }: { href: string }) => {
  useEffect(() => {
    // التحميل المسبق للصفحة
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, [href]);
  
  return null;
});

PagePreloader.displayName = 'PagePreloader';

// مكون للتحليل المتقدم
export const PerformanceAnalytics = memo(() => {
  useEffect(() => {
    // قياس Core Web Vitals
    if ('PerformanceObserver' in window) {
      // قياس LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        
        // إرسال إلى خدمة التحليل
        // analytics.track('performance', { metric: 'LCP', value: lastEntry.startTime });
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.log('LCP observation not supported');
      }
      
      // قياس FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any; // Type assertion for FID entry
          const fidValue = fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : 0;
          console.log(`📊 FID: ${fidValue}ms`);
          
          // إرسال إلى خدمة التحليل
          // analytics.track('performance', { metric: 'FID', value: fidValue });
        }
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.log('FID observation not supported');
      }
      
      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);
  
  return null;
});

PerformanceAnalytics.displayName = 'PerformanceAnalytics';

// Wrapper للتحميل المتقدم
export function withUltraPerformance<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    displayName?: string;
    preload?: string[];
    cache?: boolean;
  } = {}
) {
  const WrappedComponent = memo((props: P) => {
    const { measureAsync } = useUltraPerformance();
    
    useEffect(() => {
      // تحميل مسبق للموارد
      if (options.preload) {
        options.preload.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource;
          document.head.appendChild(link);
        });
      }
    }, []);
    
    return (
      <Suspense fallback={<UltraFastLoader />}>
        <Component {...props} />
      </Suspense>
    );
  });
  
  WrappedComponent.displayName = options.displayName || `withUltraPerformance(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook للتحميل المتقدم للبيانات
export function useUltraFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleWhileRevalidate?: boolean;
  } = {}
) {
  const { cache, measureAsync } = useUltraPerformance();
  
  const fetchData = async (): Promise<T> => {
    // التحقق من الكاش أولاً
    const cached = cache.get<T>(key);
    if (cached) {
      console.log(`⚡ Cache hit for: ${key}`);
      return cached;
    }
    
    // جلب البيانات مع قياس الأداء
    const data = await measureAsync(`fetch-${key}`, fetcher);
    
    // حفظ في الكاش
    cache.set(key, data, options.ttl || 300);
    
    return data;
  };
  
  return { fetchData };
}
