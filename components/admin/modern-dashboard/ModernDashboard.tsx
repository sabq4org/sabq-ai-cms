/**
 * لوحة التحكم الرئيسية الحديثة - Modern Dashboard
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Eye,
  MessageSquare,
  Heart,
  Zap,
  Globe,
  Brain,
  Bell,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// بيانات وهمية للإحصائيات
const statsData = [
  {
    title: 'إجمالي المقالات',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: FileText,
    color: 'blue'
  },
  {
    title: 'الزوار اليوم',
    value: '45,231',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: Users,
    color: 'green'
  },
  {
    title: 'المشاهدات',
    value: '128,459',
    change: '+15.3%',
    changeType: 'positive' as const,
    icon: Eye,
    color: 'purple'
  },
  {
    title: 'التعليقات',
    value: '1,247',
    change: '-2.1%',
    changeType: 'negative' as const,
    icon: MessageSquare,
    color: 'orange'
  }
];

// بيانات الأنظمة الذكية
const aiSystemsData = [
  {
    name: 'تحليل المشاعر العربي',
    status: 'نشط',
    accuracy: 94,
    requests: '2,847',
    icon: Heart,
    color: 'rose'
  },
  {
    name: 'التوصيات الذكية',
    status: 'نشط',
    accuracy: 89,
    requests: '15,432',
    icon: Brain,
    color: 'blue'
  },
  {
    name: 'البحث الذكي',
    status: 'نشط',
    accuracy: 96,
    requests: '8,234',
    icon: Globe,
    color: 'green'
  },
  {
    name: 'تحسين الأداء',
    status: 'نشط',
    accuracy: 92,
    requests: '1,234',
    icon: Zap,
    color: 'yellow'
  }
];

// أحدث الأنشطة
const recentActivities = [
  {
    title: 'تم نشر مقال جديد',
    description: 'التطورات الاقتصادية في المملكة',
    time: 'منذ 5 دقائق',
    type: 'article',
    user: 'أحمد محمد'
  },
  {
    title: 'تحديث النظام الذكي',
    description: 'تحسين خوارزمية التوصيات',
    time: 'منذ 15 دقيقة',
    type: 'system',
    user: 'النظام'
  },
  {
    title: 'مراجعة تعليق',
    description: 'تعليق جديد في انتظار المراجعة',
    time: 'منذ 30 دقيقة',
    type: 'comment',
    user: 'سارة أحمد'
  }
];

export default function ModernDashboard() {
  return (
    <DashboardLayout 
      pageTitle="لوحة التحكم الرئيسية"
      pageDescription="نظرة عامة على منصة سبق الذكية"
    >
      <div className="space-y-6">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsData.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden hover:shadow-lg transition-all duration-200 group">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={cn(
                        "text-sm font-medium mr-1",
                        stat.changeType === 'positive' ? "text-green-500" : "text-red-500"
                      )}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        من الشهر الماضي
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform",
                    stat.color === 'blue' && "bg-blue-500",
                    stat.color === 'green' && "bg-green-500",
                    stat.color === 'purple' && "bg-purple-500",
                    stat.color === 'orange' && "bg-orange-500"
                  )}>
                    <stat.icon className={cn(
                      "h-6 w-6",
                      stat.color === 'blue' && "text-blue-500",
                      stat.color === 'green' && "text-green-500",
                      stat.color === 'purple' && "text-purple-500",
                      stat.color === 'orange' && "text-orange-500"
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الأنظمة الذكية */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold">الأنظمة الذكية</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  حالة وأداء الأنظمة الذكية
                </p>
              </div>
              <Button variant="outline" size="sm">
                عرض الكل
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSystemsData.map((system) => (
                <div key={system.name} className="p-4 rounded-xl border bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg bg-opacity-10",
                        system.color === 'rose' && "bg-rose-500",
                        system.color === 'blue' && "bg-blue-500",
                        system.color === 'green' && "bg-green-500",
                        system.color === 'yellow' && "bg-yellow-500"
                      )}>
                        <system.icon className={cn(
                          "h-5 w-5",
                          system.color === 'rose' && "text-rose-500",
                          system.color === 'blue' && "text-blue-500",
                          system.color === 'green' && "text-green-500",
                          system.color === 'yellow' && "text-yellow-500"
                        )} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {system.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {system.requests} طلب اليوم
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {system.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">دقة النظام</span>
                      <span className="font-medium">{system.accuracy}%</span>
                    </div>
                    <Progress value={system.accuracy} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* الأنشطة الأخيرة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold">الأنشطة الأخيرة</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                آخر التحديثات والأنشطة
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    activity.type === 'article' && "bg-blue-500",
                    activity.type === 'system' && "bg-green-500",
                    activity.type === 'comment' && "bg-orange-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.user}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full justify-center text-sm">
                عرض جميع الأنشطة
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* أدوات سريعة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">أدوات سريعة</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              الوصول السريع للوظائف المهمة
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { title: 'مقال جديد', icon: FileText, href: '/admin/articles/new', color: 'blue' },
                { title: 'التحليلات', icon: BarChart3, href: '/admin/analytics', color: 'green' },
                { title: 'الإشعارات', icon: Bell, href: '/admin/notifications', color: 'orange' },
                { title: 'المستخدمين', icon: Users, href: '/admin/users', color: 'purple' },
                { title: 'الإعدادات', icon: Settings, href: '/admin/settings', color: 'gray' },
                { title: 'الأنظمة الذكية', icon: Brain, href: '/admin/ai-systems', color: 'pink' },
              ].map((tool) => (
                <Button
                  key={tool.title}
                  variant="ghost"
                  className="h-auto p-4 flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <tool.icon className={cn(
                    "h-6 w-6",
                    tool.color === 'blue' && "text-blue-500",
                    tool.color === 'green' && "text-green-500",
                    tool.color === 'orange' && "text-orange-500",
                    tool.color === 'purple' && "text-purple-500",
                    tool.color === 'gray' && "text-gray-500",
                    tool.color === 'pink' && "text-pink-500"
                  )} />
                  <span className="text-xs font-medium">{tool.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
