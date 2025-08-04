"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
  lastErrorTime: number;
}

class ReactErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // تحديث الحالة للإشارة إلى حدوث خطأ
    const errorId = `react_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تسجيل الخطأ
    console.error('🚨 React Error Boundary اعترض خطأ:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount
    });

    // حفظ في localStorage للتتبع
    try {
      const errorLog = {
        type: 'React Error Boundary',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        retryCount: this.state.retryCount
      };

      const existingLogs = JSON.parse(localStorage.getItem('sabq_react_errors') || '[]');
      existingLogs.push(errorLog);
      
      // الاحتفاظ بآخر 50 خطأ فقط
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('sabq_react_errors', JSON.stringify(existingLogs));
    } catch (logError) {
      console.warn('فشل في حفظ سجل الخطأ:', logError);
    }

    // استدعاء callback إذا وُجد
    this.props.onError?.(error, errorInfo);

    // تحديث الحالة
    this.setState({
      error,
      errorInfo
    });

    // محاولة الإصلاح التلقائي للأخطاء الشائعة
    this.attemptAutoRecovery(error);
  }

  private attemptAutoRecovery = (error: Error) => {
    const isInfiniteLoop = error.message.includes('Too many re-renders') || 
                          error.message.includes('Maximum update depth exceeded') ||
                          error.stack?.includes('react-dom') && error.message.includes('setState');

    if (isInfiniteLoop && this.state.retryCount < this.maxRetries) {
      console.log(`🔄 محاولة الإصلاح التلقائي (${this.state.retryCount + 1}/${this.maxRetries})...`);
      
      // تأخير قبل المحاولة مرة أخرى
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: prevState.retryCount + 1
        }));
      }, this.retryDelay * (this.state.retryCount + 1));
    }
  };

  private handleRetry = () => {
    console.log('🔄 إعادة المحاولة يدوياً...');
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    const errorReport = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: this.state.lastErrorTime,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // فتح نافذة جديدة لإرسال تقرير الخطأ
    const reportUrl = `/api/error-report?data=${encodeURIComponent(JSON.stringify(errorReport))}`;
    window.open(reportUrl, '_blank');
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // عرض fallback مخصص إذا وُجد
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // واجهة خطأ افتراضية
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            {/* أيقونة الخطأ */}
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            {/* العنوان */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              حدث خطأ غير متوقع
            </h1>

            {/* الوصف */}
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              نعتذر، حدث خطأ في التطبيق. نحن نعمل على إصلاح هذه المشكلة.
            </p>

            {/* معلومات الخطأ (في وضع التطوير فقط) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-left text-xs">
                <p className="font-mono text-red-600 dark:text-red-400 mb-2">
                  {this.state.error.message}
                </p>
                <details className="text-gray-600 dark:text-gray-300">
                  <summary className="cursor-pointer">تفاصيل الخطأ</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              <p>معرف الخطأ: {this.state.errorId}</p>
              <p>محاولات الإصلاح: {this.state.retryCount}/{this.maxRetries}</p>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-col space-y-2">
              {/* زر إعادة المحاولة */}
              <button
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= this.maxRetries}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.state.retryCount >= this.maxRetries ? 'تم استنفاد المحاولات' : 'إعادة المحاولة'}
              </button>

              {/* زر العودة للرئيسية */}
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                العودة للصفحة الرئيسية
              </button>

              {/* زر الإبلاغ عن الخطأ */}
              <button
                onClick={this.handleReportError}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Bug className="w-4 h-4 mr-2" />
                الإبلاغ عن الخطأ
              </button>
            </div>

            {/* نصائح للمستخدم */}
            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              <p>💡 جرب:</p>
              <ul className="text-right mt-1 space-y-1">
                <li>• تحديث الصفحة (F5)</li>
                <li>• مسح cache المتصفح</li>
                <li>• إعادة تشغيل المتصفح</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ReactErrorBoundary;