/**
 * نظام تسجيل الأخطاء المتقدم
 * يحفظ الأخطاء محلياً وعلى الخادم مع إدارة ذكية للتخزين
 */

import { ErrorDiagnostics } from './ErrorDetector';

export interface ErrorLogEntry {
  id: string;
  diagnostics: ErrorDiagnostics;
  attempts: number;
  resolved: boolean;
  resolvedAt?: number;
  tags: string[];
  metadata?: Record<string, any>;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private readonly MAX_LOCAL_LOGS = 100;
  private readonly STORAGE_KEY = 'sabq_error_logs';
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 30000; // 30 seconds
  
  private pendingLogs: ErrorLogEntry[] = [];
  private batchTimer?: NodeJS.Timeout;

  private constructor() {
    this.initializeLogger();
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * تسجيل خطأ جديد
   */
  public async logError(
    diagnostics: ErrorDiagnostics, 
    tags: string[] = [],
    metadata?: Record<string, any>
  ): Promise<string> {
    const logEntry: ErrorLogEntry = {
      id: this.generateLogId(),
      diagnostics,
      attempts: 0,
      resolved: false,
      tags: [...tags, diagnostics.errorType],
      metadata
    };

    // حفظ محلياً فوراً
    this.saveToLocalStorage(logEntry);

    // إضافة للدفعة المعلقة للإرسال للخادم
    this.addToBatch(logEntry);

    // تسجيل في console للتطوير
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 خطأ ${diagnostics.errorType}`);
      console.error('الرسالة:', diagnostics.errorMessage);
      console.error('النوع:', diagnostics.errorType);
      console.error('الخطورة:', diagnostics.severity);
      console.error('قابل للاسترداد:', diagnostics.isRecoverable);
      console.error('الإجراءات المقترحة:', diagnostics.suggestedActions);
      if (diagnostics.stackTrace) {
        console.error('Stack Trace:', diagnostics.stackTrace);
      }
      if (metadata) {
        console.error('البيانات الإضافية:', metadata);
      }
      console.groupEnd();
    }

    return logEntry.id;
  }

  /**
   * تحديث حالة الخطأ (تم الحل أو إعادة المحاولة)
   */
  public async updateErrorStatus(
    logId: string, 
    resolved: boolean, 
    attempts?: number
  ): Promise<void> {
    // تحديث في التخزين المحلي
    const logs = this.getLocalLogs();
    const logIndex = logs.findIndex(log => log.id === logId);
    
    if (logIndex !== -1) {
      logs[logIndex].resolved = resolved;
      logs[logIndex].resolvedAt = resolved ? Date.now() : undefined;
      if (attempts !== undefined) {
        logs[logIndex].attempts = attempts;
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    }

    // إرسال التحديث للخادم
    try {
      await fetch('/api/errors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId,
          resolved,
          attempts,
          resolvedAt: resolved ? Date.now() : undefined
        })
      });
    } catch (error) {
      console.warn('فشل في تحديث حالة الخطأ على الخادم:', error);
    }
  }

  /**
   * الحصول على الأخطاء المحفوظة محلياً
   */
  public getLocalLogs(): ErrorLogEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('فشل في قراءة سجلات الأخطاء:', error);
      return [];
    }
  }

  /**
   * الحصول على إحصائيات الأخطاء
   */
  public getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    resolved: number;
    unresolved: number;
    recentErrors: ErrorLogEntry[];
  } {
    const logs = this.getLocalLogs();
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const stats = {
      total: logs.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      resolved: 0,
      unresolved: 0,
      recentErrors: logs.filter(log => log.diagnostics.timestamp > oneHourAgo)
    };

    logs.forEach(log => {
      // إحصائيات حسب النوع
      const type = log.diagnostics.errorType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // إحصائيات حسب الخطورة
      const severity = log.diagnostics.severity;
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;

      // إحصائيات الحل
      if (log.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
    });

    return stats;
  }

  /**
   * مسح الأخطاء القديمة
   */
  public cleanupOldLogs(): void {
    const logs = this.getLocalLogs();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // الاحتفاظ بالأخطاء الحديثة أو غير المحلولة
    const filteredLogs = logs.filter(log => 
      log.diagnostics.timestamp > oneWeekAgo || !log.resolved
    );

    // الاحتفاظ بآخر MAX_LOCAL_LOGS فقط
    const finalLogs = filteredLogs.slice(-this.MAX_LOCAL_LOGS);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalLogs));
  }

  /**
   * تصدير سجلات الأخطاء
   */
  public exportLogs(): string {
    const logs = this.getLocalLogs();
    const stats = this.getErrorStats();
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats,
      logs: logs.map(log => ({
        ...log,
        diagnostics: {
          ...log.diagnostics,
          // إزالة البيانات الحساسة
          userId: log.diagnostics.userId ? '[REDACTED]' : undefined,
          userAgent: log.diagnostics.userAgent.substring(0, 50) + '...'
        }
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * تهيئة نظام التسجيل
   */
  private initializeLogger(): void {
    // تنظيف الأخطاء القديمة عند البدء
    this.cleanupOldLogs();

    // إعداد تنظيف دوري
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanupOldLogs();
      }, 60 * 60 * 1000); // كل ساعة
    }

    // إرسال الأخطاء المعلقة عند إغلاق الصفحة
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushBatch();
      });

      // إرسال الأخطاء المعلقة عند عودة الاتصال
      window.addEventListener('online', () => {
        this.flushBatch();
      });
    }
  }

  /**
   * حفظ الخطأ في التخزين المحلي
   */
  private saveToLocalStorage(logEntry: ErrorLogEntry): void {
    try {
      const logs = this.getLocalLogs();
      logs.push(logEntry);
      
      // الاحتفاظ بآخر MAX_LOCAL_LOGS فقط
      const trimmedLogs = logs.slice(-this.MAX_LOCAL_LOGS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.warn('فشل في حفظ الخطأ محلياً:', error);
    }
  }

  /**
   * إضافة الخطأ للدفعة المعلقة
   */
  private addToBatch(logEntry: ErrorLogEntry): void {
    this.pendingLogs.push(logEntry);

    // إرسال فوري للأخطاء الحرجة
    if (logEntry.diagnostics.severity === 'critical') {
      this.flushBatch();
      return;
    }

    // إرسال عند امتلاء الدفعة
    if (this.pendingLogs.length >= this.BATCH_SIZE) {
      this.flushBatch();
      return;
    }

    // إعداد مؤقت للإرسال
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushBatch();
      }, this.BATCH_TIMEOUT);
    }
  }

  /**
   * إرسال دفعة الأخطاء للخادم
   */
  private async flushBatch(): Promise<void> {
    if (this.pendingLogs.length === 0) return;

    const logsToSend = [...this.pendingLogs];
    this.pendingLogs = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    try {
      await fetch('/api/errors/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logsToSend })
      });
    } catch (error) {
      console.warn('فشل في إرسال دفعة الأخطاء:', error);
      // إعادة الأخطاء للدفعة المعلقة للمحاولة لاحقاً
      this.pendingLogs.unshift(...logsToSend);
    }
  }

  /**
   * توليد معرف فريد للخطأ
   */
  private generateLogId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}