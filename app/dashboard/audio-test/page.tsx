/**
 * صفحة اختبار الصوت الحديثة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import ModernAudioTest from '@/components/admin/modern-dashboard/ModernAudioTest';

export default function AudioTestPage() {
  return (
    <DashboardLayout>
      <ModernAudioTest />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'اختبار الصوت المتقدم - سبق الذكية',
  description: 'تسجيل ومعالجة الملفات الصوتية بتقنيات الذكاء الاصطناعي'
};
