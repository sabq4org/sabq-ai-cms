/**
 * محتوى الصفحة الرئيسية - مُعاد بناؤه من الصفر
 * يملأ كامل المساحة المتاحة بدون فراغات
 */

"use client";

import React from "react";
import { 
  TrendingUp, 
  Eye, 
  FileText, 
  MessageSquare,
  Users,
  Activity,
  ArrowUp
} from "lucide-react";

export default function ModernDashboardHomeContent() {
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

  const recentArticles = [
    { title: "افتتاح أول فرع لـApple في الجبيل", views: "12.5k", status: "منشور" },
    { title: "التقنية والمستقبل", views: "8.3k", status: "منشور" },
    { title: "الذكاء الاصطناعي في التعليم", views: "6.1k", status: "مسودة" },
    { title: "مستقبل الطاقة المتجددة", views: "5.2k", status: "منشور" },
    { title: "الأمن السيبراني", views: "4.8k", status: "منشور" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* رسالة الترحيب */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-lg">
            <Activity className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">مرحباً، مدير النظام 👋</h2>
            <p className="text-blue-100">
              ما يأتي من مستقبل الذكاء الاصطناعي في الإعلام
            </p>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <ArrowUp className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* المقالات الحديثة */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            المقالات الحديثة
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentArticles.map((article, index) => (
            <div
              key={index}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.views}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      article.status === 'منشور' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {article.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

