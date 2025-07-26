/**
 * صفحة محرر AI في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import AIEditorPage from '@/app/dashboard/ai-editor/page';

export default function AdminAIEditorPage() {
  return (
    <DashboardLayout
      pageTitle="محرر AI"
      pageDescription="محرر المحتوى المدعوم بالذكاء الاصطناعي"
    >
      <AIEditorPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'محرر AI - لوحة الإدارة',
  description: 'محرر المحتوى المدعوم بالذكاء الاصطناعي'
};
