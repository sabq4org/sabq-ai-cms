"use client";

import EnhancedMobileDashboard, {
  StatCard,
} from "@/components/mobile/EnhancedMobileDashboard";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity,
  BarChart3,
  BookOpen,
  Eye,
  FileText,
  MessageSquare,
  PenTool,
  Rocket,
  Settings,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function MobileDashboardPage() {
  const { darkMode } = useDarkModeContext();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalArticles: 0,
    activeUsers: 0,
    totalViews: 0,
    engagementRate: 0,
    todayArticles: 0,
    weeklyGrowth: 0,
    breakingNews: 0,
    newComments: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // جلب الإحصائيات
        const statsResponse = await fetch("/api/dashboard/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // جلب النشاطات الأخيرة
        const activitiesResponse = await fetch(
          "/api/dashboard/activities?limit=10"
        );
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setRecentActivities(activitiesData.activities || []);
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <EnhancedMobileDashboard
      title={`مرحباً ${user?.name || "بك"}`}
      subtitle="نظرة عامة على أداء منصة سبق الذكية"
      showAdd={true}
      onAdd={() => (window.location.href = "/dashboard/articles/create")}
    >
      {/* مرحب ترحيبي */}
      <div
        className={`
        p-6 rounded-xl border-2 border-dashed transition-colors
        ${
          darkMode
            ? "bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50"
            : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
        }
      `}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h2
            className={`text-xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            أهلاً وسهلاً بك في لوحة التحكم المحسنة!
          </h2>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            تم تصميم هذه الواجهة خصيصاً للهواتف المحمولة لتوفير تجربة سلسة
            ومريحة
          </p>
        </div>
      </div>

      {/* شبكة الإحصائيات الرئيسية */}
      <div className="space-y-4">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          الإحصائيات الرئيسية
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="إجمالي المقالات"
            value={loading ? "..." : formatNumber(stats.totalArticles)}
            change={
              stats.todayArticles > 0
                ? `+${stats.todayArticles} اليوم`
                : undefined
            }
            changeType="positive"
            icon={FileText}
          />
          <StatCard
            title="المشاهدات"
            value={loading ? "..." : formatNumber(stats.totalViews)}
            change={
              stats.weeklyGrowth > 0
                ? `+${stats.weeklyGrowth}% هذا الأسبوع`
                : undefined
            }
            changeType="positive"
            icon={Eye}
          />
          <StatCard
            title="المستخدمين النشطين"
            value={loading ? "..." : formatNumber(stats.activeUsers)}
            icon={Users}
          />
          <StatCard
            title="معدل التفاعل"
            value={loading ? "..." : `${stats.engagementRate}%`}
            changeType="positive"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* الإحصائيات الثانوية */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="الأخبار العاجلة"
          value={loading ? "..." : stats.breakingNews}
          icon={Zap}
        />
        <StatCard
          title="التعليقات الجديدة"
          value={loading ? "..." : stats.newComments}
          icon={MessageSquare}
        />
      </div>

      {/* الإجراءات السريعة */}
      <div className="space-y-4">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            title="مقال جديد"
            subtitle="إنشاء محتوى"
            icon={PenTool}
            href="/dashboard/articles/create"
            color="blue"
            darkMode={darkMode}
          />
          <QuickActionCard
            title="مستخدم جديد"
            subtitle="إدارة الحسابات"
            icon={UserPlus}
            href="/dashboard/users/create"
            color="green"
            darkMode={darkMode}
          />
          <QuickActionCard
            title="إحصائيات"
            subtitle="تحليلات شاملة"
            icon={BarChart3}
            href="/dashboard/analytics"
            color="purple"
            darkMode={darkMode}
          />
          <QuickActionCard
            title="الإعدادات"
            subtitle="تخصيص النظام"
            icon={Settings}
            href="/dashboard/settings"
            color="gray"
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* النشاطات الأخيرة */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            النشاطات الأخيرة
          </h3>
          <Link
            href="/dashboard/activities"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            عرض الكل
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border animate-pulse
                  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }
                `}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-300"
                  }`}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className={`h-4 rounded ${
                      darkMode ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`h-3 w-2/3 rounded ${
                      darkMode ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  />
                </div>
              </div>
            ))
          ) : recentActivities.length > 0 ? (
            recentActivities
              .slice(0, 5)
              .map((activity, index) => (
                <ActivityCard
                  key={index}
                  activity={activity}
                  darkMode={darkMode}
                />
              ))
          ) : (
            <div
              className={`
              text-center py-8
              ${darkMode ? "text-gray-400" : "text-gray-600"}
            `}
            >
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد نشاطات حديثة</p>
            </div>
          )}
        </div>
      </div>

      {/* روابط مفيدة */}
      <div className="space-y-4">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          روابط مفيدة
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/dashboard/analytics"
            className={`
              flex items-center justify-between p-4 rounded-lg border transition-colors
              ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  التحليلات المفصلة
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  رؤى وتقارير شاملة
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              <span>←</span>
            </div>
          </Link>

          <Link
            href="/"
            className={`
              flex items-center justify-between p-4 rounded-lg border transition-colors
              ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  عرض الموقع
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  الانتقال للموقع الرئيسي
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              <span>←</span>
            </div>
          </Link>
        </div>
      </div>
    </EnhancedMobileDashboard>
  );
}

// مكون بطاقة الإجراء السريع
interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  href: string;
  color: "blue" | "green" | "purple" | "gray" | "red";
  darkMode: boolean;
}

function QuickActionCard({
  title,
  subtitle,
  icon: Icon,
  href,
  color,
  darkMode,
}: QuickActionCardProps) {
  const colorMap = {
    blue: { bg: "bg-blue-100 dark:bg-blue-900/20", icon: "text-blue-600" },
    green: { bg: "bg-green-100 dark:bg-green-900/20", icon: "text-green-600" },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      icon: "text-purple-600",
    },
    gray: {
      bg: "bg-gray-100 dark:bg-gray-700",
      icon: "text-gray-600 dark:text-gray-300",
    },
    red: { bg: "bg-red-100 dark:bg-red-900/20", icon: "text-red-600" },
  };

  const colors = colorMap[color];

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 p-4 rounded-lg border transition-colors
        ${
          darkMode
            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }
      `}
    >
      <div className={`p-2 rounded-lg ${colors.bg}`}>
        <Icon className={`w-5 h-5 ${colors.icon}`} />
      </div>
      <div>
        <h4
          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h4>
        <p
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          {subtitle}
        </p>
      </div>
    </Link>
  );
}

// مكون بطاقة النشاط
interface ActivityCardProps {
  activity: any;
  darkMode: boolean;
}

function ActivityCard({ activity, darkMode }: ActivityCardProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return PenTool;
      case "update":
        return Settings;
      case "delete":
        return Target;
      case "user":
        return Users;
      case "comment":
        return MessageSquare;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "create":
        return "text-green-500";
      case "update":
        return "text-blue-500";
      case "delete":
        return "text-red-500";
      case "user":
        return "text-purple-500";
      case "comment":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type);

  return (
    <div
      className={`
      flex items-center gap-3 p-3 rounded-lg border
      ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
    `}
    >
      <div
        className={`w-2 h-2 rounded-full ${colorClass.replace("text-", "bg-")}`}
      />
      <div className="flex-1">
        <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
          {activity.description || activity.title}
        </p>
        <p
          className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          {activity.time}
        </p>
      </div>
      <Icon className={`w-4 h-4 ${colorClass}`} />
    </div>
  );
}
