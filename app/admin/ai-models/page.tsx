/**
 * صفحة نماذج الذكاء الاصطناعي في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import AIModelsPage from '@/app/dashboard/ai-models/page';

export default function AdminAIModelsPage() {
  return (
    <DashboardLayout
      pageTitle="نماذج الذكاء الاصطناعي"
      pageDescription="إدارة وتكوين نماذج الذكاء الاصطناعي"
    >
      <AIModelsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'نماذج الذكاء الاصطناعي - لوحة الإدارة',
  description: 'إدارة وتكوين نماذج الذكاء الاصطناعي'
};
