"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * مكون ErrorBoundary لإدارة أخطاء التطبيق في React
 * يمنع انهيار التطبيق بالكامل عند حدوث خطأ في مكون فرعي
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // تحديث الحالة عند حدوث خطأ
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // سجل الخطأ واستدع معالج الخطأ المخصص إذا كان موجودًا
    console.error("🔴 خطأ في مكون React:", error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // إذا كان هناك خطأ، قم بعرض واجهة الخطأ المخصصة
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // واجهة خطأ افتراضية
      return (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex flex-col items-center text-center p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500 dark:text-red-400 mb-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3 className="text-base font-medium text-red-800 dark:text-red-300">
              حدث خطأ غير متوقع
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
              نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو المحاولة لاحقًا.
            </p>
          </div>
        </div>
      );
    }

    // إرجاع المكونات الفرعية إذا لم يكن هناك خطأ
    return this.props.children;
  }
}

export default ErrorBoundary;
