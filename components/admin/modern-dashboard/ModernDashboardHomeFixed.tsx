/**
 * صفحة لوحة التحكم الحديثة - الصفحة الرئيسية
 * Modern Dashboard Homepage
 */

'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { DesignComponents } from '@/components/design-system/DesignSystemGuide';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

const statsData = [
  {
    title: 'إجمالي الزوار',
    value: '45.2k',
    icon: Users,
    change: 12.5,
    changeType: 'increase' as const,
    color: 'blue'
  },
  {
    title: 'مشاهدات الصفحة',
    value: '128.4k',
    icon: Eye,
    change: 8.2,
    changeType: 'increase' as const,
    color: 'green'
  },
  {
    title: 'المقالات',
    value: '1,247',
    icon: FileText,
    change: -2.1,
    changeType: 'decrease' as const,
    color: 'purple'
  },
  {
    title: 'التعليقات',
    value: '896',
    icon: MessageSquare,
    change: 15.3,
    changeType: 'increase' as const,
    color: 'orange'
  }
];

const recentActivities = [
  { title: 'تم نشر مقال جديد', time: '5 دقائق', type: 'article', icon: FileText },
  { title: 'تعليق جديد على مقال', time: '12 دقيقة', type: 'comment', icon: MessageSquare },
  { title: 'مستخدم جديد انضم', time: '30 دقيقة', type: 'user', icon: Users },
  { title: 'تحديث في النظام', time: '1 ساعة', type: 'system', icon: Activity }
];

const aiSystemsStatus = [
  { name: 'تحليل المشاعر', status: 'active', accuracy: 94.2, color: 'green' },
  { name: 'التوصيات الذكية', status: 'active', accuracy: 91.8, color: 'green' },
  { name: 'البحث الذكي', status: 'active', accuracy: 96.1, color: 'green' },
  { name: 'تصنيف المحتوى', status: 'maintenance', accuracy: 88.5, color: 'yellow' }
];

export default function ModernDashboardHome() {
  // Helper function to format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getChangeIcon = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' ? ArrowUpRight : ArrowDownRight;
  };

  const getChangeColor = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <DashboardLayout
      pageTitle="لوحة التحكم الرئيسية"
      pageDescription="نظرة شاملة على أداء منصة سبق الإعلامية"
    >
      <div className="space-y-8">
        {/* رسالة الترحيب الاحترافية */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
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
                <DesignComponents.StatusIndicator status="success" text="النظام يعمل بكفاءة" />
                <DesignComponents.StatusIndicator status="info" text={new Date().toLocaleDateString('ar-SA')} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">الوقت الحالي</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* الإحصائيات الرئيسية */}
        <div>
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

          <DesignComponents.DynamicGrid minItemWidth="280px" className="mb-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              const ChangeIcon = getChangeIcon(stat.changeType);
              return (
                <DesignComponents.StandardCard key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        <div className={cn(
                          "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                          stat.changeType === 'increase'
                            ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                            : "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          <ChangeIcon className="w-3 h-3" />
                          {Math.abs(stat.change)}%
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      stat.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
                      stat.color === 'green' && "bg-green-100 dark:bg-green-900/30",
                      stat.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30",
                      stat.color === 'orange' && "bg-orange-100 dark:bg-orange-900/30"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        stat.color === 'blue' && "text-blue-600 dark:text-blue-400",
                        stat.color === 'green' && "text-green-600 dark:text-green-400",
                        stat.color === 'purple' && "text-purple-600 dark:text-purple-400",
                        stat.color === 'orange' && "text-orange-600 dark:text-orange-400"
                      )} />
                    </div>
                  </div>
                </DesignComponents.StandardCard>
              );
            })}
          </DesignComponents.DynamicGrid>
        </div>

        {/* الأنظمة الذكية والنشاطات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* حالة الأنظمة الذكية */}
          <DesignComponents.StandardCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">الأنظمة الذكية</h3>
              </div>
              <DesignComponents.StatusIndicator status="success" text="جميعها تعمل" />
            </div>
            <div className="space-y-4">
              {aiSystemsStatus.map((system) => (
                <div key={system.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      system.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                    )} />
                    <span className="text-sm">{system.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{system.accuracy}%</span>
                    <DesignComponents.StatusIndicator
                      status={system.status === 'active' ? 'success' : 'warning'}
                      text={system.status === 'active' ? 'نشط' : 'صيانة'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DesignComponents.StandardCard>

          {/* النشاطات الأخيرة */}
          <DesignComponents.StandardCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">النشاطات الأخيرة</h3>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      activity.type === 'article' && "bg-blue-100 dark:bg-blue-900/30",
                      activity.type === 'comment' && "bg-green-100 dark:bg-green-900/30",
                      activity.type === 'user' && "bg-purple-100 dark:bg-purple-900/30",
                      activity.type === 'system' && "bg-orange-100 dark:bg-orange-900/30"
                    )}>
                      <ActivityIcon className={cn(
                        "w-4 h-4",
                        activity.type === 'article' && "text-blue-600 dark:text-blue-400",
                        activity.type === 'comment' && "text-green-600 dark:text-green-400",
                        activity.type === 'user' && "text-purple-600 dark:text-purple-400",
                        activity.type === 'system' && "text-orange-600 dark:text-orange-400"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">منذ {activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </DesignComponents.StandardCard>
        </div>

        {/* الإحصائيات الإضافية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* إحصائيات المحتوى */}
          <DesignComponents.StandardCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold">إحصائيات المحتوى</h3>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'المقالات المنشورة اليوم', value: '24', percentage: 85 },
                { label: 'المسودات', value: '12', percentage: 45 },
                { label: 'في الانتظار', value: '8', percentage: 30 },
                { label: 'التعليقات الجديدة', value: '156', percentage: 92 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.value} عنصر</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DesignComponents.StandardCard>

          {/* الزوار حسب المنطقة */}
          <DesignComponents.StandardCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">الزوار حسب المنطقة</h3>
              </div>
              <DesignComponents.ActionBar>
                <button className="text-gray-400 hover:text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </DesignComponents.ActionBar>
            </div>
            <div className="space-y-3">
              {[
                { country: 'السعودية', visitors: 25120, percentage: 55.5 },
                { country: 'الإمارات', visitors: 8940, percentage: 19.8 },
                { country: 'قطر', visitors: 4230, percentage: 9.4 },
                { country: 'الكويت', visitors: 3850, percentage: 8.5 },
                { country: 'البحرين', visitors: 3091, percentage: 6.8 }
              ].map((country) => (
                <div key={country.country} className="flex items-center justify-between">
                  <span className="text-sm">{country.country}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">
                      {formatNumber(country.visitors)}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(country.percentage / 60) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">
                      {country.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DesignComponents.StandardCard>
        </div>

        {/* رسالة النجاح والتفوق */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                أداء ممتاز ونمو مستمر!
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                منصة سبق تحقق نمواً مستمراً في جميع المؤشرات مع تحسن ملحوظ في تجربة المستخدم
              </p>
            </div>
            <DesignComponents.StatusIndicator status="success" text="أداء متفوق" />
          </div>
        </DesignComponents.StandardCard>
      </div>
    </DashboardLayout>
  );
}
