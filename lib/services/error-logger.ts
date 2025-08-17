interface ErrorLogEntry {
  timestamp: Date;
  error: Error;
  metadata?: any;
  ignored: boolean;
  userActionable: boolean;
  url?: string;
  userAgent?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error, metadata?: any): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      error,
      metadata,
      ignored: metadata?.ignored || false,
      userActionable: metadata?.userActionable || false,
      url: metadata?.url,
      userAgent: metadata?.userAgent,
    };

    // إضافة للسجل المحلي
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // في بيئة التطوير فقط، اطبع الأخطاء غير المتجاهلة
    if (this.isDevelopment && !entry.ignored) {
      console.group(`🚨 خطأ ${entry.userActionable ? 'يحتاج تدخل' : 'تقني'}`);
      console.error('Error:', error.message);
      console.log('Metadata:', metadata);
      console.groupEnd();
    }

    // في الإنتاج، أرسل الأخطاء المهمة فقط
    if (!this.isDevelopment && !entry.ignored) {
      this.sendToMonitoring(entry);
    }

    // حفظ في localStorage للمراجعة اللاحقة
    try {
      const savedLogs = localStorage.getItem('sabq_error_logs');
      const existingLogs = savedLogs ? JSON.parse(savedLogs) : [];
      existingLogs.unshift({
        timestamp: entry.timestamp.toISOString(),
        message: error.message,
        stack: error.stack,
        metadata: entry.metadata,
        ignored: entry.ignored,
        userActionable: entry.userActionable,
      });
      
      // احتفظ بآخر 50 خطأ فقط
      if (existingLogs.length > 50) {
        existingLogs.length = 50;
      }
      
      localStorage.setItem('sabq_error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      // تجاهل أخطاء localStorage
    }
  }

  private sendToMonitoring(entry: ErrorLogEntry): void {
    // هنا يمكن إضافة إرسال للخدمات مثل Sentry, LogRocket, etc
    // مثال:
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(entry.error, {
        extra: entry.metadata,
        tags: {
          userActionable: entry.userActionable,
          url: entry.url,
        },
      });
    }
  }

  getRecentLogs(count = 10): ErrorLogEntry[] {
    return this.logs.slice(0, count);
  }

  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('sabq_error_logs');
    } catch (e) {
      // تجاهل
    }
  }

  downloadLogsReport(): void {
    const report = {
      generatedAt: new Date().toISOString(),
      totalErrors: this.logs.length,
      ignoredErrors: this.logs.filter(l => l.ignored).length,
      userActionableErrors: this.logs.filter(l => l.userActionable).length,
      logs: this.logs.map(log => ({
        timestamp: log.timestamp.toISOString(),
        message: log.error.message,
        stack: log.error.stack,
        metadata: log.metadata,
        ignored: log.ignored,
        userActionable: log.userActionable,
        url: log.url,
        userAgent: log.userAgent,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabq-error-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance functions
export const logError = (error: Error, metadata?: any) => 
  ErrorLogger.getInstance().logError(error, metadata);

export const getRecentErrors = (count?: number) => 
  ErrorLogger.getInstance().getRecentLogs(count);

export const clearErrorLogs = () => 
  ErrorLogger.getInstance().clearLogs();

export const downloadErrorReport = () => 
  ErrorLogger.getInstance().downloadLogsReport(); 