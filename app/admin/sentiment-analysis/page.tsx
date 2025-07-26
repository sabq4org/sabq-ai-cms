/**
 * صفحة تحليل المشاعر في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import SentimentAnalysisPage from '@/app/dashboard/sentiment-analysis/page';

export default function AdminSentimentAnalysisPage() {
  return (
    <DashboardLayout
      pageTitle="تحليل المشاعر"
      pageDescription="تحليل مشاعر المحتوى والتعليقات باستخدام الذكاء الاصطناعي"
    >
      <SentimentAnalysisPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'تحليل المشاعر - لوحة الإدارة',
  description: 'تحليل مشاعر المحتوى والتعليقات باستخدام الذكاء الاصطناعي'
};
