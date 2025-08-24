'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Award,
  Target,
  Calendar,
  Clock,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  userStats: {
    totalInteractions: number;
    totalLikes: number;
    totalSaves: number;
    totalShares: number;
    totalComments: number;
    totalViews: number;
    totalPoints: number;
    level: string;
    joinDate: string;
    lastActivity: string;
  };
  interactions: Array<{
    id: string;
    type: string;
    created_at: string;
    article_id: string;
  }>;
  loyaltyHistory: Array<{
    id: string;
    points: number;
    action: string;
    created_at: string;
  }>;
}

interface MetricCard {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: number;
}

export default function SmartAnalyticsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/unified-tracking', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب التحليلات:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">يرجى تسجيل الدخول لعرض التحليلات</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const metrics: MetricCard[] = [
    {
      title: 'إجمالي النقاط',
      value: data.userStats.totalPoints,
      icon: Award,
      color: 'bg-yellow-500',
    },
    {
      title: 'المستوى',
      value: data.userStats.level,
      icon: Target,
      color: 'bg-purple-500',
    },
    {
      title: 'إجمالي التفاعلات',
      value: data.userStats.totalInteractions,
      icon: Zap,
      color: 'bg-blue-500',
    },
    {
      title: 'المقالات المقروءة',
      value: data.userStats.totalViews,
      icon: Eye,
      color: 'bg-green-500',
    },
    {
      title: 'الإعجابات',
      value: data.userStats.totalLikes,
      icon: Heart,
      color: 'bg-red-500',
    },
    {
      title: 'المحفوظات',
      value: data.userStats.totalSaves,
      icon: Bookmark,
      color: 'bg-indigo-500',
    },
    {
      title: 'المشاركات',
      value: data.userStats.totalShares,
      icon: Share2,
      color: 'bg-teal-500',
    },
    {
      title: 'التعليقات',
      value: data.userStats.totalComments,
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📊 لوحة التحليلات الذكية</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'الكل' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Over Time */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 تطور النقاط</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>رسم بياني لتطور النقاط</p>
              <p className="text-sm">سيتم إضافة الرسوم البيانية قريباً</p>
            </div>
          </div>
        </div>

        {/* Interaction Types */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 أنواع التفاعل</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2" />
              <p>رسم دائري لأنواع التفاعل</p>
              <p className="text-sm">سيتم إضافة الرسوم البيانية قريباً</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🕒 النشاط الأخير</h3>
        <div className="space-y-3">
          {data.loyaltyHistory.slice(0, 10).map((point) => (
            <div key={point.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {point.action}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-600">
                  +{point.points} نقطة
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(point.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 مؤشرات النجاح</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.userStats.totalPoints > 0 ? '✅' : '⏳'}
            </div>
            <p className="text-sm text-gray-600 mt-1">نظام النقاط نشط</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.userStats.totalInteractions > 10 ? '🚀' : '📈'}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {data.userStats.totalInteractions > 10 ? 'مستخدم نشط' : 'في بداية الرحلة'}
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.userStats.level !== 'برونزي' ? '🏆' : '🥉'}
            </div>
            <p className="text-sm text-gray-600 mt-1">مستوى {data.userStats.level}</p>
          </div>
        </div>
      </div>
    </div>
  );
}