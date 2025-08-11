'use client';

import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard';

export default function TestAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            تجربة لوحة التحليلات
          </h1>
          <p className="text-gray-600">
            اختبار مكونات التحليلات الجديدة مع عرض البيانات والرسوم البيانية
          </p>
        </div>
        
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
