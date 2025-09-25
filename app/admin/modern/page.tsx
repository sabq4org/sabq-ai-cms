/**
 * طريق لوحة التحكم الحديثة - الصفحة الرئيسية
 * Modern Dashboard Route - Home Page
 * Updated: September 25, 2025
 */

"use client";

import DashboardLayout from "@/components/admin/modern-dashboard/DashboardLayout";
import ModernDashboardHomeContent from "@/components/admin/modern-dashboard/ModernDashboardHomeContent";

export default function ModernDashboardPage() {
  return (
    <DashboardLayout
      pageTitle="لوحة التحكم الرئيسية"
      pageDescription="نظرة شاملة على إحصائيات المنصة"
    >
      <ModernDashboardHomeContent />
    </DashboardLayout>
  );
}