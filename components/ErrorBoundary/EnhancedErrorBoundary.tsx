"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Bug, Home, RefreshCw } from "lucide-react";
import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

// React Error Boundary محسن لمعالجة أخطاء React #130
export class EnhancedErrorBoundary extends React.Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // تحديث الحالة للعرض التالي ليظهر واجهة الأخطاء
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تسجيل الخطأ
    console.error("🚨 Enhanced Error Boundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // معالجة خاصة لـ React Error #130
    if (this.isReactError130(error)) {
      console.error("🔧 Detected React Error #130 (Element type is invalid)");
      this.handleReactError130(error, errorInfo);
    }

    // استدعاء callback المخصص
    this.props.onError?.(error, errorInfo);

    // تقرير الخطأ للمراقبة
    this.reportError(error, errorInfo);
  }

  // فحص إذا كان خطأ React #130
  private isReactError130(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes("element type is invalid") ||
      errorMessage.includes("react error #130") ||
      errorMessage.includes("minified react error #130") ||
      error.stack?.includes("react.min.js") ||
      error.stack?.includes("createElement")
    );
  }

  // معالجة خاصة لـ React Error #130
  private handleReactError130(error: Error, errorInfo: ErrorInfo) {
    console.group("🔧 React Error #130 Diagnostic");
    console.log("Error Message:", error.message);
    console.log("Component Stack:", errorInfo.componentStack);
    console.log("Error Stack:", error.stack);

    // تحليل المكونات المحتملة المشكلة
    const componentStack = errorInfo.componentStack;
    const problemComponents = this.extractProblemComponents(componentStack);

    if (problemComponents.length > 0) {
      console.log("🎯 Potential Problem Components:", problemComponents);
    }

    console.groupEnd();
  }

  // استخراج المكونات المحتملة المشكلة
  private extractProblemComponents(componentStack: string): string[] {
    const lines = componentStack.split("\n");
    const components: string[] = [];

    lines.forEach((line) => {
      const match = line.match(/in (\w+)/);
      if (
        match &&
        match[1] &&
        !["div", "span", "p", "h1", "h2", "h3"].includes(match[1])
      ) {
        components.push(match[1]);
      }
    });

    return [...new Set(components)]; // إزالة التكرارات
  }

  // تقرير الخطأ للمراقبة
  private reportError(error: Error, errorInfo: ErrorInfo) {
    // يمكن إرسال التقرير لخدمة مراقبة الأخطاء
    if (typeof window !== "undefined") {
      // إرسال للمتصفح console للمطورين
      console.table({
        "Error ID": this.state.errorId,
        "Error Type": error.name,
        Message: error.message,
        Time: new Date().toISOString(),
        "User Agent": navigator.userAgent,
        URL: window.location.href,
      });
    }
  }

  // إعادة المحاولة
  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Retrying... (${this.retryCount}/${this.maxRetries})`);

      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      });
    } else {
      console.warn("❌ Maximum retry attempts reached");
    }
  };

  // إعادة تحميل الصفحة
  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // الذهاب للصفحة الرئيسية
  handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      // واجهة الخطأ المخصصة
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              حدث خطأ غير متوقع
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              نعتذر، حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
            </p>

            {/* معلومات الخطأ للمطورين */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center mb-2">
                  <Bug className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Developer Info:
                  </span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
                  {this.state.error.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة المحاولة ({this.maxRetries - this.retryCount} متبقية)
                </Button>
              )}

              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة تحميل الصفحة
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                الصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// React Hook للاستخدام مع Function Components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { throwError, resetError };
};

// Export default
export default EnhancedErrorBoundary;
