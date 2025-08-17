/**
 * صفحة تحليل المشاعر في لوحة الإدارة
 */

import SentimentAnalysisPage from "@/app/dashboard/sentiment-analysis/page";

export default function AdminSentimentAnalysisPage() {
  return (
    <>
      <SentimentAnalysisPage />
    </>
  );
}

export const metadata = {
  title: "تحليل المشاعر - لوحة الإدارة",
  description: "تحليل مشاعر المحتوى والتعليقات باستخدام الذكاء الاصطناعي",
};
