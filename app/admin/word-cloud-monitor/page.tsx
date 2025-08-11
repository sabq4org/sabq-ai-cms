import React from 'react';
import { Metadata } from 'next';
import WordCloudMonitor from '@/components/admin/WordCloudMonitor';

export const metadata: Metadata = {
  title: 'مراقبة سحابة الكلمات - لوحة التحكم',
  description: 'مراقبة وإدارة نظام سحابة الكلمات والتحليلات'
};

const WordCloudMonitorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <WordCloudMonitor />
    </div>
  );
};

export default WordCloudMonitorPage;
