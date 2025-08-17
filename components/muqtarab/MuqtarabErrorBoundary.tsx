"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface MuqtarabErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface MuqtarabErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

/**
 * 🛡️ ErrorBoundary مخصص لصفحات مقترب
 * يتعامل مع أخطاء React #130 وأخطاء تحميل البيانات
 */
export class MuqtarabErrorBoundary extends React.Component<
  MuqtarabErrorBoundaryProps,
  MuqtarabErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: MuqtarabErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<MuqtarabErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 [MuqtarabErrorBoundary] خطأ في مقترب:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });

    // تسجيل الخطأ لأغراض التشخيص
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "muqtarab_last_error",
        JSON.stringify({
          error: error.message,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        })
      );
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      console.log(`🔄 محاولة إعادة التحميل ${this.state.retryCount + 1}/${this.maxRetries}`);
      
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = "/muqtarab";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              حدث خطأ في تحميل مقترب
            </h1>
            
            <p className="text-gray-600 mb-6">
              نعتذر، حدث خطأ أثناء تحميل محتوى مقترب. يرجى المحاولة مرة أخرى.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-right">
                <p className="text-sm text-red-800 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة ({this.maxRetries - this.state.retryCount} متبقية)
                </button>
              )}
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                العودة للرئيسية
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة تحميل الصفحة
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              محاولة رقم: {this.state.retryCount + 1}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 🎯 Wrapper بسيط للاستخدام
 */
export default function WithMuqtarabErrorBoundary({
  children,
  fallback,
}: MuqtarabErrorBoundaryProps) {
  return (
    <MuqtarabErrorBoundary fallback={fallback}>
      {children}
    </MuqtarabErrorBoundary>
  );
}
