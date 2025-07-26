'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout 
      pageTitle="نظام الذكاء الاصطناعي"
      pageDescription="إدارة الأنظمة الذكية والمحتوى"
    >
      {children}
    </DashboardLayout>
  );
}
