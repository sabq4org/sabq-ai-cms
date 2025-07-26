/**
 * صفحة البرامج الصوتية في لوحة الإدارة
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import AudioProgramsPage from '@/app/dashboard/audio-programs/page';

export default function AdminAudioProgramsPage() {
  return (
    <DashboardLayout
      pageTitle="البرامج الصوتية"
      pageDescription="إدارة البرامج والملفات الصوتية"
    >
      <AudioProgramsPage />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'البرامج الصوتية - لوحة الإدارة',
  description: 'إدارة البرامج والملفات الصوتية'
};
