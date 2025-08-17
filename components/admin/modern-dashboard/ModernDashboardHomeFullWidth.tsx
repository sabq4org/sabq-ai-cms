/**
 * صفحة لوحة التحكم الحديثة - الصفحة الرئيسية - العرض الكامل
 * Modern Dashboard Homepage - Full Width
 */

"use client";

import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe,
  Hash,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const statsData = [
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
    change: -2.1,
    changeType: "decrease" as const,
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

const recentActivities = [
  {
    title: "تم نشر مقال جديد",
    time: "5 دقائق",
    type: "article",
    icon: FileText,
  },
  {
    title: "تعليق جديد على مقال",
    time: "12 دقيقة",
    type: "comment",
    icon: MessageSquare,
  },
  { title: "مستخدم جديد انضم", time: "30 دقيقة", type: "user", icon: Users },
  { title: "تحديث في النظام", time: "1 ساعة", type: "system", icon: Activity },
];

const aiSystemsStatus = [
  { name: "تحليل المشاعر", status: "active", accuracy: 94.2, color: "green" },
  { name: "التوصيات الذكية", status: "active", accuracy: 91.8, color: "green" },
  { name: "البحث الذكي", status: "active", accuracy: 96.1, color: "green" },
  {
    name: "تصنيف المحتوى",
    status: "maintenance",
    accuracy: 88.5,
    color: "yellow",
  },
];

export default function ModernDashboardHomeFullWidth() {
  const getChangeIcon = (changeType: "increase" | "decrease") => {
    return changeType === "increase" ? ArrowUpRight : ArrowDownRight;
  };

  return (
    <>
      {/* حاوية العرض الكامل */}
      <div className="w-full max-w-none space-y-6">
        {/* رسالة الترحيب الاحترافية */}
        <DesignComponents.StandardCard className="w-full max-w-none p-6 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                مرحباً بك في منصة سبق الذكية
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                نظام إدارة المحتوى الإعلامي المتطور بتقنيات الذكاء الاصطناعي
              </p>
              <div className="flex gap-3">
                <DesignComponents.StatusIndicator
                  status="success"
                  text="النظام يعمل بكفاءة"
                />
                <DesignComponents.StatusIndicator
                  status="info"
                  text={new Date().toLocaleDateString("ar-SA")}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                الوقت الحالي
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* الإحصائيات الرئيسية */}
        <div className="w-full max-w-none">
          <DesignComponents.SectionHeader
            title="الإحصائيات الرئيسية"
            description="أهم المؤشرات والبيانات لأداء المنصة"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 ml-2" />
                  تصفية
                </Button>
                <Button size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </DesignComponents.ActionBar>
            }
          />

          {/* شبكة الإحصائيات مع عرض كامل */}
          <div className="w-full max-w-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 mb-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              const ChangeIcon = getChangeIcon(stat.changeType);
              return (
                <DesignComponents.StandardCard
                  key={index}
                  className="w-full max-w-none p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                            stat.changeType === "increase"
                              ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                              : "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          <ChangeIcon className="w-3 h-3" />
                          {Math.abs(stat.change)}%
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        stat.color === "blue" &&
                          "bg-blue-100 dark:bg-blue-900/30",
                        stat.color === "green" &&
                          "bg-green-100 dark:bg-green-900/30",
                        stat.color === "purple" &&
                          "bg-purple-100 dark:bg-purple-900/30",
                        stat.color === "orange" &&
                          "bg-orange-100 dark:bg-orange-900/30"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          stat.color === "blue" &&
                            "text-blue-600 dark:text-blue-400",
                          stat.color === "green" &&
                            "text-green-600 dark:text-green-400",
                          stat.color === "purple" &&
                            "text-purple-600 dark:text-purple-400",
                          stat.color === "orange" &&
                            "text-orange-600 dark:text-orange-400"
                        )}
                      />
                    </div>
                  </div>
                </DesignComponents.StandardCard>
              );
            })}
          </div>
        </div>

        {/* الأنظمة الذكية والنشاطات - عرض كامل */}
        <div className="w-full max-w-none grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          <div className="xl:col-span-2 2xl:col-span-3">
            <DesignComponents.StandardCard className="w-full max-w-none p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    حالة الأنظمة الذكية
                  </h3>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full max-w-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
                {aiSystemsStatus.map((system, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {system.name}
                      </span>
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          system.status === "active"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        دقة النظام
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {system.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DesignComponents.StandardCard>
          </div>

          <DesignComponents.StandardCard className="w-full max-w-none p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  النشاطات الأخيرة
                </h3>
              </div>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        activity.type === "article" &&
                          "bg-blue-100 dark:bg-blue-900/30",
                        activity.type === "comment" &&
                          "bg-green-100 dark:bg-green-900/30",
                        activity.type === "user" &&
                          "bg-purple-100 dark:bg-purple-900/30",
                        activity.type === "system" &&
                          "bg-orange-100 dark:bg-orange-900/30"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          activity.type === "article" &&
                            "text-blue-600 dark:text-blue-400",
                          activity.type === "comment" &&
                            "text-green-600 dark:text-green-400",
                          activity.type === "user" &&
                            "text-purple-600 dark:text-purple-400",
                          activity.type === "system" &&
                            "text-orange-600 dark:text-orange-400"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        منذ {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </DesignComponents.StandardCard>
        </div>

        {/* الصف الإضافي - عرض كامل */}
        <div className="w-full max-w-none grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
          <DesignComponents.StandardCard className="w-full max-w-none p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="h-5 w-5 text-indigo-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                المحتوى اليوم
              </h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                24
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                مقال منشور
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard className="w-full max-w-none p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                الزوار الآن
              </h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                1,234
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                زائر نشط
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard className="w-full max-w-none p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                التفاعل
              </h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                89%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                معدل المشاركة
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard className="w-full max-w-none p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                الأداء
              </h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                95%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                جودة النظام
              </div>
            </div>
          </DesignComponents.StandardCard>
        </div>

        {/* الصف الأخير - عرض كامل */}
        <div className="w-full max-w-none grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          <DesignComponents.StandardCard className="w-full max-w-none p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                إجراءات سريعة
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <FileText className="h-4 w-4 ml-2" />
                مقال جديد
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Users className="h-4 w-4 ml-2" />
                المستخدمين
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Activity className="h-4 w-4 ml-2" />
                التحليلات
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Settings className="h-4 w-4 ml-2" />
                الإعدادات
              </Button>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard className="w-full max-w-none p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                المشاهدات الشهر الماضي
              </h3>
            </div>
            <div className="h-24 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  2.4M
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  مشاهدة إجمالية
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>
        </div>
      </div>
    </>
  );
}
