'use client';

import React, { Suspense } from 'react';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface SafePageLoaderProps {
  children: React.ReactNode;
  pageName: string;
  fallbackMessage?: string;
}

const PageLoadingSpinner = ({ message = 'جاري تحميل الصفحة...' }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-800">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    </div>
  </div>
);

const SafePageLoader: React.FC<SafePageLoaderProps> = ({
  children,
  pageName,
  fallbackMessage
}) => {
  return (
    <EditorErrorBoundary context={`SafePageLoader-${pageName}`}>
      <Suspense fallback={<PageLoadingSpinner message={fallbackMessage} />}>
        {children}
      </Suspense>
    </EditorErrorBoundary>
  );
};

export default SafePageLoader;