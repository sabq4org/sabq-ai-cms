'use client';

import React from 'react';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageName: string;
  showNotifications?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageName,
  showNotifications = true
}) => {
  return (
    <EditorErrorBoundary context={`DashboardLayout-${pageName}`}>
      <div className="relative min-h-screen">
        {/* محتوى الصفحة */}
        {children}
      </div>
    </EditorErrorBoundary>
  );
};

export default DashboardLayout;