/**
 * نظام تحسين الأداء - صفحة الإدارة
 * Performance Optimization Admin Page
 */

import PerformanceOptimizationDashboard from "@/components/performance-optimization/PerformanceOptimizationDashboard-safe";

export default function PerformanceOptimizationPage() {
  return <PerformanceOptimizationDashboard />;
}

export const metadata = {
  title: "نظام تحسين الأداء - سبق الذكية",
  description:
    "مراقبة وتحسين أداء النظام في الوقت الفعلي مع التحليلات المتقدمة والتوصيات الذكية",
};
