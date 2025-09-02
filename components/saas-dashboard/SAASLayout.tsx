"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState } from "react";
import SAASHeader from "./SAASHeader";
import SAASSidebar from "./SAASSidebar";
import { useDarkMode } from "@/hooks/useDarkMode";

interface SAASLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  showEditButton?: boolean;
  onEditClick?: () => void;
  className?: string;
}

export default function SAASLayout({
  children,
  pageTitle = "لوحة التحكم",
  pageSubtitle = "مرحباً بك في منصة سبق الذكية",
  showEditButton = true,
  onEditClick,
  className = "",
}: SAASLayoutProps) {
  const { darkMode } = useDarkMode();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <div
      className={`saas-main-bg min-h-screen ${
        darkMode ? "saas-dark-support" : ""
      }`}
    >
      {/* Sidebar */}
      <SAASSidebar
        isCollapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${!isMobile && sidebarOpen ? "mr-64" : !isMobile ? "mr-16" : "mr-0"}
        `}
      >
        {/* Header */}
        <SAASHeader
          title={pageTitle}
          subtitle={pageSubtitle}
          showEditButton={showEditButton}
          onEditClick={onEditClick}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={isMobile}
        />

        {/* Page Content */}
        <main
          className={`
          px-6 py-8 min-h-[calc(100vh-theme(space.16))]
          ${className}
        `}
        >
          <div className="max-w-none">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// مكون صفحة رئيسية مع التصميم الجديد
export function SAASMainDashboard() {

  const stats = [
    {
      title: "إجمالي المقالات",
      value: "1,247",
      change: "+12%",
      positive: true,
      icon: "📄",
    },
    {
      title: "المقالات المنشورة",
      value: "1,198",
      change: "+8%",
      positive: true,
      icon: "✅",
    },
    {
      title: "المسودات",
      value: "49",
      change: "-3%",
      positive: false,
      icon: "📝",
    },
    {
      title: "المشاهدات اليومية",
      value: "45,231",
      change: "+15%",
      positive: true,
      icon: "👁️",
    },
  ];

  const quickActions = [
    {
      title: "إنشاء مقال جديد",
      description: "ابدأ في كتابة مقال جديد",
      icon: "✍️",
      href: "/admin/articles/new",
      color: "bg-blue-500",
    },
    {
      title: "تحليل عميق",
      description: "إنشاء تحليل ذكي للبيانات",
      icon: "📊",
      href: "/admin/deep-analysis/new",
      color: "bg-green-500",
    },
    {
      title: "مراجعة التعليقات",
      description: "مراجعة التعليقات المعلقة",
      icon: "💬",
      href: "/admin/comments",
      color: "bg-orange-500",
    },
    {
      title: "إعدادات النظام",
      description: "تخصيص إعدادات المنصة",
      icon: "⚙️",
      href: "/admin/settings",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="saas-card">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              مرحباً بك مرة أخرى! 👋
            </h1>
            <p
              className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              إليك نظرة سريعة على أداء منصة سبق الذكية اليوم
            </p>
          </div>
          <button className="saas-btn-primary">عرض التقرير الكامل</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="saas-stat-card saas-hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="saas-stat-label">{stat.title}</p>
                <p className="saas-stat-number">{stat.value}</p>
                <p
                  className={`saas-stat-change ${
                    stat.positive ? "positive" : "negative"
                  }`}
                >
                  {stat.change} من الشهر الماضي
                </p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="saas-card">
        <h2
          className={`text-xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className={`
                p-4 rounded-lg border-2 border-dashed border-gray-300
                hover:border-yellow-400 hover:bg-yellow-50
                transition-all duration-200 text-center group
                ${darkMode ? "hover:bg-gray-800" : ""}
              `}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3
                className={`font-semibold text-sm ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {action.title}
              </h3>
              <p
                className={`text-xs mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {action.description}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="saas-card">
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            مؤشرات الأداء
          </h3>
          <div
            className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg
                          flex items-center justify-center"
          >
            <p className="text-gray-600">📈 رسم بياني للأداء</p>
          </div>
        </div>

        <div className="saas-card">
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            التفاعل الأخير
          </h3>
          <div className="space-y-3">
            {[
              {
                user: "أحمد محمد",
                action: "أعجب بمقال الذكاء الاصطناعي",
                time: "منذ 5 دقائق",
              },
              {
                user: "فاطمة أحمد",
                action: "علقت على تحليل السوق",
                time: "منذ 10 دقائق",
              },
              {
                user: "محمد علي",
                action: "شارك مقال التكنولوجيا",
                time: "منذ 15 دقيقة",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user}
                  </p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
