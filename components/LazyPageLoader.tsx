'use client';

import React, { Suspense, lazy } from 'react';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface LazyPageLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  pageName: string;
}

const DefaultFallback = ({ pageName }: { pageName: string }) => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-800">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">جاري تحميل {pageName}...</p>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
        يرجى الانتظار قليلاً
      </div>
    </div>
  </div>
);

const LazyPageLoader: React.FC<LazyPageLoaderProps> = ({
  children,
  fallback,
  pageName
}) => {
  return (
    <EditorErrorBoundary context={`LazyPageLoader-${pageName}`}>
      <Suspense fallback={fallback || <DefaultFallback pageName={pageName} />}>
        {children}
      </Suspense>
    </EditorErrorBoundary>
  );
};

export default LazyPageLoader;