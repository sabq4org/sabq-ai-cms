'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug, Copy, CheckCircle, Wifi, WifiOff, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorDetector, ErrorDiagnostics } from '@/lib/diagnostics/ErrorDetector';
import { ErrorLogger } from '@/lib/diagnostics/ErrorLogger';
import { ErrorReporter } from '@/lib/diagnostics/ErrorReporter';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; diagnostics: ErrorDiagnostics }>;
  onError?: (error: Error, errorInfo: ErrorInfo, diagnostics: ErrorDiagnostics) => void;
  context?: string;
  enableAutoRecovery?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  diagnostics: ErrorDiagnostics | null;
  retryCount: number;
  isRecovering: boolean;
  recoveryProgress: number;
  logId: string | null;
  isOnline: boolean;
  lastErrorTime: number;
}

class SmartErrorBoundary extends Component<Props, State> {
  private errorDetector: ErrorDetector;
  private errorLogger: ErrorLogger;
  private errorReporter: ErrorReporter;
  private recoveryTimer?: NodeJS.Timeout;
  private progressTimer?: NodeJS.Timeout;
  private maxRetries: number;
  private retryDelay: number;

  constructor(props: Props) {
    super(props);
    
    this.errorDetector = ErrorDetector.getInstance();
    this.errorLogger = ErrorLogger.getInstance();
    this.errorReporter = ErrorReporter.getInstance();
    this.maxRetries = props.maxRetries || 3;
    this.retryDelay = props.retryDelay || 2000;

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      diagnostics: null,
      retryCount: 0,
      isRecovering: false,
      recoveryProgress: 0,
      logId: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تشخيص الخطأ
    const diagnostics = this.errorDetector.diagnoseError(error, {
      component: this.props.context || 'SmartErrorBoundary',
      errorInfo,
      retryCount: this.state.retryCount
    });

    // تسجيل الخطأ
    const logId = await this.errorLogger.logError(
      diagnostics,
      ['error_boundary', this.props.context || 'unknown'],
      { errorInfo, retryCount: this.state.retryCount }
    );

    // إرسال تقرير للمطورين
    const report = await this.errorReporter.createReport(diagnostics);
    await this.errorReporter.sendReport(report);

    // تحديث الحالة
    this.setState({
      errorInfo,
      diagnostics,
      logId
    });

    // استدعاء callback إذا كان موجوداً
    if (this.props.onError) {
      this.props.onError(error, errorInfo, diagnostics);
    }

    // محاولة الاسترداد التلقائي
    if (this.props.enableAutoRecovery !== false && this.canAutoRecover(diagnostics)) {
      this.attemptAutoRecovery();
    }
  }

  componentDidMount() {
    // مراقبة حالة الاتصال
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
    
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }

  private handleOnline = () => {
    this.setState({ isOnline: true });
    
    // إعادة المحاولة تلقائياً عند عودة الاتصال
    if (this.state.hasError && this.state.diagnostics?.errorType === 'network_error') {
      this.handleRetry();
    }
  };

  private handleOffline = () => {
    this.setState({ isOnline: false });
  };

  private canAutoRecover(diagnostics: ErrorDiagnostics): boolean {
    return (
      this.errorDetector.canQuickRecover(diagnostics) &&
      this.state.retryCount < this.maxRetries &&
      Date.now() - this.state.lastErrorTime > 1000 // تجنب الحلقات اللانهائية
    );
  }

  private attemptAutoRecovery = async () => {
    if (this.state.isRecovering) return;

    this.setState({ 
      isRecovering: true, 
      recoveryProgress: 0 
    });

    // تحديث شريط التقدم
    this.progressTimer = setInterval(() => {
      this.setState(prev => ({
        recoveryProgress: Math.min(prev.recoveryProgress + 10, 90)
      }));
    }, 200);

    try {
      // تنفيذ استراتيجية الاسترداد حسب نوع الخطأ
      await this.executeRecoveryStrategy();
      
      // إكمال شريط التقدم
      this.setState({ recoveryProgress: 100 });
      
      // انتظار قصير ثم إعادة المحاولة
      this.recoveryTimer = setTimeout(() => {
        this.handleRetry();
      }, 500);

    } catch (recoveryError) {
      console.error('فشل في الاسترداد التلقائي:', recoveryError);
      this.setState({ 
        isRecovering: false, 
        recoveryProgress: 0 
      });
    }

    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  };

  private async executeRecoveryStrategy(): Promise<void> {
    const { diagnostics } = this.state;
    if (!diagnostics) return;

    switch (diagnostics.errorType) {
      case 'chunk_loading':
        await this.recoverFromChunkError();
        break;
        
      case 'network_error':
        await this.recoverFromNetworkError();
        break;
        
      case 'api_failure':
        await this.recoverFromApiError();
        break;
        
      case 'ssr_hydration':
        await this.recoverFromHydrationError();
        break;
        
      default:
        await this.genericRecovery();
    }
  }

  private async recoverFromChunkError(): Promise<void> {
    // مسح service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // مسح الكاش
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // مسح localStorage للكاش
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('chunk') || key.includes('cache')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('فشل في مسح localStorage:', error);
    }
  }

  private async recoverFromNetworkError(): Promise<void> {
    // انتظار عودة الاتصال
    if (!navigator.onLine) {
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (navigator.onLine) {
            window.removeEventListener('online', checkConnection);
            resolve();
          }
        };
        window.addEventListener('online', checkConnection);
      });
    }

    // اختبار الاتصال
    try {
      await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
    } catch (error) {
      throw new Error('الخادم غير متاح');
    }
  }

  private async recoverFromApiError(): Promise<void> {
    // انتظار قصير قبل إعادة المحاولة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار API
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`API غير متاح: ${response.status}`);
      }
    } catch (error) {
      throw new Error('فشل في الاتصال بـ API');
    }
  }

  private async recoverFromHydrationError(): Promise<void> {
    // مسح البيانات المحفوظة التي قد تسبب عدم تطابق
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('فشل في مسح sessionStorage:', error);
    }
  }

  private async genericRecovery(): Promise<void> {
    // انتظار قصير للسماح للنظام بالاستقرار
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
  }

  private handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    const newRetryCount = this.state.retryCount + 1;

    // تحديث حالة المحاولة في السجل
    if (this.state.logId) {
      await this.errorLogger.updateErrorStatus(
        this.state.logId,
        false,
        newRetryCount
      );
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      diagnostics: null,
      retryCount: newRetryCount,
      isRecovering: false,
      recoveryProgress: 0,
      logId: null
    }));
  };

  private handleReset = async () => {
    // تحديث حالة الحل في السجل
    if (this.state.logId) {
      await this.errorLogger.updateErrorStatus(
        this.state.logId,
        true
      );
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      diagnostics: null,
      retryCount: 0,
      isRecovering: false,
      recoveryProgress: 0,
      logId: null
    });
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private copyErrorDetails = async () => {
    const { error, diagnostics, errorInfo } = this.state;
    
    const errorDetails = {
      خطأ: error?.message,
      النوع: diagnostics?.errorType,
      الخطورة: diagnostics?.severity,
      'قابل للاسترداد': diagnostics?.isRecoverable,
      'عدد المحاولات': this.state.retryCount,
      'معرف السجل': this.state.logId,
      التوقيت: new Date(diagnostics?.timestamp || Date.now()).toLocaleString('ar-SA'),
      الصفحة: diagnostics?.pageUrl,
      المتصفح: diagnostics?.userAgent,
      'تفاصيل المكون': errorInfo?.componentStack
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      
      // إظهار تأكيد النسخ
      const button = document.getElementById('copy-error-btn');
      if (button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '<svg class="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>تم النسخ';
        setTimeout(() => {
          button.innerHTML = originalContent;
        }, 2000);
      }
    } catch (err) {
      console.error('فشل في نسخ تفاصيل الخطأ:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, diagnostics, isRecovering, recoveryProgress, retryCount, isOnline } = this.state;

      // استخدام fallback مخصص إذا كان متوفراً
      if (this.props.fallback && diagnostics) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent 
          error={error!} 
          retry={this.handleRetry} 
          diagnostics={diagnostics}
        />;
      }

      const userMessage = diagnostics ? 
        this.errorDetector.getUserFriendlyMessage(diagnostics) : 
        'حدث خطأ غير متوقع في التطبيق';

      const canRetry = retryCount < this.maxRetries && diagnostics?.isRecoverable;
      const isNetworkError = diagnostics?.errorType === 'network_error';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            
            {/* حالة الاسترداد */}
            {isRecovering && (
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-pulse">
                    <RefreshCcw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                  جارٍ إصلاح المشكلة...
                </h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${recoveryProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  {recoveryProgress < 50 ? 'تشخيص المشكلة...' : 
                   recoveryProgress < 90 ? 'تطبيق الحل...' : 'إنهاء الإصلاح...'}
                </p>
              </div>
            )}

            {/* حالة الخطأ العادية */}
            {!isRecovering && (
              <>
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    عذراً، حدث خطأ
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {userMessage}
                  </p>

                  {/* مؤشر حالة الاتصال */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {isOnline ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">متصل</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">غير متصل</span>
                      </>
                    )}
                  </div>

                  {/* معلومات إضافية */}
                  {diagnostics && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center justify-center gap-4">
                        <span>النوع: {diagnostics.errorType}</span>
                        <span>المحاولة: {retryCount + 1}/{this.maxRetries + 1}</span>
                        {diagnostics.timestamp && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(diagnostics.timestamp).toLocaleTimeString('ar-SA')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="space-y-3">
                  {canRetry && (
                    <Button
                      onClick={this.handleRetry}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                      disabled={isNetworkError && !isOnline}
                    >
                      <RefreshCcw className="w-4 h-4" />
                      إعادة المحاولة ({this.maxRetries - retryCount} متبقية)
                    </Button>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={this.handleReset}
                      variant="outline"
                      className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      إعادة تعيين
                    </Button>
                    
                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      الرئيسية
                    </Button>
                  </div>

                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      id="copy-error-btn"
                      onClick={this.copyErrorDetails}
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      نسخ تفاصيل الخطأ
                    </Button>
                  )}
                </div>

                {/* الإجراءات المقترحة */}
                {diagnostics?.suggestedActions && diagnostics.suggestedActions.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      إجراءات مقترحة:
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {diagnostics.suggestedActions.slice(0, 3).map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* تفاصيل الخطأ للمطورين */}
                {process.env.NODE_ENV === 'development' && error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      تفاصيل الخطأ (للمطورين)
                    </summary>
                    <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs">
                      <div className="space-y-2">
                        <div><strong>الرسالة:</strong> {error.message}</div>
                        <div><strong>النوع:</strong> {error.name}</div>
                        {diagnostics && (
                          <>
                            <div><strong>التشخيص:</strong> {diagnostics.errorType}</div>
                            <div><strong>الخطورة:</strong> {diagnostics.severity}</div>
                            <div><strong>معرف السجل:</strong> {this.state.logId}</div>
                          </>
                        )}
                        {error.stack && (
                          <div>
                            <strong>Stack Trace:</strong>
                            <pre className="mt-1 text-xs overflow-auto max-h-32 bg-gray-200 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SmartErrorBoundary;