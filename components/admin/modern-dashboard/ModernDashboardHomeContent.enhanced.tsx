/**
 * محتوى لوحة التحكم الحديثة - نسخة محسّنة واحترافية
 * Professional Enhanced Dashboard Content
 * 
 * التحسينات:
 * - ✅ تخطيط Grid احترافي
 * - ✅ هوامش متوازنة
 * - ✅ بطاقات منظمة
 * - ✅ responsive design كامل
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/EnhancedAuthContextWithSSR";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bell,
  Eye,
  FileText,
  MessageSquare,
  Settings,
  Users,
  Plus,
  TrendingUp,
  Clock,
  Zap,
  Target,
} from "lucide-react";

export default function ModernDashboardHomeContentEnhanced() {
  const { user } = useAuth();
  const isAdmin = !!(
    user &&
    (user.is_admin ||
      user.role === "admin" ||
      user.role === "super_admin" ||
      user.role === "system_admin")
  );

  // بيانات الإحصائيات الرئيسية
  const mainStats = [
    {
      title: "إجمالي الزوار",
      value: "45.2k",
      icon: Users,
      change: 12.5,
      changeType: "increase" as const,
      color: "blue",
    },
    {
      title: "مشاهدات الصفحة",
      value: "128.4k",
      icon: Eye,
      change: 8.2,
      changeType: "increase" as const,
      color: "green",
    },
    {
      title: "المقالات",
      value: "1,247",
      icon: FileText,
      change: 5.3,
      changeType: "increase" as const,
      color: "purple",
    },
    {
      title: "التعليقات",
      value: "896",
      icon: MessageSquare,
      change: 15.3,
      changeType: "increase" as const,
      color: "orange",
    },
  ];

  // الأنشطة الحديثة
  const recentActivities = [
    {
      title: "تم نشر مقال جديد",
      description: "افتتاح أول فرع لـApple في الجبيل",
      time: "5 دقائق",
      type: "article",
      icon: FileText,
      color: "blue",
    },
    {
      title: "تعليق جديد على مقال",
      description: "محمد أحمد علق على مقال التقنية",
      time: "12 دقيقة",
      type: "comment",
      icon: MessageSquare,
      color: "green",
    },
    {
      title: "مستخدم جديد انضم",
      description: "سارة خالد انضمت للمنصة",
      time: "30 دقيقة",
      type: "user",
      icon: Users,
      color: "purple",
    },
    {
      title: "تحديث في النظام",
      description: "تحديث نظام التوصيات الذكية",
      time: "1 ساعة",
      type: "system",
      icon: Activity,
      color: "orange",
    },
  ];

  // حالة الأنظمة الذكية
  const aiSystemsStatus = [
    {
      name: "تحليل المشاعر",
      status: "active",
      accuracy: 94.2,
      color: "green",
    },
    {
      name: "التوصيات الذكية",
      status: "active",
      accuracy: 91.8,
      color: "green",
    },
    {
      name: "البحث الذكي",
      status: "active",
      accuracy: 96.1,
      color: "green",
    },
    {
      name: "تصنيف المحتوى",
      status: "maintenance",
      accuracy: 88.5,
      color: "yellow",
    },
  ];

  // الإجراءات السريعة
  const quickActions = [
    {
      title: "مقال جديد",
      description: "إنشاء مقال جديد",
      icon: Plus,
      href: "/admin/modern/articles/new",
      color: "blue",
    },
    {
      title: "التحليلات",
      description: "عرض التحليلات",
      icon: BarChart3,
      href: "/admin/modern/analytics",
      color: "green",
    },
    {
      title: "المستخدمون",
      description: "إدارة المستخدمين",
      icon: Users,
      href: "/admin/modern/users",
      color: "purple",
    },
    {
      title: "الإعدادات",
      description: "إعدادات النظام",
      icon: Settings,
      href: "/admin/modern/settings",
      color: "orange",
    },
  ];

  return (
    <div className="space-y-6">
      {/* رسالة الترحيب */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-accent rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              مرحباً، {user?.name || "المسؤول"} 👋
            </h2>
            <p className="text-white/90">
              🚀 معاً نبني مستقبل الذكاء الاصطناعي في الإعلام
            </p>
          </div>
          <Zap className="w-16 h-16 text-white/20" />
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {mainStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}
              >
                <stat.icon
                  className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === "increase"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stat.changeType === "increase" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}%
              </div>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* الإجراءات السريعة */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          الإجراءات السريعة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-brand-primary dark:hover:border-brand-accent group"
            >
              <div
                className={`inline-flex p-3 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20 mb-4 group-hover:scale-110 transition-transform`}
              >
                <action.icon
                  className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400`}
                />
              </div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* الأنشطة الحديثة وحالة الأنظمة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأنشطة الحديثة */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              الأنشطة الحديثة
            </h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg bg-${activity.color}-100 dark:bg-${activity.color}-900/20 flex-shrink-0`}
                >
                  <activity.icon
                    className={`w-4 h-4 text-${activity.color}-600 dark:text-${activity.color}-400`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    منذ {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* حالة الأنظمة الذكية */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              حالة الأنظمة الذكية
            </h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {aiSystemsStatus.map((system, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      system.status === "active"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    } animate-pulse`}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {system.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {system.accuracy}%
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

