/**
 * صفحة مقالات الرأي في لوحة الإدارة
 */

import OpinionsPage from "@/app/dashboard/opinions/page";

export default function AdminOpinionsPage() {
  return (
    <>
      <OpinionsPage />
    </>
  );
}

export const metadata = {
  title: "مقالات الرأي - لوحة الإدارة",
  description: "إدارة مقالات الرأي والتحليلات",
};
