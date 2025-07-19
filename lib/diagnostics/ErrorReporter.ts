/**
 * نظام إرسال تقارير الأخطاء للمطورين
 * يرسل تقارير مفصلة ويدير التنبيهات
 */

import { ErrorDiagnostics } from './ErrorDetector';
import { ErrorLogEntry } from './ErrorLogger';

export interface ErrorReport {
  id: string;
  timestamp: number;
  summary: string;
  details: ErrorDiagnostics;
  frequency: number;
  affectedUsers: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  environment: 'development' | 'staging' | 'production';
  browserInfo: BrowserInfo;
  systemInfo: SystemInfo;
  recommendations: string[];
}

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  cookiesEnabled: boolean;
  language: string;
  timezone: string;
}

export interface SystemInfo {
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  connectionType?: string;
  memoryInfo?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export class ErrorReporter {
  private static instance: ErrorReporter;
  private readonly REPORT_ENDPOINT = '/api/errors/report';
  private readonly ALERT_THRESHOLD = {
    critical: 1,    // تنبيه فوري للأخطاء الحرجة
    high: 3,        // تنبيه عند 3 أخطاء عالية الخطورة
    medium: 10,     // تنبيه عند 10 أخطاء متوسطة
    low: 50         // تنبيه عند 50 خطأ بسيط
  };

  private reportQueue: ErrorReport[] = [];
  private alertsSent: Set<string> = new Set();

  private constructor() {
    this.initializeReporter();
  }

  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  /**
   * إنشاء تقرير خطأ مفصل
   */
  public async createReport(
    diagnostics: ErrorDiagnostics,
    frequency: number = 1,
    affectedUsers: number = 1
  ): Promise<ErrorReport> {
    const report: ErrorReport = {
      id: this.generateReportId(),
      timestamp: Date.now(),
      summary: this.generateSummary(diagnostics),
      details: diagnostics,
      frequency,
      affectedUsers,
      impact: this.calculateImpact(diagnostics, frequency, affectedUsers),
      environment: this.getEnvironment(),
      browserInfo: this.getBrowserInfo(),
      systemInfo: this.getSystemInfo(),
      recommendations: this.generateRecommendations(diagnostics)
    };

    return report;
  }

  /**
   * إرسال تقرير للمطورين
   */
  public async sendReport(report: ErrorReport): Promise<boolean> {
    try {
      // إضافة للطابور أولاً
      this.reportQueue.push(report);

      // إرسال فوري للأخطاء الحرجة
      if (report.impact === 'critical') {
        await this.flushReports();
        await this.sendAlert(report);
        return true;
      }

      // إرسال دوري للأخطاء الأخرى
      this.scheduleReportFlush();
      
      // فحص إذا كان يحتاج تنبيه
      await this.checkAlertThreshold(report);

      return true;
    } catch (error) {
      console.error('فشل في إرسال تقرير الخطأ:', error);
      return false;
    }
  }

  /**
   * إرسال تقرير مجمع للأخطاء المتشابهة
   */
  public async sendBatchReport(
    diagnostics: ErrorDiagnostics,
    occurrences: ErrorLogEntry[]
  ): Promise<boolean> {
    const frequency = occurrences.length;
    const affectedUsers = new Set(
      occurrences
        .map(log => log.diagnostics.userId)
        .filter(Boolean)
    ).size || 1;

    const report = await this.createReport(diagnostics, frequency, affectedUsers);
    
    // إضافة معلومات إضافية عن التكرار
    report.details.context = {
      ...report.details.context,
      occurrences: occurrences.map(log => ({
        timestamp: log.diagnostics.timestamp,
        pageUrl: log.diagnostics.pageUrl,
        userId: log.diagnostics.userId,
        attempts: log.attempts,
        resolved: log.resolved
      }))
    };

    return await this.sendReport(report);
  }

  /**
   * إرسال تنبيه عاجل للمطورين
   */
  public async sendAlert(report: ErrorReport): Promise<void> {
    const alertKey = `${report.details.errorType}_${report.impact}`;
    
    // تجنب إرسال تنبيهات مكررة
    if (this.alertsSent.has(alertKey)) {
      return;
    }

    try {
      await fetch('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error_alert',
          severity: report.impact,
          title: `خطأ ${report.impact} في التطبيق`,
          message: report.summary,
          details: {
            errorType: report.details.errorType,
            frequency: report.frequency,
            affectedUsers: report.affectedUsers,
            pageUrl: report.details.pageUrl,
            userAgent: report.browserInfo.name + ' ' + report.browserInfo.version,
            recommendations: report.recommendations
          },
          timestamp: report.timestamp
        })
      });

      this.alertsSent.add(alertKey);
      
      // مسح التنبيهات المرسلة بعد ساعة
      setTimeout(() => {
        this.alertsSent.delete(alertKey);
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('فشل في إرسال التنبيه:', error);
    }
  }

  /**
   * الحصول على تقرير حالة النظام
   */
  public async getSystemHealthReport(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    errors: {
      total: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
      trends: Record<string, number>;
    };
    performance: {
      averageLoadTime: number;
      errorRate: number;
      recoveryRate: number;
    };
    recommendations: string[];
  }> {
    try {
      const response = await fetch('/api/system/health');
      return await response.json();
    } catch (error) {
      console.error('فشل في الحصول على تقرير حالة النظام:', error);
      return {
        status: 'warning',
        errors: { total: 0, byType: {}, bySeverity: {}, trends: {} },
        performance: { averageLoadTime: 0, errorRate: 0, recoveryRate: 0 },
        recommendations: ['فشل في الحصول على بيانات النظام']
      };
    }
  }

  /**
   * توليد ملخص للخطأ
   */
  private generateSummary(diagnostics: ErrorDiagnostics): string {
    const typeMap: Record<string, string> = {
      chunk_loading: 'فشل تحميل أجزاء JavaScript',
      ssr_hydration: 'خطأ في عملية Hydration',
      api_failure: 'فشل في استدعاء API',
      component_error: 'خطأ في مكون React',
      network_error: 'خطأ في الشبكة',
      memory_error: 'خطأ في الذاكرة',
      permission_error: 'خطأ في الصلاحيات',
      unknown: 'خطأ غير محدد'
    };

    const typeDescription = typeMap[diagnostics.errorType] || 'خطأ غير معروف';
    const severity = diagnostics.severity === 'critical' ? 'حرج' : 
                    diagnostics.severity === 'high' ? 'عالي' : 
                    diagnostics.severity === 'medium' ? 'متوسط' : 'منخفض';

    return `${typeDescription} (خطورة: ${severity}) - ${diagnostics.errorMessage}`;
  }

  /**
   * حساب تأثير الخطأ
   */
  private calculateImpact(
    diagnostics: ErrorDiagnostics,
    frequency: number,
    affectedUsers: number
  ): ErrorReport['impact'] {
    // الأخطاء الحرجة دائماً لها تأثير حرج
    if (diagnostics.severity === 'critical') {
      return 'critical';
    }

    // حساب التأثير بناءً على التكرار والمستخدمين المتأثرين
    const impactScore = (frequency * 0.3) + (affectedUsers * 0.7);

    if (impactScore >= 10 || diagnostics.severity === 'high') {
      return 'high';
    } else if (impactScore >= 5 || diagnostics.severity === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * الحصول على معلومات المتصفح
   */
  private getBrowserInfo(): BrowserInfo {
    if (typeof window === 'undefined') {
      return {
        name: 'Server',
        version: 'Unknown',
        engine: 'Node.js',
        platform: 'Server',
        mobile: false,
        cookiesEnabled: false,
        language: 'ar',
        timezone: 'Asia/Riyadh'
      };
    }

    const ua = navigator.userAgent;
    const browserInfo: BrowserInfo = {
      name: this.getBrowserName(ua),
      version: this.getBrowserVersion(ua),
      engine: this.getBrowserEngine(ua),
      platform: navigator.platform,
      mobile: /Mobile|Android|iPhone|iPad/.test(ua),
      cookiesEnabled: navigator.cookieEnabled,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    return browserInfo;
  }

  /**
   * الحصول على معلومات النظام
   */
  private getSystemInfo(): SystemInfo {
    if (typeof window === 'undefined') {
      return {
        screenResolution: 'Unknown',
        colorDepth: 24,
        pixelRatio: 1
      };
    }

    const systemInfo: SystemInfo = {
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    };

    // معلومات الاتصال (إذا كانت متوفرة)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      systemInfo.connectionType = connection?.effectiveType || connection?.type;
    }

    // معلومات الذاكرة (إذا كانت متوفرة)
    if ('memory' in performance) {
      systemInfo.memoryInfo = (performance as any).memory;
    }

    return systemInfo;
  }

  /**
   * توليد توصيات للإصلاح
   */
  private generateRecommendations(diagnostics: ErrorDiagnostics): string[] {
    const baseRecommendations = [...diagnostics.suggestedActions];
    
    // إضافة توصيات تقنية للمطورين
    switch (diagnostics.errorType) {
      case 'chunk_loading':
        baseRecommendations.push(
          'فحص إعدادات webpack للتأكد من صحة تقسيم الكود',
          'التحقق من إعدادات CDN وcaching headers',
          'مراجعة استراتيجية lazy loading للمكونات'
        );
        break;

      case 'ssr_hydration':
        baseRecommendations.push(
          'مراجعة التطابق بين server-side وclient-side rendering',
          'فحص استخدام useEffect وuseLayoutEffect',
          'التحقق من البيانات المرسلة من الخادم'
        );
        break;

      case 'api_failure':
        baseRecommendations.push(
          'مراجعة timeout settings لاستدعاءات API',
          'إضافة retry logic مع exponential backoff',
          'تحسين error handling في API endpoints'
        );
        break;

      case 'component_error':
        baseRecommendations.push(
          'إضافة Error Boundaries حول المكونات الحساسة',
          'مراجعة prop validation وTypeScript types',
          'فحص lifecycle methods واستخدام hooks'
        );
        break;
    }

    return baseRecommendations;
  }

  /**
   * فحص عتبة التنبيهات
   */
  private async checkAlertThreshold(report: ErrorReport): Promise<void> {
    const threshold = this.ALERT_THRESHOLD[report.impact];
    
    if (report.frequency >= threshold) {
      await this.sendAlert(report);
    }
  }

  /**
   * إرسال التقارير المتراكمة
   */
  private async flushReports(): Promise<void> {
    if (this.reportQueue.length === 0) return;

    const reportsToSend = [...this.reportQueue];
    this.reportQueue = [];

    try {
      await fetch(this.REPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: reportsToSend })
      });
    } catch (error) {
      console.error('فشل في إرسال التقارير:', error);
      // إعادة التقارير للطابور
      this.reportQueue.unshift(...reportsToSend);
    }
  }

  /**
   * جدولة إرسال التقارير
   */
  private scheduleReportFlush(): void {
    // إرسال كل 5 دقائق أو عند وجود 10 تقارير
    setTimeout(() => {
      if (this.reportQueue.length >= 10) {
        this.flushReports();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * تهيئة نظام التقارير
   */
  private initializeReporter(): void {
    // إرسال التقارير المعلقة عند إغلاق الصفحة
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushReports();
      });
    }
  }

  /**
   * مساعدات لتحديد معلومات المتصفح
   */
  private getBrowserName(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private getBrowserVersion(ua: string): string {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  private getBrowserEngine(ua: string): string {
    if (ua.includes('WebKit')) return 'WebKit';
    if (ua.includes('Gecko')) return 'Gecko';
    if (ua.includes('Trident')) return 'Trident';
    return 'Unknown';
  }

  private getEnvironment(): ErrorReport['environment'] {
    if (typeof window === 'undefined') return 'production';
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('dev')) {
      return 'staging';
    } else {
      return 'production';
    }
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}