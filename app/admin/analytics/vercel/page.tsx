'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard';

export default function VercelAnalyticsPage() {
  return (
    <DashboardLayout>
      <AnalyticsDashboard />
    </DashboardLayout>
  );
}