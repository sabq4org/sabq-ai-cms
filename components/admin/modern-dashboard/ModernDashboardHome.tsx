/**
 * صفحة لوحة التحكم الحديثة - الصفحة الرئيسية
 * Modern Dashboard Homepage
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  MessageSquare,
  Eye,
  Heart,
  Activity,
  Calendar,
  Clock,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ExternalLink,
  Zap,
  Shield,
  Globe,
  Star,
  Timer,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  href?: string;
}

interface RecentActivity {
  id: string;
  type: 'article' | 'comment' | 'user' | 'system';
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const statsData: StatCard[] = [
  {
    title: 'إجمالي المقالات',
    value: '2,847',
    change: 12.5,
    changeType: 'increase',
    icon: FileText,
    color: 'blue',
    href: '/admin/modern/articles'
  },
  {
    title: 'الزوار اليوم',
    value: '45,231',
    change: 8.2,
    changeType: 'increase',
    icon: Users,
    color: 'green',
    href: '/admin/modern/analytics'
  },
  {
    title: 'مشاهدات الصفحة',
    value: '128,459',
    change: 15.3,
    changeType: 'increase',
    icon: Eye,
    color: 'purple',
    href: '/admin/modern/analytics'
  },
  {
    title: 'التعليقات',
    value: '1,247',
    change: -2.1,
    changeType: 'decrease',
    icon: MessageSquare,
    color: 'orange',
    href: '/admin/modern/comments'
  },
  {
    title: 'معدل التفاعل',
    value: '12.8%',
    change: 3.4,
    changeType: 'increase',
    icon: Heart,
    color: 'red',
    href: '/admin/modern/analytics'
  },
  {
    title: 'المستخدمين النشطين',
    value: '3,156',
    change: 7.8,
    changeType: 'increase',
    icon: Activity,
    color: 'indigo',
    href: '/admin/modern/users'
  }
];

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'article',
    title: 'مقال جديد تم نشره',
    description: 'التطورات الاقتصادية في المملكة العربية السعودية 2025',
    time: 'منذ 30 دقيقة',
    icon: FileText,
    color: 'blue'
  },
  {
    id: '2',
    type: 'comment',
    title: 'تعليق جديد',
    description: 'تعليق من أحمد محمد على مقال الذكاء الاصطناعي',
    time: 'منذ ساعة',
    icon: MessageSquare,
    color: 'green'
  },
  {
    id: '3',
    type: 'user',
    title: 'مستخدم جديد',
    description: 'سارة أحمد انضمت كمحررة جديدة',
    time: 'منذ 3 ساعات',
    icon: Users,
    color: 'purple'
  },
  {
    id: '4',
    type: 'system',
    title: 'تحديث النظام',
    description: 'تم تحديث نظام التحليلات بنجاح',
    time: 'منذ 6 ساعات',
    icon: Settings,
    color: 'orange'
  }
];

const quickActions: QuickAction[] = [
  {
    title: 'إنشاء مقال جديد',
    description: 'ابدأ في كتابة مقال جديد',
    icon: Plus,
    href: '/admin/articles/new',
    color: 'blue'
  },
  {
    title: 'مراجعة التعليقات',
    description: 'راجع التعليقات المعلقة',
    icon: MessageSquare,
    href: '/admin/modern/comments',
    color: 'green'
  },
  {
    title: 'إدارة المستخدمين',
    description: 'إضافة أو تعديل المستخدمين',
    icon: Users,
    href: '/admin/modern/users',
    color: 'purple'
  },
  {
    title: 'عرض التحليلات',
    description: 'تحليل مفصل للأداء',
    icon: BarChart3,
    href: '/admin/modern/analytics',
    color: 'orange'
  }
];

const aiSystemsStatus = [
  { name: 'تحليل المشاعر', status: 'active', accuracy: 94.2, color: 'green' },
  { name: 'التوصيات الذكية', status: 'active', accuracy: 91.8, color: 'green' },
  { name: 'البحث الذكي', status: 'active', accuracy: 96.1, color: 'green' },
  { name: 'تصنيف المحتوى', status: 'maintenance', accuracy: 88.5, color: 'yellow' }
];

export default function ModernDashboardHome() {
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
      <div className="space-y-6">
        {/* ترحيب وإحصائيات سريعة */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">مرحباً بك في سبق الذكية</h2>
              <p className="text-blue-100">نظام إدارة المحتوى الإعلامي المتطور</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{new Date().toLocaleDateString('ar-SA')}</div>
              <div className="text-blue-100">{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">94.5%</div>
              <div className="text-sm text-blue-100">دقة الأنظمة الذكية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-blue-100">مستخدم نشط الآن</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">99.8%</div>
              <div className="text-sm text-blue-100">وقت التشغيل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2.3s</div>
              <div className="text-sm text-blue-100">متوسط التحميل</div>
            </div>
          </div>
        </div>

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsData.map((stat) => {
            const ChangeIcon = getChangeIcon(stat.changeType);
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        stat.color === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
                        stat.color === 'green' && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
                        stat.color === 'purple' && "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
                        stat.color === 'orange' && "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
                        stat.color === 'red' && "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
                        stat.color === 'indigo' && "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
                      )}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                      </div>
                    </div>
                    <div className={cn("flex items-center gap-1 text-sm", getChangeColor(stat.changeType))}>
                      <ChangeIcon className="h-4 w-4" />
                      <span>{Math.abs(stat.change)}%</span>
                    </div>
                  </div>
                  {stat.href && (
                    <Link href={stat.href}>
                      <Button variant="ghost" size="sm" className="w-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800">
                        <span className="mr-2">عرض التفاصيل</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* حالة الأنظمة الذكية */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                حالة الأنظمة الذكية
              </CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                4/4 نشط
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiSystemsStatus.map((system) => (
                  <div key={system.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        system.color === 'green' && "bg-green-500",
                        system.color === 'yellow' && "bg-yellow-500"
                      )} />
                      <span className="font-medium text-sm">{system.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {system.accuracy}% دقة
                      </Badge>
                      <Badge variant={system.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {system.status === 'active' ? 'نشط' : 'صيانة'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/admin/ai-systems">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    إدارة الأنظمة الذكية
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* النشاطات الأخيرة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                النشاطات الأخيرة
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      activity.color === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
                      activity.color === 'green' && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
                      activity.color === 'purple' && "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
                      activity.color === 'orange' && "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                    )}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {activity.description}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  عرض جميع التنبيهات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الإجراءات السريعة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              الإجراءات السريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <div className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg group-hover:scale-110 transition-transform",
                        action.color === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
                        action.color === 'green' && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
                        action.color === 'purple' && "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
                        action.color === 'orange' && "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                      )}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* تحليلات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                توزيع المحتوى
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { category: 'اقتصاد', count: 1247, percentage: 43.8, color: 'blue' },
                  { category: 'تقنية', count: 856, percentage: 30.1, color: 'green' },
                  { category: 'سياسة', count: 524, percentage: 18.4, color: 'purple' },
                  { category: 'رياضة', count: 220, percentage: 7.7, color: 'orange' }
                ].map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        item.color === 'blue' && "bg-blue-500",
                        item.color === 'green' && "bg-green-500",
                        item.color === 'purple' && "bg-purple-500",
                        item.color === 'orange' && "bg-orange-500"
                      )} />
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full",
                            item.color === 'blue' && "bg-blue-500",
                            item.color === 'green' && "bg-green-500",
                            item.color === 'purple' && "bg-purple-500",
                            item.color === 'orange' && "bg-orange-500"
                          )}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                الزوار حسب المنطقة
              </CardTitle>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
