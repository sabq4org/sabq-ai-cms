// نظام مراقبة الأداء
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // بدء قياس الوقت
  startTimer(label: string): () => number {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      
      // تسجيل تحذير إذا تجاوز الوقت حد معين
      if (duration > 1000) {
        console.warn(`⚠️ بطء في الأداء: ${label} استغرق ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    };
  }

  // تسجيل قياس
  private recordMetric(label: string, duration: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const metrics = this.metrics.get(label)!;
    metrics.push(duration);
    
    // الاحتفاظ بآخر 100 قياس فقط
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // الحصول على إحصائيات
  getStats(label: string) {
    const metrics = this.metrics.get(label);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const sorted = [...metrics].sort((a, b) => a - b);
    const sum = metrics.reduce((a, b) => a + b, 0);
    
    return {
      count: metrics.length,
      avg: sum / metrics.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  // طباعة تقرير الأداء
  printReport() {
    console.log('\n📊 تقرير الأداء:');
    console.log('================');
    
    for (const [label, metrics] of this.metrics.entries()) {
      const stats = this.getStats(label);
      if (stats) {
        console.log(`\n${label}:`);
        console.log(`  - العدد: ${stats.count}`);
        console.log(`  - المتوسط: ${stats.avg.toFixed(2)}ms`);
        console.log(`  - الأدنى: ${stats.min.toFixed(2)}ms`);
        console.log(`  - الأعلى: ${stats.max.toFixed(2)}ms`);
        console.log(`  - P95: ${stats.p95.toFixed(2)}ms`);
      }
    }
  }
}

export const perfMonitor = PerformanceMonitor.getInstance(); 