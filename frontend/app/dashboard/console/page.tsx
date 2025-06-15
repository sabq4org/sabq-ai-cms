'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingUp, Users, FileText, Bot, AlertTriangle, 
  Search, Filter, Download, RefreshCw, Eye, Clock, Zap,
  BarChart3, PieChart, TrendingDown, UserCheck, AlertCircle
} from 'lucide-react';
import { LiveKPIs } from './components/LiveKPIs';
import { ActivityTimeline } from './components/ActivityTimeline';
import { AIInsights } from './components/AIInsights';
import { SystemAlerts } from './components/SystemAlerts';
import { ContentMonitor } from './components/ContentMonitor';
import { EditorBehavior } from './components/EditorBehavior';


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

  // Mock data for initial render
  const mockKPIs = [
    {
      label: 'المقالات المنشورة',
      value: 156,
      trend: { value: 12, direction: 'up' as const },
      subMetrics: [
        { label: 'اليوم', value: 23 },
        { label: 'هذا الأسبوع', value: 98 }
      ]
    },
    {
      label: 'مرات المشاهدة',
      value: 45230,
      trend: { value: 8, direction: 'up' as const },
      subMetrics: [
        { label: 'فريدة', value: 12340 },
        { label: 'متكررة', value: 32890 }
      ]
    },
    {
      label: 'التفاعلات',
      value: 892,
      trend: { value: 3, direction: 'down' as const },
      subMetrics: [
        { label: 'تعليقات', value: 567 },
        { label: 'إعجابات', value: 325 }
      ]
    },
    {
      label: 'المستخدمون النشطون',
      value: 89,
      trend: { value: 0, direction: 'neutral' as const },
      subMetrics: [
        { label: 'محررون', value: 34 },
        { label: 'مراجعون', value: 55 }
      ]
    },
    {
      label: 'معدل الارتداد',
      value: 32.5,
      trend: { value: 2, direction: 'up' as const }
    },
    {
      label: 'متوسط وقت القراءة',
      value: 4.2,
      trend: { value: 5, direction: 'up' as const }
    },
    {
      label: 'استعلامات AI',
      value: 1234,
      trend: { value: 25, direction: 'up' as const }
    },
    {
      label: 'وقت الاستجابة',
      value: 120,
      trend: { value: 10, direction: 'down' as const }
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم الذكية</h1>
          <p className="text-gray-500">مراقبة الأداء والتحليلات في الوقت الفعلي</p>
        </div>

        {/* KPIs Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <LiveKPIs kpis={mockKPIs} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <ActivityTimeline />
            </section>
            
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <ContentMonitor />
            </section>
          </div>

          {/* Right Column - AI & System */}
          <div className="space-y-6">
            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <AIInsights />
            </section>
            
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <SystemAlerts />
            </section>
          </div>
        </div>

        {/* Editor Behavior Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <EditorBehavior />
        </section>
      </div>
    </div>
  );
} 