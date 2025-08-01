'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout 
      pageTitle="لوحة الإدارة"
      pageDescription="إدارة منصة سبق الذكية"
    >
      {children}
    </DashboardLayout>
  );
}
