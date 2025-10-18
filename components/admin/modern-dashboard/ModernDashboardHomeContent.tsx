/**
 * محتوى الصفحة الرئيسية للوحة التحكم - مُعاد بناؤه من الصفر
 * Dashboard Home Content - Rebuilt from Scratch
 */

"use client";

import React from "react";
import { 
  TrendingUp, 
  Eye, 
  FileText, 
  MessageSquare,
  Plus,
  BarChart3,
  Users,
  Settings,
  Activity
} from "lucide-react";

export default function ModernDashboardHomeContent() {
  // بيانات الإحصائيات
  const stats = [
    {
      title: "إجمال الزوار",
      value: "45.2k",
      change: "+12.5%",
      icon: Users,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "مشاهدات الصفحة",
      value: "128.4k",
      change: "+8.2%",
      icon: Eye,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "المقالات",
      value: "1,247",
      change: "+5.3%",
      icon: FileText,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "التعليقات",
      value: "896",
      change: "+15.3%",
      icon: MessageSquare,
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* رسالة الترحيب */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">مرحباً، مدير النظام 👋</h2>
            <p className="text-blue-100 text-sm mt-1">
              ما يأتي من مستقبل الذكاء الاصطناعي في الإعلام
            </p>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات - استخدام كامل العرض */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
