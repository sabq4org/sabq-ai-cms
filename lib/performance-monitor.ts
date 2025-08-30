// نظام مراقبة الأداء المتقدم
import React from "react";

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
  category: "api" | "component" | "database" | "cache" | "render" | "bundle" | "network";
  severity: "low" | "medium" | "high" | "critical";
}

interface AlertConfig {
  threshold: number; // بالملي ثانية
  callback?: (metric: PerformanceMetric) => void;
}

interface PerformanceBudget {
  category: string;
  budget: number; // في milliseconds أو bytes
  currentValue: number;
  exceeded: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: Map<string, AlertConfig> = new Map();
  private maxMetrics = 1000; // أقصى عدد للمقاييس المحفوظة
  private budgets: Map<string, number> = new Map();
  private resourceTimings: PerformanceResourceTiming[] = [];

  constructor() {
    this.initializeBudgets();
    this.initializeResourceMonitoring();
  }

  // تهيئة ميزانيات الأداء
  private initializeBudgets() {
    this.budgets.set("api", 2000); // 2 seconds for API calls
    this.budgets.set("database", 1000); // 1 second for DB queries
    this.budgets.set("component", 100); // 100ms for component renders
    this.budgets.set("bundle", 250000); // 250KB for bundle size
    this.budgets.set("network", 1500); // 1.5 seconds for network requests
  }

  // تهيئة مراقبة الموارد
  private initializeResourceMonitoring() {
    if (typeof window !== "undefined") {
      // Monitor resource loading
      window.addEventListener("load", () => {
        this.captureResourceTimings();
      });
    }
  }

  // التقاط timing الموارد
  private captureResourceTimings() {
    if (typeof window !== "undefined" && "performance" in window) {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      this.resourceTimings = resources;
      
      // Analyze resource performance
      this.analyzeResourcePerformance(resources);
    }
  }

  // تحليل أداء الموارد
  private analyzeResourcePerformance(resources: PerformanceResourceTiming[]) {
    resources.forEach(resource => {
      const duration = resource.responseEnd - resource.requestStart;
      const category = this.getResourceCategory(resource.name);
      
      this.recordMetric({
        name: `Resource: ${resource.name.split('/').pop()}`,
        duration,
        timestamp: Date.now(),
        category: "network",
        severity: this.getSeverity(duration, "network"),
        metadata: {
          type: category,
          transferSize: resource.transferSize || 0,
          url: resource.name
        }
      });
    });
  }

  // الحصول على فئة المورد
  private getResourceCategory(url: string): string {
    if (url.match(/\.(js)$/)) return "script";
    if (url.match(/\.(css)$/)) return "stylesheet";
    if (url.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/)) return "image";
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return "font";
    if (url.includes("/api/")) return "api";
    return "other";
  }

  // تحديد شدة المشكلة بناءً على الوقت
  private getSeverity(duration: number, category: string): "low" | "medium" | "high" | "critical" {
    const budget = this.budgets.get(category) || 1000;
    
    if (duration > budget * 2) return "critical";
    if (duration > budget * 1.5) return "high";
    if (duration > budget) return "medium";
    return "low";
  }

  // بدء قياس الأداء
  startMeasure(
    name: string,
    category: PerformanceMetric["category"] = "api",
    metadata?: Record<string, any>
  ) {
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
          category,
          severity: this.getSeverity(duration, category),
        };

        this.recordMetric(metric);
        return duration;
      },
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
      console.warn(
        `🐌 PERFORMANCE ALERT: ${metric.name} took ${metric.duration.toFixed(
          2
        )}ms (threshold: ${alert.threshold}ms)`
      );
      alert.callback?.(metric);
    }
  }

  // طباعة المقياس
  private logMetric(metric: PerformanceMetric) {
    const emoji = this.getEmojiForCategory(metric.category);
    const color =
      metric.duration > 1000 ? "🔴" : metric.duration > 500 ? "🟡" : "🟢";

    console.log(
      `${color} ${emoji} [${metric.category.toUpperCase()}] ${
        metric.name
      }: ${metric.duration.toFixed(2)}ms`,
      metric.metadata ? metric.metadata : ""
    );
  }

  // الحصول على emoji للفئة
  private getEmojiForCategory(category: PerformanceMetric["category"]): string {
    const emojis: Record<string, string> = {
      api: "🌐",
      component: "⚛️",
      database: "🗄️",
      cache: "⚡",
      render: "🎨",
      bundle: "📦",
      network: "🌍",
    };
    return emojis[category] || "📊";
  }

  // إضافة تنبيه
  addAlert(
    name: string,
    threshold: number,
    callback?: (metric: PerformanceMetric) => void
  ) {
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

    const filteredMetrics = this.metrics.filter(
      (m) => m.timestamp >= windowStart
    );

    if (filteredMetrics.length === 0) {
      return null;
    }

    const categories = this.groupByCategory(filteredMetrics);

    return {
      total: filteredMetrics.length,
      timeWindow: timeWindow ? `${timeWindow}ms` : "all",
      categories: Object.entries(categories).map(([category, metrics]) => ({
        category,
        count: metrics.length,
        avgDuration: this.average(metrics.map((m) => m.duration)),
        minDuration: Math.min(...metrics.map((m) => m.duration)),
        maxDuration: Math.max(...metrics.map((m) => m.duration)),
        slowest: metrics.sort((a, b) => b.duration - a.duration).slice(0, 3),
      })),
      slowest: filteredMetrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map((m) => ({
          name: m.name,
          duration: m.duration,
          category: m.category,
        })),
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
  // تحليل ميزانيات الأداء
  public getBudgetAnalysis(): PerformanceBudget[] {
    const categories = this.groupByCategory(this.metrics);
    
    return Array.from(this.budgets.entries()).map(([category, budget]) => {
      const categoryMetrics = categories[category] || [];
      const averageDuration = categoryMetrics.length > 0 
        ? this.average(categoryMetrics.map(m => m.duration))
        : 0;
      
      return {
        category,
        budget,
        currentValue: averageDuration,
        exceeded: averageDuration > budget
      };
    });
  }

  // إنشاء تقرير تحسين الأداء
  public generateOptimizationReport(): string {
    const budgets = this.getBudgetAnalysis();
    const exceededBudgets = budgets.filter(b => b.exceeded);
    
    const report = [
      '🚀 Performance Optimization Report',
      '===================================',
      '',
      `📊 Total Metrics: ${this.metrics.length}`,
      `⚠️  Budget Violations: ${exceededBudgets.length}`,
      '',
      '💰 Budget Analysis:',
      '==================='
    ];

    budgets.forEach(budget => {
      const status = budget.exceeded ? '❌' : '✅';
      const percentage = ((budget.currentValue / budget.budget) * 100).toFixed(1);
      report.push(
        `${status} ${budget.category.toUpperCase()}: ${budget.currentValue.toFixed(2)}ms / ${budget.budget}ms (${percentage}%)`
      );
    });

    if (exceededBudgets.length > 0) {
      report.push('', '🔧 Optimization Recommendations:', '===============================');
      
      exceededBudgets.forEach(budget => {
        const recommendations = this.getOptimizationRecommendations(budget.category);
        report.push(`\n${budget.category.toUpperCase()}:`);
        recommendations.forEach(rec => report.push(`  • ${rec}`));
      });
    }

    return report.join('\n');
  }

  // الحصول على توصيات التحسين
  private getOptimizationRecommendations(category: string): string[] {
    const recommendations: Record<string, string[]> = {
      api: [
        'Implement response caching with Redis',
        'Use API route caching with stale-while-revalidate',
        'Optimize database queries with proper indexing',
        'Consider API response compression'
      ],
      database: [
        'Add database indexes for frequently queried fields',
        'Implement connection pooling',
        'Use read replicas for read-heavy operations',
        'Consider query result caching'
      ],
      component: [
        'Use React.memo for expensive components',
        'Implement proper dependency arrays in useEffect',
        'Consider component lazy loading',
        'Optimize re-renders with useMemo and useCallback'
      ],
      render: [
        'Optimize images with next/image and Cloudinary',
        'Implement proper font loading strategies',
        'Use CSS-in-JS optimization',
        'Consider server-side rendering for critical content'
      ],
      bundle: [
        'Enable webpack bundle splitting',
        'Implement dynamic imports for code splitting',
        'Use tree shaking to eliminate dead code',
        'Consider micro-frontends for large applications'
      ],
      network: [
        'Enable HTTP/2 server push for critical resources',
        'Implement resource preloading and prefetching',
        'Use CDN for static assets',
        'Optimize payload sizes with compression'
      ]
    };

      return recommendations[category] || ['Review and optimize this category'];
  }

  // تصدير البيانات
  export() {
    return {
      metrics: this.metrics,
      alerts: Array.from(this.alerts.entries()),
      budgets: Array.from(this.budgets.entries()),
      budgetAnalysis: this.getBudgetAnalysis(),
      timestamp: new Date().toISOString(),
    };
  }

  // Core Web Vitals monitoring
  measureWebVitals() {
    if (typeof window === "undefined") return;

    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          entry.entryType === "paint" &&
          entry.name === "first-contentful-paint"
        ) {
          this.recordMetric({
            name: "First Contentful Paint",
            duration: entry.startTime,
            timestamp: Date.now(),
            category: "render",
            severity: this.getSeverity(entry.startTime, "render"),
          });
        }
      }
    });

    observer.observe({ entryTypes: ["paint"] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      this.recordMetric({
        name: "Largest Contentful Paint",
        duration: lastEntry.startTime,
        timestamp: Date.now(),
        category: "render",
        severity: this.getSeverity(lastEntry.startTime, "render"),
      });
    });

    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as any; // Type assertion for layout shift entries
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }

      this.recordMetric({
        name: "Cumulative Layout Shift",
        duration: clsValue * 1000, // تحويل إلى ملي ثانية للتوافق
        timestamp: Date.now(),
        category: "render",
        severity: clsValue > 0.25 ? "critical" : clsValue > 0.1 ? "high" : "low",
      });
    });

    clsObserver.observe({ entryTypes: ["layout-shift"] });
  }
}

// إنشاء instance واحدة
export const performanceMonitor = new PerformanceMonitor();

// إعداد التنبيهات الافتراضية
performanceMonitor.addAlert("Database Query", 1000); // 1 ثانية
performanceMonitor.addAlert("API Request", 2000); // 2 ثانية
performanceMonitor.addAlert("Component Render", 100); // 100 ملي ثانية
performanceMonitor.addAlert("Cache Operation", 50); // 50 ملي ثانية

// Utility functions
export const measureAsync = async <T>(
  name: string,
  category: PerformanceMetric["category"],
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
  category: PerformanceMetric["category"],
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
export const usePerformanceMeasure = (
  name: string,
  category: PerformanceMetric["category"] = "component"
) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const measure = React.useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      try {
        return await measureAsync(name, category, asyncFn);
      } finally {
        setIsLoading(false);
      }
    },
    [name, category]
  );

  return { measure, isLoading };
};

// Helper لقياس Network requests
export const measureNetworkRequest = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  return measureAsync(`Network: ${url}`, "api", () => fetch(url, options), {
    url,
    method: options?.method || "GET",
  });
};

// Helper لقياس Database queries
export const measureDatabaseQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  return measureAsync(`DB: ${queryName}`, "database", queryFn, metadata);
};

export default performanceMonitor;
