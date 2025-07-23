// خدمة مراقبة بسيطة لتسجيل الأخطاء والأحداث المهمة

interface ErrorLog {
  timestamp: string;
  environment: string;
  error: {
    message: string;
    stack?: string;
    code?: string;
    type?: string;
  };
  context: {
    url?: string;
    method?: string;
    userId?: string;
    userAgent?: string;
    ip?: string;
    [key: string]: any;
  };
}

class MonitoringService {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // حفظ آخر 100 خطأ في الذاكرة

  logError(error: Error | unknown, context: ErrorLog['context'] = {}) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      context
    };

    // حفظ في الذاكرة
    this.logs.unshift(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // طباعة في console
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Production Error:', {
        message: errorLog.error.message,
        timestamp: errorLog.timestamp,
        context: errorLog.context
      });
    } else {
      console.error('🚨 Error:', errorLog);
    }

    // يمكن هنا إرسال الخطأ إلى خدمة خارجية مثل Sentry
    this.sendToExternalService(errorLog);
  }

  private async sendToExternalService(errorLog: ErrorLog) {
    // مثال: إرسال إلى Sentry أو خدمة مراقبة أخرى
    if (process.env.SENTRY_DSN) {
      // Sentry integration
    }
    
    // أو إرسال إلى webhook
    if (process.env.ERROR_WEBHOOK_URL) {
      try {
        await fetch(process.env.ERROR_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorLog)
        });
      } catch {
        // تجاهل أخطاء الإرسال
      }
    }
  }

  getRecentErrors(count = 10): ErrorLog[] {
    return this.logs.slice(0, count);
  }

  clearLogs() {
    this.logs = [];
  }

  // دالة مساعدة لتسجيل أخطاء قاعدة البيانات
  logDatabaseError(error: Error | unknown, operation: string, table?: string) {
    this.logError(error, {
      type: 'database',
      operation,
      table,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  }

  // دالة مساعدة لتسجيل أخطاء API
  logApiError(error: Error | unknown, endpoint: string, method: string, statusCode?: number) {
    this.logError(error, {
      type: 'api',
      endpoint,
      method,
      statusCode
    });
  }
}

// singleton instance
export const monitoring = new MonitoringService();

// دالة مساعدة للاستخدام السريع
export function logError(error: Error | unknown, context?: ErrorLog['context']) {
  monitoring.logError(error, context);
}

// دالة مساعدة لأخطاء قاعدة البيانات
export function logDatabaseError(error: Error | unknown, operation: string, table?: string) {
  monitoring.logDatabaseError(error, operation, table);
}

// دالة مساعدة لأخطاء API
export function logApiError(error: Error | unknown, endpoint: string, method: string, statusCode?: number) {
  monitoring.logApiError(error, endpoint, method, statusCode);
} 