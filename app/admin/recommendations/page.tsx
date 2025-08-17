/**
 * صفحة التوصيات الذكية في لوحة الإدارة
 */

import RecommendationsPage from "@/app/dashboard/recommendations/page";

export default function AdminRecommendationsPage() {
  return (
    <>
      <RecommendationsPage />
    </>
  );
}

export const metadata = {
  title: "التوصيات الذكية - لوحة الإدارة",
  description: "نظام التوصيات المخصصة للمستخدمين",
};
