"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function Skeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-slate-100 dark:bg-slate-800 rounded-md",
        animate && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

// مكونات Skeleton محددة لأجزاء مختلفة من التطبيق

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* صورة المقال */}
      <Skeleton className="w-full h-48 mb-4 rounded-lg" />

      {/* عنوان المقال */}
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-6 w-1/2 mb-3" />

      {/* مقتطف */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />

      {/* معلومات المقال */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function MuqtarabCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* صورة المقال */}
      <Skeleton className="w-full h-64 mb-4 rounded-lg" />

      {/* عنوان المقال */}
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-2/3 mb-3" />

      {/* مقتطف */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />

      {/* معلومات إضافية */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

export function AngleCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* أيقونة الزاوية */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* الوصف */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/3 mb-4" />

      {/* الإحصائيات */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <Skeleton className="h-6 w-8 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-8 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* زر العمل */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex gap-4">
        {/* صورة الخبر */}
        <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

        <div className="flex-1">
          {/* عنوان الخبر */}
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-2/3 mb-3" />

          {/* معلومات الخبر */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton للصفحة كاملة
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-8" />

          {/* إحصائيات */}
          <div className="flex justify-center items-center gap-8">
            <div className="text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton لحالات التحميل المختلفة
export const LoadingSkeletons = {
  // تحميل قائمة المقالات
  ArticleGrid: ({ count = 6 }: { count?: number }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  ),

  // تحميل قائمة الزوايا
  AngleGrid: ({ count = 4 }: { count?: number }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <AngleCardSkeleton key={i} />
      ))}
    </div>
  ),

  // تحميل قائمة الأخبار
  NewsList: ({ count = 5 }: { count?: number }) => (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  ),

  // تحميل مقترب
  MuqtarabGrid: ({ count = 8 }: { count?: number }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <MuqtarabCardSkeleton key={i} />
      ))}
    </div>
  ),
};
