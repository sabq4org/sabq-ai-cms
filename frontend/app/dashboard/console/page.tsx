'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingUp, Users, FileText, Bot, AlertTriangle, 
  Search, Filter, Download, RefreshCw, Eye, Clock, Zap,
  BarChart3, PieChart, TrendingDown, UserCheck, AlertCircle
} from 'lucide-react';
import { SabqCard } from '@/components/ui/SabqCard';
import { SabqBadge } from '@/components/ui/SabqBadge';
import { SabqButton } from '@/components/ui/SabqButton';
import { SabqInput } from '@/components/ui/SabqInput';
import ActivityTimeline from '@/components/console/ActivityTimeline';
import LiveKPIs from '@/components/console/LiveKPIs';
import AIInsights from '@/components/console/AIInsights';
import SystemAlerts from '@/components/console/SystemAlerts';
import ContentMonitor from '@/components/console/ContentMonitor';
import EditorBehavior from '@/components/console/EditorBehavior';

export default function SabqConsolePage() {
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [selectedSection, setSelectedSection] = useState('all');

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // هنا يتم تحديث جميع البيانات
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    لوحة سبق الذكية
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    مركز التحكم والمراقبة اللحظية
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <SabqInput
                  type="text"
                  placeholder="بحث في السجلات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>

              {/* Time Range */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="live">مباشر</option>
                <option value="today">اليوم</option>
                <option value="week">الأسبوع</option>
                <option value="month">الشهر</option>
              </select>

              {/* Refresh Button */}
              <SabqButton
                variant="secondary"
                size="sm"
                onClick={() => setLastRefresh(new Date())}
              >
                <RefreshCw className="h-4 w-4" />
              </SabqButton>

              {/* Export */}
              <SabqButton variant="secondary" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </SabqButton>
            </div>
          </div>

          {/* Last Refresh Indicator */}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            آخر تحديث: {lastRefresh.toLocaleTimeString('ar-SA')}
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-600">متصل</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Live KPIs Section */}
        <LiveKPIs timeRange={selectedTimeRange} />

        {/* AI Insights Bar */}
        <AIInsights />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Timeline - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SabqCard className="h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    سجل النشاطات اللحظي
                  </h2>
                  <div className="flex items-center gap-2">
                    <SabqBadge variant="info" size="sm">
                      {Math.floor(Math.random() * 50 + 100)} حدث/الساعة
                    </SabqBadge>
                  </div>
                </div>
                <ActivityTimeline searchQuery={searchQuery} />
              </div>
            </SabqCard>
          </div>

          {/* System Alerts - Takes 1 column */}
          <div className="lg:col-span-1">
            <SystemAlerts />
          </div>
        </div>

        {/* Content & Editor Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Monitor */}
          <ContentMonitor />

          {/* Editor Behavior */}
          <EditorBehavior />
        </div>

        {/* AI Performance Dashboard */}
        <SabqCard>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              أداء الذكاء الاصطناعي
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-purple-600 dark:text-purple-400">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">1,847</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">+23% من الأمس</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-green-600 dark:text-green-400">معدل القبول</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">87.3%</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">ممتاز</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">متوسط وقت الاستجابة</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">1.2s</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">سريع</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-orange-600 dark:text-orange-400">التوفير في الوقت</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">4.5h</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">اليوم</p>
              </div>
            </div>

            {/* AI Usage Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                استخدام المميزات الذكية
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">توليد العناوين</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">الملخصات التلقائية</span>
                    <span className="text-sm font-medium">31%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '31%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">تحليل المحتوى</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">اقتراح الوسوم</span>
                    <span className="text-sm font-medium">9%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '9%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SabqCard>
      </div>
    </div>
  );
} 