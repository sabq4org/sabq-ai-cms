'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
}

class EditorErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `editor-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // تسجيل الخطأ
    this.logError(error, errorInfo);
    
    // استدعاء callback إذا كان موجوداً
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      id: this.state.errorId,
      timestamp: new Date().toISOString(),
      context: this.props.context || 'Editor',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      environment: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        viewport: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight
        } : null
      },
      retryCount: this.state.retryCount
    };

    // تسجيل في console للتطوير
    console.error('🚨 Editor Error Boundary:', errorReport);

    // حفظ في localStorage للمراجعة اللاحقة
    try {
      const existingErrors = JSON.parse(localStorage.getItem('editor-errors') || '[]');
      existingErrors.push(errorReport);
      // الاحتفاظ بآخر 50 خطأ فقط
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }
      localStorage.setItem('editor-errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to save error to localStorage:', e);
    }

    // إرسال إلى خدمة المراقبة (إذا كانت متوفرة)
    if (typeof window !== 'undefined' && (window as any).errorMonitoring) {
      (window as any).errorMonitoring.reportError(
        this.state.error,
        {
          component: this.props.context || 'Editor',
          userAction: 'editor_operation',
          props: this.props
        },
        'high' // خطورة عالية لأخطاء المحرر
      );
    }

    // إظهار إشعار للمستخدم
    if (typeof window !== 'undefined' && (window as any).notificationService) {
      (window as any).notificationService.showEditorError(
        this.state.error,
        this.props.context || 'Editor',
        this.state.errorId
      );
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        errorId: ''
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: ''
    });
  };

  private copyErrorDetails = async () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      context: this.props.context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      // إظهار تأكيد النسخ
      const button = document.getElementById('copy-error-btn');
      if (button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>تم النسخ';
        setTimeout(() => {
          button.innerHTML = originalContent;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      // استخدام fallback مخصص إذا كان متوفراً
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      // واجهة الخطأ الافتراضية
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                حدث خطأ في المحرر
              </h2>
              <p className="text-red-600 dark:text-red-300 text-sm mb-4">
                عذراً، واجه المحرر مشكلة تقنية. يمكنك المحاولة مرة أخرى أو التبديل إلى محرر آخر.
              </p>
              
              {/* تفاصيل الخطأ للمطورين */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-100 dark:bg-red-900/40 p-3 rounded text-xs mb-4">
                  <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300 mb-2">
                    تفاصيل الخطأ (للمطورين)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>الخطأ:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>النوع:</strong> {this.state.error.name}
                    </div>
                    <div>
                      <strong>المعرف:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>المحاولات:</strong> {this.state.retryCount}/{this.maxRetries}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 text-xs overflow-auto max-h-32 bg-red-200 dark:bg-red-800 p-2 rounded">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.state.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة ({this.maxRetries - this.state.retryCount} متبقية)
                </Button>
              )}
              
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                إعادة تعيين المحرر
              </Button>

              {process.env.NODE_ENV === 'development' && (
                <Button
                  id="copy-error-btn"
                  onClick={this.copyErrorDetails}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                  نسخ تفاصيل الخطأ
                </Button>
              )}
            </div>

            {/* نصائح للمستخدم */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 نصائح:</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1">
                <li>• تأكد من حفظ عملك قبل إعادة المحاولة</li>
                <li>• جرب تحديث الصفحة إذا استمر الخطأ</li>
                <li>• تحقق من اتصال الإنترنت</li>
                <li>• امسح ذاكرة التخزين المؤقت للمتصفح</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EditorErrorBoundary;