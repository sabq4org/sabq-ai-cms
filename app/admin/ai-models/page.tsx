/**
 * صفحة نماذج الذكاء الاصطناعي في لوحة الإدارة
 */

import AIModelsPage from "@/app/dashboard/ai-models/page";

export default function AdminAIModelsPage() {
  return (
    <>
      <AIModelsPage />
    </>
  );
}

export const metadata = {
  title: "نماذج الذكاء الاصطناعي - لوحة الإدارة",
  description: "إدارة وتكوين نماذج الذكاء الاصطناعي",
};
