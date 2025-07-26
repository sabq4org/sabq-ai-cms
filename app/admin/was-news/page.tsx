/**
 * صفحة أخبار واس في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import WasNewsPage from '@/app/dashboard/was-news/page';

export default function AdminWasNewsPage() {
  return (
    <DashboardLayout
      pageTitle="أخبار واس"
      pageDescription="إدارة أخبار وكالة الأنباء السعودية"
    >
      <WasNewsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'أخبار واس - لوحة الإدارة',
  description: 'إدارة أخبار وكالة الأنباء السعودية'
};
