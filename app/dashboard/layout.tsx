'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      pageTitle="لوحة التحكم"
      pageDescription="إدارة منصة سبق الذكية"
    >
      {children}
    </DashboardLayout>
  );
}
