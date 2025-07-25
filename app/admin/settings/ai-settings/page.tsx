/**
 * صفحة إعدادات AI في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import AISettingsPage from '@/app/dashboard/settings/ai-settings/page';

export default function AdminAISettingsPage() {
  return (
    <DashboardLayout
      pageTitle="إعدادات الذكاء الاصطناعي"
      pageDescription="تكوين وإدارة إعدادات أنظمة الذكاء الاصطناعي"
    >
      <AISettingsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'إعدادات الذكاء الاصطناعي - لوحة الإدارة',
  description: 'تكوين وإدارة إعدادات أنظمة الذكاء الاصطناعي'
};
