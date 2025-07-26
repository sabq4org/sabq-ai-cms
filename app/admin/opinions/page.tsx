/**
 * صفحة مقالات الرأي في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import OpinionsPage from '@/app/dashboard/opinions/page';

export default function AdminOpinionsPage() {
  return (
    <DashboardLayout
      pageTitle="مقالات الرأي"
      pageDescription="إدارة مقالات الرأي والتحليلات"
    >
      <OpinionsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'مقالات الرأي - لوحة الإدارة',
  description: 'إدارة مقالات الرأي والتحليلات'
};
