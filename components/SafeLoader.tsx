'use client';

import React, { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface SafeLoaderProps {
  loading?: boolean | null;
  error?: string | null;
  children: ReactNode;
  loadingMessage?: string;
  errorFallback?: ReactNode;
  className?: string;
}

export default function SafeLoader({
  loading = false,
  error = null,
  children,
  loadingMessage = 'جاري التحميل...',
  errorFallback,
  className = ''
}: SafeLoaderProps) {
  // معالجة حالات null/undefined
  const isLoading = loading === true || loading === null || loading === undefined;
  const hasError = error !== null && error !== undefined && error !== '';

  // عرض حالة الخطأ
  if (hasError) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // عرض المحتوى
  return <>{children}</>;
}

// مكون للتعامل مع حالات التحميل في القوائم
export function SafeListLoader<T>({
  items,
  loading = false,
  error = null,
  renderItem,
  emptyMessage = 'لا توجد عناصر',
  loadingMessage = 'جاري التحميل...',
  className = ''
}: {
  items: T[] | null | undefined;
  loading?: boolean | null;
  error?: string | null;
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
}) {
  // معالجة حالات null/undefined
  const safeItems = items || [];
  const isLoading = loading === true;
  const hasError = error !== null && error !== undefined && error !== '';

  // عرض حالة الخطأ
  if (hasError) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // عرض حالة التحميل
  if (isLoading && safeItems.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // عرض رسالة الفراغ
  if (safeItems.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // عرض العناصر
  return (
    <div className={className}>
      {safeItems.map((item, index) => renderItem(item, index))}
    </div>
  );
} 