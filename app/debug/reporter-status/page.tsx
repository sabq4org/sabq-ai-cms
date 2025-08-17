'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// تجنب SSR لهذه الصفحة لحل مشكلة window
const ReporterStatusPageClient = dynamic(() => import('./page-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">جاري تحميل أدوات التشخيص...</p>
      </div>
    </div>
  )
});

const ReporterStatusPage: React.FC = () => {
  return <ReporterStatusPageClient />;
};

export default ReporterStatusPage;