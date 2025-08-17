/**
 * نظام تشخيص الأخطاء المتقدم
 * يحدد نوع الخطأ تلقائياً ويقترح الحلول المناسبة
 */

export type ErrorType = 
  | 'chunk_loading'
  | 'ssr_hydration' 
  | 'api_failure'
  | 'component_error'
  | 'network_error'
  | 'memory_error'
  | 'permission_error'
  | 'unknown';

export interface ErrorDiagnostics {
  errorType: ErrorType;
  errorMessage: string;
  stackTrace?: string;
  userAgent: string;
  timestamp: number;
  pageUrl: string;
  userId?: string;
  sessionId: string;
  buildVersion?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRecoverable: boolean;
  suggestedActions: string[];
  context?: Record<string, any>;
}

export class ErrorDetector {
  private static instance: ErrorDetector;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): ErrorDetector {
    if (!ErrorDetector.instance) {
      ErrorDetector.instance = new ErrorDetector();
    }
    return ErrorDetector.instance;
  }

  /**
   * تشخيص الخطأ وتحديد نوعه
   */
  public diagnoseError(error: Error, context?: Record<string, any>): ErrorDiagnostics {
    const errorType = this.detectErrorType(error);
    const severity = this.calculateSeverity(errorType, error);
    const isRecoverable = this.isErrorRecoverable(errorType, error);
    const suggestedActions = this.getSuggestedActions(errorType, error);

    return {
      errorType,
      errorMessage: error.message,
      stackTrace: error.stack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      timestamp: Date.now(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      buildVersion: this.getBuildVersion(),
      severity,
      isRecoverable,
      suggestedActions,
      context
    };
  }

  /**
   * تحديد نوع الخطأ بناءً على رسالة الخطأ والسياق
   */
  private detectErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // أخطاء تحميل الـ chunks
    if (
      message.includes('loading chunk') ||
      message.includes('failed to fetch') ||
      message.includes('loading css chunk') ||
      message.includes('chunkloadingerror') ||
      stack.includes('__webpack_require__')
    ) {
      return 'chunk_loading';
    }

    // أخطاء SSR/Hydration
    if (
      message.includes('hydration') ||
      message.includes('server html') ||
      message.includes('client-side exception') ||
      message.includes('text content does not match') ||
      stack.includes('hydrate')
    ) {
      return 'ssr_hydration';
    }

    // أخطاء API
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('api') ||
      message.includes('xhr') ||
      message.includes('request failed') ||
      /\b(4\d{2}|5\d{2})\b/.test(message) // HTTP error codes
    ) {
      return 'api_failure';
    }

    // أخطاء الشبكة
    if (
      message.includes('network error') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('offline') ||
      message.includes('no internet')
    ) {
      return 'network_error';
    }

    // أخطاء الذاكرة
    if (
      message.includes('out of memory') ||
      message.includes('maximum call stack') ||
      message.includes('heap') ||
      stack.includes('rangeerror')
    ) {
      return 'memory_error';
    }

    // أخطاء الصلاحيات
    if (
      message.includes('permission') ||
      message.includes('access denied') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    ) {
      return 'permission_error';
    }

    // أخطاء المكونات
    if (
      stack.includes('react') ||
      stack.includes('component') ||
      message.includes('render') ||
      message.includes('props')
    ) {
      return 'component_error';
    }

    return 'unknown';
  }

  /**
   * حساب درجة خطورة الخطأ
   */
  private calculateSeverity(errorType: ErrorType, error: Error): ErrorDiagnostics['severity'] {
    switch (errorType) {
      case 'chunk_loading':
      case 'ssr_hydration':
        return 'critical'; // يمنع تحميل الصفحة

      case 'api_failure':
        return error.message.includes('5') ? 'high' : 'medium'; // 5xx vs 4xx

      case 'network_error':
        return 'high'; // يؤثر على الوظائف الأساسية

      case 'memory_error':
        return 'critical'; // قد يؤدي لتعطل التطبيق

      case 'permission_error':
        return 'medium'; // يمنع وظائف معينة

      case 'component_error':
        return 'medium'; // يؤثر على جزء من الواجهة

      default:
        return 'low';
    }
  }

  /**
   * تحديد إمكانية الاسترداد من الخطأ
   */
  private isErrorRecoverable(errorType: ErrorType, error: Error): boolean {
    switch (errorType) {
      case 'chunk_loading':
      case 'api_failure':
      case 'network_error':
        return true; // يمكن إعادة المحاولة

      case 'ssr_hydration':
        return true; // يمكن التبديل لـ CSR

      case 'component_error':
        return true; // يمكن استخدام مكون بديل

      case 'memory_error':
        return false; // يحتاج إعادة تحميل

      case 'permission_error':
        return false; // يحتاج تدخل المستخدم

      default:
        return false;
    }
  }

  /**
   * اقتراح الإجراءات المناسبة للخطأ
   */
  private getSuggestedActions(errorType: ErrorType, error: Error): string[] {
    switch (errorType) {
      case 'chunk_loading':
        return [
          'إعادة تحميل الصفحة',
          'مسح ذاكرة التخزين المؤقت',
          'التحقق من الاتصال بالإنترنت',
          'تحديث المتصفح'
        ];

      case 'ssr_hydration':
        return [
          'إعادة تحميل الصفحة',
          'تعطيل JavaScript مؤقتاً',
          'التبديل لوضع العميل فقط'
        ];

      case 'api_failure':
        return [
          'إعادة المحاولة',
          'التحقق من الاتصال',
          'استخدام البيانات المحفوظة',
          'الانتقال لوضع عدم الاتصال'
        ];

      case 'network_error':
        return [
          'التحقق من الاتصال بالإنترنت',
          'إعادة المحاولة لاحقاً',
          'استخدام البيانات المحفوظة محلياً'
        ];

      case 'memory_error':
        return [
          'إعادة تحميل الصفحة',
          'إغلاق علامات التبويب الأخرى',
          'إعادة تشغيل المتصفح'
        ];

      case 'component_error':
        return [
          'إعادة تحميل المكون',
          'استخدام الواجهة البديلة',
          'تحديث الصفحة'
        ];

      case 'permission_error':
        return [
          'تسجيل الدخول مرة أخرى',
          'التحقق من الصلاحيات',
          'الاتصال بالدعم الفني'
        ];

      default:
        return [
          'إعادة تحميل الصفحة',
          'التحقق من الاتصال',
          'الاتصال بالدعم الفني'
        ];
    }
  }

  /**
   * الحصول على معرف المستخدم الحالي
   */
  private getCurrentUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id || userData.user_id;
      }
    } catch (error) {
      console.warn('فشل في الحصول على معرف المستخدم:', error);
    }
    
    return undefined;
  }

  /**
   * الحصول على إصدار البناء
   */
  private getBuildVersion(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    try {
      const meta = document.querySelector('meta[name="build-version"]');
      return meta?.getAttribute('content') || undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * توليد معرف جلسة فريد
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * فحص إمكانية الاسترداد السريع
   */
  public canQuickRecover(diagnostics: ErrorDiagnostics): boolean {
    return (
      diagnostics.isRecoverable &&
      diagnostics.severity !== 'critical' &&
      ['chunk_loading', 'api_failure', 'network_error'].includes(diagnostics.errorType)
    );
  }

  /**
   * الحصول على رسالة خطأ مفهومة للمستخدم
   */
  public getUserFriendlyMessage(diagnostics: ErrorDiagnostics): string {
    switch (diagnostics.errorType) {
      case 'chunk_loading':
        return 'حدث خطأ في تحميل أجزاء من الصفحة. سنحاول إصلاح المشكلة تلقائياً.';
      
      case 'ssr_hydration':
        return 'حدث خطأ في عرض الصفحة. جارٍ إعادة التحميل...';
      
      case 'api_failure':
        return 'حدث خطأ في الاتصال بالخادم. جارٍ إعادة المحاولة...';
      
      case 'network_error':
        return 'يبدو أن هناك مشكلة في الاتصال بالإنترنت. يرجى التحقق من اتصالك.';
      
      case 'memory_error':
        return 'نفدت ذاكرة المتصفح. يرجى إعادة تحميل الصفحة.';
      
      case 'component_error':
        return 'حدث خطأ في عرض جزء من الصفحة. سنحاول استخدام واجهة بديلة.';
      
      case 'permission_error':
        return 'ليس لديك الصلاحية للوصول لهذا المحتوى. يرجى تسجيل الدخول مرة أخرى.';
      
      default:
        return 'حدث خطأ غير متوقع. سنحاول إصلاح المشكلة.';
    }
  }
}