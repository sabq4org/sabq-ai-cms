'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * مكون Error Boundary شامل لحل مشاكل Runtime Errors
 * خاصة مشكلة Error: [object Event]
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // تحديث الحالة بحيث يتم عرض fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تسجيل الخطأ
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // استدعاء callback إذا كان موجوداً
    this.props.onError?.(error, errorInfo);
    
    // تحديث الحالة
    this.setState({ error, errorInfo });
    
    // إرسال الخطأ إلى خدمة مراقبة الأخطاء (اختياري)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // يمكن إضافة إرسال الخطأ إلى خدمة مثل Sentry هنا
      if (process.env.NODE_ENV === 'production') {
        // إرسال إلى API محلي لتسجيل الأخطاء
        fetch('/api/logs/error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
          })
        }).catch(() => {
          // تجاهل أخطاء إرسال السجل
        });
      }
    } catch (logError) {
      console.error('Error logging to service:', logError);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // عرض fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI افتراضي للأخطاء
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center animate-fade-in">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">حدث خطأ</h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                إعادة المحاولة
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-sm font-mono text-gray-700 break-all">
                  <strong>Error:</strong> {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-mono text-gray-600">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-mono text-gray-600">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook لمعالجة الأخطاء في Functional Components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

/**
 * Wrapper لمعالجة الأخطاء في async functions
 */
export function withErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  onError?: (error: Error) => void
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error in async function:', err);
      onError?.(err);
      return null;
    }
  };
}

/**
 * مكون لمعالجة أخطاء الأحداث
 */
export function EventErrorBoundary({ children }: { children: ReactNode }) {
  const handleEventError = React.useCallback((event: Event) => {
    console.error('Event error caught:', event);
    
    // منع انتشار الخطأ
    event.preventDefault();
    event.stopPropagation();
    
    // إظهار رسالة للمستخدم
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('حدث خطأ في معالجة الحدث. يرجى إعادة تحميل الصفحة.');
    }
  }, []);

  React.useEffect(() => {
    // إضافة معالج أخطاء عام للأحداث
    const originalOnError = window.onerror;
    const originalOnUnhandledRejection = window.onunhandledrejection;

    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error caught:', { message, source, lineno, colno, error });
      
      // استدعاء المعالج الأصلي
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      
      return false;
    };

    window.onunhandledrejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // منع الخطأ الافتراضي
      event.preventDefault();
      
      // استدعاء المعالج الأصلي
      if (originalOnUnhandledRejection) {
        originalOnUnhandledRejection(event);
      }
    };

    return () => {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
    };
  }, []);

  return <>{children}</>;
} 