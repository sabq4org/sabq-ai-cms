// أدوات تحسين الأداء للمحرر المتقدم

export interface PerformanceMetrics {
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  nodeCount: number;
  contentSize: number;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  logThreshold: number;
  maxContentSize: number;
  maxNodeCount: number;
  debounceDelay: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig;
  private startTime: number = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMetrics: true,
      logThreshold: 100, // ms
      maxContentSize: 1000000, // 1MB
      maxNodeCount: 10000,
      debounceDelay: 300,
      ...config
    };
  }

  // بدء قياس الأداء
  startMeasure(label: string): void {
    if (!this.config.enableMetrics) return;
    
    this.startTime = performance.now();
    performance.mark(`${label}-start`);
  }

  // انتهاء قياس الأداء
  endMeasure(label: string): number {
    if (!this.config.enableMetrics) return 0;
    
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    if (duration > this.config.logThreshold) {
      console.warn(`⚠️ عملية بطيئة: ${label} استغرقت ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  // قياس استخدام الذاكرة
  measureMemory(): number {
    if (!('memory' in performance)) return 0;
    
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize;
  }

  // تحليل محتوى المحرر
  analyzeContent(content: string): {
    size: number;
    complexity: number;
    warnings: string[];
  } {
    const size = new Blob([content]).size;
    const warnings: string[] = [];
    
    // تحليل التعقيد
    const nodeCount = (content.match(/<[^>]+>/g) || []).length;
    const complexity = nodeCount / 100; // نسبة تقريبية
    
    // تحذيرات الأداء
    if (size > this.config.maxContentSize) {
      warnings.push(`حجم المحتوى كبير: ${(size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    if (nodeCount > this.config.maxNodeCount) {
      warnings.push(`عدد العقد كبير: ${nodeCount}`);
    }
    
    // تحليل العناصر المعقدة
    const complexElements = [
      { pattern: /<table/gi, name: 'الجداول' },
      { pattern: /<img/gi, name: 'الصور' },
      { pattern: /<iframe/gi, name: 'الإطارات المضمنة' },
      { pattern: /<video/gi, name: 'الفيديوهات' },
    ];
    
    complexElements.forEach(element => {
      const count = (content.match(element.pattern) || []).length;
      if (count > 10) {
        warnings.push(`عدد كبير من ${element.name}: ${count}`);
      }
    });
    
    return { size, complexity, warnings };
  }

  // تحسين المحتوى
  optimizeContent(content: string): string {
    let optimized = content;
    
    // إزالة المسافات الزائدة
    optimized = optimized.replace(/\s+/g, ' ');
    
    // إزالة العلامات الفارغة
    optimized = optimized.replace(/<(\w+)(\s[^>]*)?\s*><\/\1>/g, '');
    
    // تحسين الصور
    optimized = optimized.replace(
      /<img([^>]*?)>/g,
      (match, attrs) => {
        if (!attrs.includes('loading=')) {
          return match.replace('>', ' loading="lazy">');
        }
        return match;
      }
    );
    
    // تحسين الروابط الخارجية
    optimized = optimized.replace(
      /<a([^>]*?)href="(https?:\/\/[^"]*)"([^>]*?)>/g,
      (match, before, href, after) => {
        if (!after.includes('rel=')) {
          return `<a${before}href="${href}"${after} rel="noopener noreferrer">`;
        }
        return match;
      }
    );
    
    return optimized;
  }

  // إحصائيات الأداء
  getPerformanceStats(): {
    averageRenderTime: number;
    averageUpdateTime: number;
    averageMemoryUsage: number;
    totalMeasurements: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageRenderTime: 0,
        averageUpdateTime: 0,
        averageMemoryUsage: 0,
        totalMeasurements: 0
      };
    }
    
    const totals = this.metrics.reduce(
      (acc, metric) => ({
        renderTime: acc.renderTime + metric.renderTime,
        updateTime: acc.updateTime + metric.updateTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage
      }),
      { renderTime: 0, updateTime: 0, memoryUsage: 0 }
    );
    
    const count = this.metrics.length;
    
    return {
      averageRenderTime: totals.renderTime / count,
      averageUpdateTime: totals.updateTime / count,
      averageMemoryUsage: totals.memoryUsage / count,
      totalMeasurements: count
    };
  }

  // مسح الإحصائيات
  clearMetrics(): void {
    this.metrics = [];
    performance.clearMarks();
    performance.clearMeasures();
  }

  // تصدير التقرير
  exportReport(): string {
    const stats = this.getPerformanceStats();
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      stats,
      metrics: this.metrics
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// دالة debounce لتحسين الأداء
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// دالة throttle لتحديد معدل التنفيذ
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// مراقب الذاكرة
export class MemoryMonitor {
  private interval: NodeJS.Timeout | null = null;
  private callbacks: ((usage: number) => void)[] = [];
  
  start(intervalMs: number = 5000): void {
    if (this.interval) return;
    
    this.interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize;
        
        this.callbacks.forEach(callback => callback(usage));
        
        // تحذير عند استخدام ذاكرة عالي
        if (usage > 100 * 1024 * 1024) { // 100MB
          console.warn(`⚠️ استخدام ذاكرة عالي: ${(usage / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    }, intervalMs);
  }
  
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  onMemoryChange(callback: (usage: number) => void): void {
    this.callbacks.push(callback);
  }
  
  removeCallback(callback: (usage: number) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
}

// أدوات تحليل DOM
export class DOMAnalyzer {
  static analyzeComplexity(element: HTMLElement): {
    nodeCount: number;
    depth: number;
    complexity: number;
  } {
    const nodeCount = element.querySelectorAll('*').length;
    const depth = this.getMaxDepth(element);
    const complexity = (nodeCount * 0.1) + (depth * 0.5);
    
    return { nodeCount, depth, complexity };
  }
  
  private static getMaxDepth(element: HTMLElement): number {
    let maxDepth = 0;
    
    function traverse(node: HTMLElement, currentDepth: number): void {
      maxDepth = Math.max(maxDepth, currentDepth);
      
      for (const child of Array.from(node.children)) {
        if (child instanceof HTMLElement) {
          traverse(child, currentDepth + 1);
        }
      }
    }
    
    traverse(element, 0);
    return maxDepth;
  }
  
  static findPerformanceBottlenecks(element: HTMLElement): string[] {
    const issues: string[] = [];
    
    // فحص الصور بدون lazy loading
    const images = element.querySelectorAll('img:not([loading])');
    if (images.length > 0) {
      issues.push(`${images.length} صورة بدون lazy loading`);
    }
    
    // فحص الجداول الكبيرة
    const largeTables = element.querySelectorAll('table');
    largeTables.forEach(table => {
      const rows = table.querySelectorAll('tr').length;
      if (rows > 100) {
        issues.push(`جدول كبير مع ${rows} صف`);
      }
    });
    
    // فحص العناصر المضمنة
    const iframes = element.querySelectorAll('iframe');
    if (iframes.length > 5) {
      issues.push(`عدد كبير من الإطارات المضمنة: ${iframes.length}`);
    }
    
    return issues;
  }
}

// مصنع مراقب الأداء
export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

// مصنع مراقب الذاكرة
export function createMemoryMonitor(): MemoryMonitor {
  return new MemoryMonitor();
}

// تصدير الثوابت
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: 16, // 60fps
  UPDATE_TIME: 100,
  MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
  CONTENT_SIZE: 1024 * 1024, // 1MB
  NODE_COUNT: 1000
} as const;

export const OPTIMIZATION_TIPS = [
  'استخدم lazy loading للصور',
  'قلل من عدد العناصر المضمنة',
  'تجنب الجداول الكبيرة جداً',
  'استخدم التنسيق البسيط عند الإمكان',
  'احذف المحتوى غير المستخدم',
  'استخدم الضغط للصور الكبيرة'
] as const;

