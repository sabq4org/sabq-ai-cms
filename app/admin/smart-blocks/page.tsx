/**
 * صفحة الكتل الذكية في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import SmartBlocksPage from '@/app/dashboard/smart-blocks/page';

export default function AdminSmartBlocksPage() {
  return (
    <DashboardLayout
      pageTitle="الكتل الذكية"
      pageDescription="إدارة وتخصيص الكتل الذكية للمحتوى التفاعلي"
    >
      <SmartBlocksPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'الكتل الذكية - لوحة الإدارة',
  description: 'إدارة وتخصيص الكتل الذكية للمحتوى التفاعلي'
};
