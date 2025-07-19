'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import SafeLoader from '@/components/SafeLoader';
import GlobalErrorBoundary from '@/components/ErrorBoundary/GlobalErrorBoundary';

// Dynamic import with loading state
const PageClient = dynamic(() => import('./page-client'), {
  loading: () => (
    <SafeLoader loading={true} loadingMessage="جاري تحميل الصفحة الرئيسية...">
      <div />
    </SafeLoader>
  ),
  ssr: false // تعطيل SSR مؤقتاً لتجنب مشاكل hydration
});

interface PageSafeProps {
  initialArticles?: any[];
  initialCategories?: any[];
  initialStats?: any;
}

export default function PageSafe({
  initialArticles = [],
  initialCategories = [],
  initialStats = null
}: PageSafeProps) {
  return (
    <GlobalErrorBoundary>
      <PageClient 
        initialArticles={initialArticles}
        initialCategories={initialCategories}
        initialStats={initialStats}
      />
    </GlobalErrorBoundary>
  );
} 