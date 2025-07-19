'use client';

import React, { Component, ReactNode } from 'react';
import { logError } from '@/lib/services/error-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showUserErrors?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

// قائمة الأخطاء التي يجب تجاهلها
const IGNORED_ERRORS = [
  'Invalid src prop',
  'upstream image response failed',
  'The requested resource',
  'dangerouslyAllowSVG is disabled',
  'Failed to fetch',
  'NetworkError',
  'ChunkLoadError',
  'Loading chunk',
  'Hydration failed',
  'Text content does not match',
  'useAuth must be used within',
  'Cannot read properties of null',
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
];

// قائمة الأخطاء التي تحتاج تدخل المستخدم
const USER_ACTIONABLE_ERRORS = [
  'تم رفض الوصول',
  'انتهت صلاحية الجلسة',
  'حجم الملف كبير جداً',
  'نوع الملف غير مدعوم',
  'البيانات المطلوبة مفقودة',
  'تم تجاوز الحد المسموح',
];

export default class SmartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const errorString = error.toString();
    const errorMessage = error.message || '';
    
    // تحقق من نوع الخطأ
    const isIgnoredError = IGNORED_ERRORS.some(ignored => 
      errorString.includes(ignored) || errorMessage.includes(ignored)
    );
    
    const isUserActionable = USER_ACTIONABLE_ERRORS.some(actionable =>
      errorString.includes(actionable) || errorMessage.includes(actionable)
    );

    // سجل الخطأ بصمت
    logError(error, {
      ...errorInfo,
      ignored: isIgnoredError,
      userActionable: isUserActionable,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // إذا كان خطأ يجب تجاهله، امسح حالة الخطأ
    if (isIgnoredError && !this.props.showUserErrors) {
      this.setState({ hasError: false, error: null, errorInfo: null });
      return;
    }

    // إذا كان خطأ يحتاج تدخل المستخدم
    if (isUserActionable || this.props.showUserErrors) {
      this.setState({ hasError: true, error, errorInfo });
    } else {
      // خطأ عام - اعرض رسالة عامة فقط
      this.setState({ 
        hasError: true, 
        error: new Error('حدث خلل تقني، يرجى المحاولة لاحقاً'),
        errorInfo: null 
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md text-center">
            <div className="text-red-600 dark:text-red-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              عذراً، حدث خطأ
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {this.state.error?.message || 'حدث خلل تقني، يرجى المحاولة لاحقاً'}
            </p>
            <button
              onClick={this.handleReset}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              حاول مرة أخرى
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}