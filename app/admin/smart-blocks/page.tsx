/**
 * صفحة الكتل الذكية في لوحة الإدارة
 */

import SmartBlocksPage from "@/app/dashboard/smart-blocks/page";

export default function AdminSmartBlocksPage() {
  return (
    <>
      <SmartBlocksPage />
    </>
  );
}

export const metadata = {
  title: "الكتل الذكية - لوحة الإدارة",
  description: "إدارة وتخصيص الكتل الذكية للمحتوى التفاعلي",
};
