/**
 * طريق صفحة التحليلات المتقدمة الحديثة
 * Modern Advanced Analytics Route
 */

'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import ModernAnalyticsContent from '@/components/admin/modern-dashboard/ModernAnalyticsContent';

export default function ModernAnalyticsPage() {
  return (
    <DashboardLayout
      pageTitle="التحليلات المتقدمة"
      pageDescription="إحصائيات مفصلة عن أداء المنصة"
    >
      <ModernAnalyticsContent />
    </DashboardLayout>
  );
}
