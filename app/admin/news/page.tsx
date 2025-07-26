/**
 * صفحة إدارة الأخبار في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import NewsPage from '@/app/dashboard/news/page';

export default function AdminNewsPage() {
  return (
    <DashboardLayout
      pageTitle="إدارة الأخبار"
      pageDescription="إدارة ونشر الأخبار والمقالات"
    >
      <NewsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'إدارة الأخبار - لوحة الإدارة',
  description: 'إدارة ونشر الأخبار والمقالات'
};
