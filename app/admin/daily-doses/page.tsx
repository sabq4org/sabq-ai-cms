/**
 * صفحة الجرعات اليومية في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import DailyDosesPage from '@/app/dashboard/daily-doses/page';

export default function AdminDailyDosesPage() {
  return (
    <DashboardLayout
      pageTitle="الجرعات اليومية"
      pageDescription="إدارة المحتوى اليومي والجرعات الإخبارية"
    >
      <DailyDosesPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'الجرعات اليومية - لوحة الإدارة',
  description: 'إدارة المحتوى اليومي والجرعات الإخبارية'
};
