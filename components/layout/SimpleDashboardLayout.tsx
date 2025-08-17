'use client';

import React from 'react';

interface SimpleDashboardLayoutProps {
  children: React.ReactNode;
  pageName: string;
}

const SimpleDashboardLayout: React.FC<SimpleDashboardLayoutProps> = ({
  children,
  pageName
}) => {
  return (
    <div className="min-h-screen">
      {/* محتوى الصفحة */}
      {children}
    </div>
  );
};

export default SimpleDashboardLayout;