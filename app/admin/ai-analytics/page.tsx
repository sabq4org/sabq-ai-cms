/**
 * صفحة تحليلات AI في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import AIAnalyticsPage from '@/app/dashboard/ai-analytics/page';

export default function AdminAIAnalyticsPage() {
  return (
    <DashboardLayout
      pageTitle="تحليلات AI"
      pageDescription="تحليلات الأداء والاستخدام للذكاء الاصطناعي"
    >
      <AIAnalyticsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'تحليلات AI - لوحة الإدارة',
  description: 'تحليلات الأداء والاستخدام للذكاء الاصطناعي'
};
