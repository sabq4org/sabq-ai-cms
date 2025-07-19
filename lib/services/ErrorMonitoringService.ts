/**
 * خدمة مراقبة الأخطاء للمحررات
 */

export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    component: string;
    props?: any;
    state?: any;
    userAction?: string;
  };
  environment: {
    userAgent: string;
    url: string;
    viewport: { width: number; height: number } | null;
    connection?: string;
  };
  user?: {
    id: string;
    role: string;
    sessionId: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'webpack' | 'runtime' | 'network' | 'validation' | 'unknown';
  retryCount?: number;
  resolved?: boolean;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: ErrorReport[];
  topErrors: Array<{ message: string; count: number; lastOccurred: Date }>;
  errorTrends: Array<{ date: string; count: number }>;
}

class ErrorMonitoringService {
  private errors: ErrorReport[] = [];
  private maxErrors = 1000; // الحد الأقصى للأخطاء المحفوظة
  private listeners: Array<(error: ErrorReport) => void> = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // تحميل الأخطاء المحفوظة
    this.loadStoredErrors();

    // إعداد معالج الأخطاء العام
    this.setupGlobalErrorHandlers();

    // إعداد مراقبة الأداء
    this.setupPerformanceMonitoring();

    this.isInitialized = true;
  }

  private loadStoredErrors(): void {
    try {
      const storedErrors = localStorage.getItem('editor-errors');
      if (storedErrors) {
        const parsedErrors = JSON.parse(storedErrors);
        this.errors = parsedErrors.map((error: any) => ({
          ...error,
          timestamp: new Date(error.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load stored errors:', error);
    }
  }

  private saveErrors(): void {
    try {
      // الاحتفاظ بآخر 100 خطأ فقط في localStorage
      const errorsToSave = this.errors.slice(-100);
      localStorage.setItem('editor-errors', JSON.stringify(errorsToSave));
    } catch (error) {
      console.warn('Failed to save errors to localStorage:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // معالج الأخطاء العام
    window.addEventListener('error', (event) => {
      this.reportError(event.error || new Error(event.message), {
        component: 'Global',
        userAction: 'page_load'
      });
    });

    // معالج أخطاء Promise غير المعالجة
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          component: 'Promise',
          userAction: 'async_operation'
        }
      );
    });

    // معالج أخطاء الشبكة
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.reportError(
            new Error(`Network Error: ${response.status} ${response.statusText}`),
            {
              component: 'Network',
              userAction: 'api_call',
              props: { url: args[0], status: response.status }
            }
          );
        }
        return response;
      } catch (error) {
        this.reportError(error as Error, {
          component: 'Network',
          userAction: 'api_call',
          props: { url: args[0] }
        });
        throw error;
      }
    };
  }

  private setupPerformanceMonitoring(): void {
    // مراقبة أداء التحميل
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 5000) { // إذا استغرق التحميل أكثر من 5 ثوانٍ
            this.reportError(
              new Error(`Slow loading detected: ${entry.name}`),
              {
                component: 'Performance',
                userAction: 'page_load',
                props: { duration: entry.duration, entryType: entry.entryType }
              }
            );
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  public reportError(
    error: Error,
    context: Partial<ErrorReport['context']> = {},
    severity: ErrorReport['severity'] = 'medium'
  ): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: {
        component: 'Unknown',
        ...context
      },
      environment: this.getEnvironmentInfo(),
      user: this.getUserInfo(),
      severity,
      category: this.categorizeError(error),
      resolved: false
    };

    // إضافة الخطأ إلى القائمة
    this.errors.push(errorReport);

    // الحفاظ على الحد الأقصى للأخطاء
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // حفظ الأخطاء
    this.saveErrors();

    // إشعار المستمعين
    this.notifyListeners(errorReport);

    // تسجيل الخطأ في console
    console.error('Error reported:', errorReport);

    // إرسال إلى خدمة خارجية إذا كانت متوفرة
    this.sendToExternalService(errorReport);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEnvironmentInfo(): ErrorReport['environment'] {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    };
  }

  private getUserInfo(): ErrorReport['user'] | undefined {
    try {
      const userInfo = localStorage.getItem('user-info');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return {
          id: parsed.id || 'anonymous',
          role: parsed.role || 'user',
          sessionId: sessionStorage.getItem('session-id') || 'unknown'
        };
      }
    } catch (error) {
      console.warn('Failed to get user info:', error);
    }
    return undefined;
  }

  private categorizeError(error: Error): ErrorReport['category'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('webpack') || stack.includes('webpack')) {
      return 'webpack';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (stack.includes('runtime') || message.includes('runtime')) {
      return 'runtime';
    }

    return 'unknown';
  }

  private notifyListeners(error: ErrorReport): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  private async sendToExternalService(error: ErrorReport): Promise<void> {
    // إرسال إلى خدمة مراقبة خارجية (مثل Sentry)
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error)
        });
      } catch (err) {
        console.warn('Failed to send error to external service:', err);
      }
    }
  }

  public getErrorStats(): ErrorStats {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentErrors = this.errors.filter(error => error.timestamp > last24Hours);

    // تجميع الأخطاء حسب الفئة
    const errorsByCategory = this.errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // تجميع الأخطاء حسب الخطورة
    const errorsBySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // أكثر الأخطاء تكراراً
    const errorCounts = this.errors.reduce((acc, error) => {
      const key = error.error.message;
      if (!acc[key]) {
        acc[key] = { count: 0, lastOccurred: error.timestamp };
      }
      acc[key].count++;
      if (error.timestamp > acc[key].lastOccurred) {
        acc[key].lastOccurred = error.timestamp;
      }
      return acc;
    }, {} as Record<string, { count: number; lastOccurred: Date }>);

    const topErrors = Object.entries(errorCounts)
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // اتجاهات الأخطاء (آخر 7 أيام)
    const errorTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayErrors = this.errors.filter(
        error => error.timestamp >= dayStart && error.timestamp < dayEnd
      );

      errorTrends.push({
        date: date.toISOString().split('T')[0],
        count: dayErrors.length
      });
    }

    return {
      totalErrors: this.errors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: recentErrors.slice(-20), // آخر 20 خطأ
      topErrors,
      errorTrends
    };
  }

  public clearErrors(): void {
    this.errors = [];
    this.saveErrors();
  }

  public markErrorAsResolved(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      this.saveErrors();
    }
  }

  public addListener(listener: (error: ErrorReport) => void): () => void {
    this.listeners.push(listener);
    
    // إرجاع دالة لإزالة المستمع
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getRecentErrors(limit = 10): ErrorReport[] {
    return this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public getErrorsByCategory(category: ErrorReport['category']): ErrorReport[] {
    return this.errors.filter(error => error.category === category);
  }

  public getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(error => error.severity === severity);
  }
}

// إنشاء instance واحد للاستخدام العام
export const errorMonitoringService = new ErrorMonitoringService();

// تعريض الخدمة على window للاستخدام العام
if (typeof window !== 'undefined') {
  (window as any).errorMonitoring = errorMonitoringService;
}

export default ErrorMonitoringService;