/**
 * صفحة البحث الذكي في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import IntelligentSearchPage from '@/app/dashboard/intelligent-search/page';

export default function AdminIntelligentSearchPage() {
  return (
    <DashboardLayout
      pageTitle="البحث الذكي"
      pageDescription="نظام البحث المتطور بالذكاء الاصطناعي"
    >
      <IntelligentSearchPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'البحث الذكي - لوحة الإدارة',
  description: 'نظام البحث المتطور بالذكاء الاصطناعي'
};
