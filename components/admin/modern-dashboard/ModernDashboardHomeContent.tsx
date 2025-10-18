/**
 * لوحة التحكم الاحترافية مع مؤشرات الأداء الذكية (KPIs)
 * Professional Dashboard with Smart KPIs
 */

"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  FileText, 
  MessageSquare,
  Users,
  Activity,
  ArrowUp,
  ArrowDown,
  Clock,
  Target,
  Zap,
  Heart,
  Share2,
  BookOpen
} from "lucide-react";

export default function ModernDashboardHomeContent() {
  // مؤشرات الأداء الرئيسية (KPIs)
  const mainKPIs = [
    {
      title: "إجمالي الزوار",
      value: "45,234",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "blue",
      description: "مقارنة بالشهر الماضي",
      target: "50,000",
      progress: 90,
    },
    {
      title: "مشاهدات الصفحة",
      value: "128,456",
      change: "+8.2%",
      trend: "up",
      icon: Eye,
      color: "green",
      description: "مقارنة بالأسبوع الماضي",
      target: "150,000",
      progress: 85,
    },
    {
      title: "المقالات المنشورة",
      value: "1,247",
      change: "+5.3%",
      trend: "up",
      icon: FileText,
      color: "purple",
      description: "هذا الشهر",
      target: "1,500",
      progress: 83,
    },
    {
      title: "معدل التفاعل",
      value: "15.8%",
      change: "+2.1%",
      trend: "up",
      icon: Activity,
      color: "orange",
      description: "إعجابات وتعليقات",
      target: "20%",
      progress: 79,
    },
  ];

  // إحصائيات سريعة
  const quickStats = [
    {
      label: "متوسط وقت القراءة",
      value: "3.5 دقيقة",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "معدل الارتداد",
      value: "42.3%",
      icon: Target,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "سرعة التحميل",
      value: "0.8 ثانية",
      icon: Zap,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "المشاركات الاجتماعية",
      value: "2,845",
      icon: Share2,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  // أفضل المقالات أداءً
  const topArticles = [
    { 
      title: "افتتاح أول فرع لـApple في الجبيل", 
      views: "12,547", 
      likes: "1,234",
      comments: "156",
      engagement: "18.5%",
      trend: "up"
    },
    { 
      title: "التقنية والمستقبل في المملكة", 
      views: "8,932", 
      likes: "892",
      comments: "98",
      engagement: "15.2%",
      trend: "up"
    },
    { 
      title: "الذكاء الاصطناعي في التعليم", 
      views: "6,721", 
      likes: "654",
      comments: "67",
      engagement: "12.8%",
      trend: "down"
    },
    { 
      title: "مستقبل الطاقة المتجددة", 
      views: "5,234", 
      likes: "523",
      comments: "45",
      engagement: "11.3%",
      trend: "up"
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        icon: "text-blue-600 dark:text-blue-400",
        progress: "bg-blue-600",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        icon: "text-green-600 dark:text-green-400",
        progress: "bg-green-600",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        icon: "text-purple-600 dark:text-purple-400",
        progress: "bg-purple-600",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        icon: "text-orange-600 dark:text-orange-400",
        progress: "bg-orange-600",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      {/* رسالة الترحيب */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <Activity className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">مرحباً، مدير النظام 👋</h2>
              <p className="text-blue-100 text-lg">
                نظرة شاملة على أداء منصة سبق الذكية
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">آخر تحديث</div>
            <div className="text-lg font-semibold">منذ 5 دقائق</div>
          </div>
        </div>
      </div>

      {/* مؤشرات الأداء الرئيسية (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {mainKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;
          const colors = getColorClasses(kpi.color);
          
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* الرأس */}
              <div className="flex items-start justify-between mb-4">
                <div className={`${colors.bg} p-3 rounded-xl`}>
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
                  kpi.trend === 'up' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  {kpi.change}
                </div>
              </div>

              {/* القيمة */}
              <div className="mb-3">
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {kpi.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {kpi.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {kpi.description}
                </p>
              </div>

              {/* شريط التقدم */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">الهدف: {kpi.target}</span>
                  <span className={`font-semibold ${colors.icon}`}>{kpi.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${colors.progress} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${kpi.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* أفضل المقالات أداءً */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              أفضل المقالات أداءً
            </h3>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {topArticles.map((article, index) => {
            const TrendIcon = article.trend === "up" ? ArrowUp : ArrowDown;
            return (
              <div
                key={index}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        {article.comments}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm font-semibold mb-1 ${
                      article.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      {article.engagement}
                    </div>
                    <div className="text-xs text-gray-500">معدل التفاعل</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

