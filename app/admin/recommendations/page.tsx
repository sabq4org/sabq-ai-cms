/**
 * صفحة التوصيات الذكية في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import RecommendationsPage from '@/app/dashboard/recommendations/page';

export default function AdminRecommendationsPage() {
  return (
    <DashboardLayout
      pageTitle="التوصيات الذكية"
      pageDescription="نظام التوصيات المخصصة للمستخدمين"
    >
      <RecommendationsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'التوصيات الذكية - لوحة الإدارة',
  description: 'نظام التوصيات المخصصة للمستخدمين'
};
