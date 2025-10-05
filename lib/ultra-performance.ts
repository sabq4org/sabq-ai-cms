// Ultra-High Performance Utilities for Cloudflare Edge
// 🚀 تحسينات الأداء الخارق

export class EdgePerformance {
  private static metrics: Map<string, number[]> = new Map();
  
  // قياس الأداء المتقدم
  static measure<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    return operation().then(
      (result) => {
        const duration = performance.now() - start;
        this.recordMetric(name, duration);
        
        if (duration > 100) {
          console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        } else {
          console.log(`⚡ Fast operation: ${name} completed in ${duration.toFixed(2)}ms`);
        }
        
        return result;
      },
      (error) => {
        const duration = performance.now() - start;
        this.recordMetric(name, duration);
        console.error(`❌ Failed operation: ${name} failed after ${duration.toFixed(2)}ms`);
        throw error;
      }
    );
  }
  
  private static recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(duration);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }
  
  // إحصائيات الأداء
  static getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    return { min, max, avg, median, p95, count: values.length };
  }
  
  // تقرير شامل للأداء
  static getPerformanceReport() {
    const report: Record<string, any> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      report[name] = this.getStats(name);
    }
    
    return report;
  }
}

// مدير الكاش المتقدم
export class SmartCache {
  private static memoryCache = new Map<string, { data: any; expires: number; hits: number }>();
  
  // كاش ذكي مع انتهاء صلاحية
  static set(key: string, data: any, ttlSeconds: number = 300) {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.memoryCache.set(key, { data, expires, hits: 0 });
  }
  
  static get<T = any>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    
    cached.hits++;
    return cached.data as T;
  }
  
  // إحصائيات الكاش
  static getCacheStats() {
    const stats = {
      totalKeys: this.memoryCache.size,
      totalHits: 0,
      expired: 0,
      active: 0
    };
    
    const now = Date.now();
    
    for (const [key, value] of this.memoryCache.entries()) {
      stats.totalHits += value.hits;
      
      if (now > value.expires) {
        stats.expired++;
      } else {
        stats.active++;
      }
    }
    
    return stats;
  }
  
  // تنظيف الكاش المنتهي الصلاحية
  static cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.memoryCache.entries()) {
      if (now > value.expires) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }
    
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    return cleaned;
  }
}

// تحسين الصور للأداء العالي
export class ImageOptimizer {
  static generateSrcSet(baseUrl: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]) {
    return widths
      .map(width => `${baseUrl}?w=${width}&q=80&f=webp ${width}w`)
      .join(', ');
  }
  
  static generateSizes(breakpoints: Record<string, string> = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    'default': '33vw'
  }) {
    const sizes = Object.entries(breakpoints);
    const mediaQueries = sizes.slice(0, -1).map(([media, size]) => `${media} ${size}`);
    const defaultSize = sizes[sizes.length - 1][1];
    
    return [...mediaQueries, defaultSize].join(', ');
  }
  
  // تحسين رابط الصورة لـ Cloudflare Images
  static optimizeImageUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  } = {}) {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.fit) params.set('fit', options.fit);
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }
}

// مدير الطلبات المتوازية
export class BatchProcessor {
  static async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    delayMs: number = 0
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchStart = performance.now();
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      const batchDuration = performance.now() - batchStart;
      
      console.log(`⚡ Batch ${Math.floor(i / batchSize) + 1} processed ${batch.length} items in ${batchDuration.toFixed(2)}ms`);
      
      results.push(...batchResults);
      
      // تأخير اختياري بين الدفعات
      if (delayMs > 0 && i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return results;
  }
}

// مراقب الأداء في الوقت الفعلي
export class PerformanceMonitor {
  private static observers: PerformanceObserver[] = [];
  
  static startMonitoring() {
    // مراقبة Navigation Timing
    if ('PerformanceObserver' in globalThis) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            console.log('🚀 Navigation Performance:', {
              TTFB: navEntry.responseStart - navEntry.requestStart,
              DOM: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              Load: navEntry.loadEventEnd - navEntry.loadEventStart,
              Total: navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
        }
      });
      
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    }
    
    // مراقبة LCP
    if ('PerformanceObserver' in globalThis) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        
        console.log(`⚡ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        // LCP not supported
      }
    }
  }
  
  static stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
  
  // قياس Core Web Vitals
  static measureCoreWebVitals() {
    return {
      // يمكن إضافة قياسات أخرى حسب الحاجة
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown'
    };
  }
}

// تحسين الشبكة
export class NetworkOptimizer {
  // Preload critical resources
  static preloadResource(href: string, as: string, crossOrigin?: string) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    
    document.head.appendChild(link);
  }
  
  // Prefetch next page
  static prefetchPage(href: string) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    document.head.appendChild(link);
  }
  
  // DNS prefetch للدومينات الخارجية
  static dnsPrefetch(hostname: string) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${hostname}`;
    
    document.head.appendChild(link);
  }
}

// أدوات تحليل الأداء
export class AnalyticsHelper {
  static trackPageView(page: string, loadTime?: number) {
    // Integration with analytics services
    console.log(`📊 Page view: ${page}${loadTime ? ` (${loadTime}ms)` : ''}`);
  }
  
  static trackEvent(name: string, properties?: Record<string, any>) {
    console.log(`📊 Event: ${name}`, properties);
  }
  
  static trackPerformance(metric: string, value: number, unit: string = 'ms') {
    console.log(`📊 Performance: ${metric} = ${value}${unit}`);
  }
}

// التحكم في الميزات (Feature Flags)
export class FeatureFlags {
  private static flags: Map<string, boolean> = new Map();
  
  static set(flag: string, enabled: boolean) {
    this.flags.set(flag, enabled);
  }
  
  static isEnabled(flag: string): boolean {
    return this.flags.get(flag) ?? false;
  }
  
  static toggle(flag: string): boolean {
    const current = this.isEnabled(flag);
    this.set(flag, !current);
    return !current;
  }
  
  static getAll(): Record<string, boolean> {
    return Object.fromEntries(this.flags.entries());
  }
}
