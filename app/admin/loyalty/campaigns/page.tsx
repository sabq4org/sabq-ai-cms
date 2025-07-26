/**
 * صفحة حملات برنامج الولاء في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import LoyaltyCampaignsPage from '@/app/dashboard/loyalty/campaigns/page';

export default function AdminLoyaltyCampaignsPage() {
  return (
    <DashboardLayout
      pageTitle="حملات برنامج الولاء"
      pageDescription="إدارة حملات التسويق والعروض الترويجية"
    >
      <LoyaltyCampaignsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'حملات برنامج الولاء - لوحة الإدارة',
  description: 'إدارة حملات التسويق والعروض الترويجية'
};
