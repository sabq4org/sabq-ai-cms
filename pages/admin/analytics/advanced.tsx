import React from 'react';
import AdvancedAnalyticsDashboard from '@/components/dashboard/AdvancedAnalyticsDashboard';

export default function AdvancedAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                لوحة التحكم الإدارية
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdvancedAnalyticsDashboard />
      </div>
    </div>
  );
}
