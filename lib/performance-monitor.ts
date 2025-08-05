// نظام مراقبة الأداء المتقدم

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
  category: 'api' | 'component' | 'database' | 'cache' | 'render';
}

interface AlertConfig {
  threshold: number; // بالملي ثانية
  callback?: (metric: PerformanceMetric) => void;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: Map<string, AlertConfig> = new Map();
  private maxMetrics = 1000; // أقصى عدد للمقاييس المحفوظة

  // بدء قياس الأداء
  startMeasure(name: string, category: PerformanceMetric['category'] = 'api', metadata?: Record<string, any>) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const metric: PerformanceMetric = {
          name,
          duration,
          timestamp: Date.now(),
          metadata,
          category
        };

        this.recordMetric(metric);
        return duration;
      }
    };
  }

  // تسجيل مقياس الأداء
  private recordMetric(metric: PerformanceMetric) {
    // إضافة المقياس
    this.metrics.push(metric);

    // تنظيف المقاييس القديمة
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // فحص التنبيهات
    this.checkAlerts(metric);

    // طباعة المقياس
    this.logMetric(metric);
  }

  // فحص التنبيهات
  private checkAlerts(metric: PerformanceMetric) {
    const alert = this.alerts.get(metric.name);
    if (alert && metric.duration > alert.threshold) {
      console.warn(`🐌 PERFORMANCE ALERT: ${metric.name} took ${metric.duration.toFixed(2)}ms (threshold: ${alert.threshold}ms)`);
      alert.callback?.(metric);
    }
  }

  // طباعة المقياس
  private logMetric(metric: PerformanceMetric) {
    const emoji = this.getEmojiForCategory(metric.category);
    const color = metric.duration > 1000 ? '🔴' : metric.duration > 500 ? '🟡' : '🟢';
    
    console.log(`${color} ${emoji} [${metric.category.toUpperCase()}] ${metric.name}: ${metric.duration.toFixed(2)}ms`, 
      metric.metadata ? metric.metadata : '');
  }

  // الحصول على emoji للفئة
  private getEmojiForCategory(category: PerformanceMetric['category']): string {
    const emojis = {
      api: '🌐',
      component: '⚛️',
      database: '🗄️',
      cache: '⚡',
      render: '🎨'
    };
    return emojis[category] || '📊';
  }

  // إضافة تنبيه
  addAlert(name: string, threshold: number, callback?: (metric: PerformanceMetric) => void) {
    this.alerts.set(name, { threshold, callback });
  }

  // إزالة تنبيه
  removeAlert(name: string) {
    this.alerts.delete(name);
  }

  // الحصول على إحصائيات الأداء
  getStats(timeWindow?: number) {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const filteredMetrics = this.metrics.filter(m => m.timestamp >= windowStart);
    
    if (filteredMetrics.length === 0) {
      return null;
    }

    const categories = this.groupByCategory(filteredMetrics);
    
    return {
      total: filteredMetrics.length,
      timeWindow: timeWindow ? `${timeWindow}ms` : 'all',
      categories: Object.entries(categories).map(([category, metrics]) => ({
        category,
        count: metrics.length,
        avgDuration: this.average(metrics.map(m => m.duration)),
        minDuration: Math.min(...metrics.map(m => m.duration)),
        maxDuration: Math.max(...metrics.map(m => m.duration)),
        slowest: metrics.sort((a, b) => b.duration - a.duration).slice(0, 3)
      })),
      slowest: filteredMetrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map(m => ({ name: m.name, duration: m.duration, category: m.category }))
    };
  }

  // تجميع حسب الفئة
  private groupByCategory(metrics: PerformanceMetric[]) {
    return metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);
  }

  // حساب المتوسط
  private average(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  // مسح المقاييس
  clear() {
    this.metrics = [];
  }

  // تصدير البيانات
  export() {
    return {
      metrics: this.metrics,
      alerts: Array.from(this.alerts.entries()),
      timestamp: new Date().toISOString()
    };
  }

  // Core Web Vitals monitoring
  measureWebVitals() {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          this.recordMetric({
            name: 'First Contentful Paint',
            duration: entry.startTime,
            timestamp: Date.now(),
            category: 'render'
          });
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.recordMetric({
        name: 'Largest Contentful Paint',
        duration: lastEntry.startTime,
        timestamp: Date.now(),
        category: 'render'
      });
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      this.recordMetric({
        name: 'Cumulative Layout Shift',
        duration: clsValue * 1000, // تحويل إلى ملي ثانية للتوافق
        timestamp: Date.now(),
        category: 'render'
      });
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}

// إنشاء instance واحدة
export const performanceMonitor = new PerformanceMonitor();

// إعداد التنبيهات الافتراضية
performanceMonitor.addAlert('Database Query', 1000); // 1 ثانية
performanceMonitor.addAlert('API Request', 2000); // 2 ثانية
performanceMonitor.addAlert('Component Render', 100); // 100 ملي ثانية
performanceMonitor.addAlert('Cache Operation', 50); // 50 ملي ثانية

// Utility functions
export const measureAsync = async <T>(
  name: string, 
  category: PerformanceMetric['category'],
  asyncFn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  const measure = performanceMonitor.startMeasure(name, category, metadata);
  try {
    const result = await asyncFn();
    return result;
  } finally {
    measure.end();
  }
};

export const measureSync = <T>(
  name: string,
  category: PerformanceMetric['category'],
  syncFn: () => T,
  metadata?: Record<string, any>
): T => {
  const measure = performanceMonitor.startMeasure(name, category, metadata);
  try {
    return syncFn();
  } finally {
    measure.end();
  }
};

// React Hook للقياس
export const usePerformanceMeasure = (name: string, category: PerformanceMetric['category'] = 'component') => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const measure = React.useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      return await measureAsync(name, category, asyncFn);
    } finally {
      setIsLoading(false);
    }
  }, [name, category]);

  return { measure, isLoading };
};

// Helper لقياس Network requests
export const measureNetworkRequest = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  return measureAsync(
    `Network: ${url}`,
    'api',
    () => fetch(url, options),
    { url, method: options?.method || 'GET' }
  );
};

// Helper لقياس Database queries
export const measureDatabaseQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  return measureAsync(
    `DB: ${queryName}`,
    'database',
    queryFn,
    metadata
  );
};

export default performanceMonitor;