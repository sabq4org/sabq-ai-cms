'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { handleReactError } from '@/lib/client-error-handler';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // استخدام المعالج الجديد
    handleReactError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // إرسال الخطأ للتتبع (يمكن إضافة خدمة مثل Sentry)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // يمكن إضافة خدمة تتبع الأخطاء هنا
    console.log('Logging error to service:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    const errorDetails = {
      message: this.state.error?.message || 'Unknown error',
      stack: this.state.error?.stack || '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // إرسال تقرير الخطأ
    console.log('Error report:', errorDetails);
    
    // يمكن إرسال التقرير لـ API
    try {
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorDetails)
      }).catch(console.error);
    } catch (e) {
      console.error('Failed to send error report:', e);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              {/* أيقونة الخطأ */}
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              {/* العنوان */}
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                حدث خطأ غير متوقع
              </h1>

              {/* الوصف */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                نأسف للإزعاج. حدث خطأ تقني أثناء تحميل هذه الصفحة.
              </p>

              {/* معلومات الخطأ (في بيئة التطوير فقط) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    تفاصيل الخطأ:
                  </h3>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRefresh}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة تحميل الصفحة
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  العودة للصفحة الرئيسية
                </button>

                <button
                  onClick={this.handleReportError}
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 px-4 transition-colors flex items-center justify-center gap-2"
                >
                  <Bug className="w-4 h-4" />
                  إبلاغ عن الخطأ
                </button>
              </div>

              {/* معلومات إضافية */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  إذا استمر الخطأ، يرجى الاتصال بالدعم التقني
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;