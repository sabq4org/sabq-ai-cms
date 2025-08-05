"use client";

import React, { useEffect, useState } from "react";

interface CriticalErrorBoundaryState {
  hasError: boolean;
  errorCount: number;
  lastError: Error | null;
}

/**
 * 🚨 Critical Error Boundary لمعالجة خطأ React #130
 * هذا المكون يعمل كـ last line of defense ضد أخطاء React الحرجة
 */
export class CriticalErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  CriticalErrorBoundaryState
> {
  private maxErrors = 3;
  private errorTimer: NodeJS.Timeout | null = null;

  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = {
      hasError: false,
      errorCount: 0,
      lastError: null,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<CriticalErrorBoundaryState> {
    console.warn("🚨 Critical Error Boundary triggered:", error.message);

    // معالجة خاصة لخطأ React #130
    if (error.message.includes("Minified React error #130")) {
      console.warn("🔧 React #130 detected in Critical Boundary");

      // محاولة التعافي التلقائي
      setTimeout(() => {
        try {
          window.dispatchEvent(new CustomEvent("react-critical-recovery"));
        } catch (e) {
          console.warn("Critical recovery dispatch failed:", e);
        }
      }, 50);
    }

    return {
      hasError: true,
      lastError: error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 Critical Error Details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState((prevState) => ({
      errorCount: prevState.errorCount + 1,
    }));

    // إذا كان الخطأ متكرر كثيراً، أعد تحميل الصفحة
    if (this.state.errorCount >= this.maxErrors) {
      console.error("💥 Too many critical errors, reloading page...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    // محاولة التعافي التلقائي بعد فترة
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }

    this.errorTimer = setTimeout(() => {
      console.log("🔄 Attempting automatic recovery...");
      this.setState({
        hasError: false,
        lastError: null,
      });
    }, 2000);
  }

  componentWillUnmount() {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }
  }

  handleManualRetry = () => {
    console.log("🔄 Manual retry triggered");
    this.setState({
      hasError: false,
      lastError: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // إذا كان هناك fallback مخصص، استخدمه
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback UI بسيط وآمن
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              حدث خطأ مؤقت
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              نعتذر عن الإزعاج. يتم العمل على إصلاح المشكلة تلقائياً.
            </p>
            <div className="space-y-2">
              <button
                onClick={this.handleManualRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إعادة تحميل الصفحة
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                الذهاب للصفحة الرئيسية
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              خطأ #{this.state.errorCount} - سيتم التعافي تلقائياً
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 🛠️ Hook لمراقبة أخطاء React #130
 */
export function useReact130Monitor() {
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const handleCriticalRecovery = () => {
      console.log("🔄 Critical recovery event received");
      setErrorCount((prev) => Math.max(0, prev - 1));
    };

    window.addEventListener("react-critical-recovery", handleCriticalRecovery);

    return () => {
      window.removeEventListener(
        "react-critical-recovery",
        handleCriticalRecovery
      );
    };
  }, []);

  useEffect(() => {
    // مراقب إضافي للكشف عن أخطاء React #130
    const originalError = console.error;

    console.error = function (...args) {
      const errorString = args[0] && args[0].toString ? args[0].toString() : "";

      if (errorString.includes("Minified React error #130")) {
        setErrorCount((prev) => prev + 1);
        console.warn(
          `🔧 React #130 detected via monitor (count: ${errorCount + 1})`
        );
      }

      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, [errorCount]);

  return { errorCount };
}

export default CriticalErrorBoundary;
