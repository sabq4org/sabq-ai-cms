'use client';

import React from 'react';
import SmartAnalyticsDashboard from '@/components/analytics/SmartAnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              تسجيل الدخول مطلوب
            </h1>
            <p className="text-gray-600 mb-6">
              يرجى تسجيل الدخول لعرض لوحة التحليلات الذكية وتتبع تقدمك في نظام الولاء
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📊</div>
            <h1 className="text-3xl font-bold text-gray-900">
              لوحة التحليلات الذكية
            </h1>
          </div>
          <p className="text-gray-600">
            تتبع تقدمك في نظام الولاء وشاهد إحصائيات تفاعلك مع المحتوى
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex items-center gap-4 p-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              👤 الملف الشخصي
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/loyalty-program"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              🏆 نظام الولاء
            </Link>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-2 text-blue-600 font-medium">
              📊 التحليلات
            </span>
          </div>
        </div>

        {/* Dashboard */}
        <SmartAnalyticsDashboard />

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            💡 نصيحة: تفاعل أكثر مع المحتوى لكسب المزيد من النقاط والوصول لمستويات أعلى!
          </p>
        </div>
      </div>
    </div>
  );
}
