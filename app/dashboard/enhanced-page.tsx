/**
 * صفحة لوحة التحكم الرئيسية المحسنة
 * Enhanced Main Dashboard Page
 *
 * تم تحسينها باستخدام نظام التصميم الموحد
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    Eye,
    FileText,
    MessageSquare,
    Plus,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// استيراد المكونات الموحدة
import {
    DataTable,
    PageHeader,
    StatsGrid
} from '@/components/design-system/DashboardComponents';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// أنواع البيانات
interface DashboardStats {
  title: string;
  value: number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

interface RecentActivity {
  id: string;
  type: 'article' | 'user' | 'comment';
  title: string;
  time: string;
  status: 'success' | 'warning' | 'danger' | 'info';
}

export default function EnhancedDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // تحميل البيانات
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // محاكاة تحميل البيانات
        await new Promise(resolve => setTimeout(resolve, 1000));

        setStats([
          {
            title: 'إجمالي المقالات',
            value: 1247,
            change: { value: 12, trend: 'up', period: 'هذا الشهر' },
            icon: <FileText className="w-6 h-6" />,
            color: 'blue'
          },
          {
            title: 'المستخدمون النشطون',
            value: 389,
            change: { value: 8, trend: 'up', period: 'هذا الأسبوع' },
            icon: <Users className="w-6 h-6" />,
            color: 'green'
          },
          {
            title: 'التعليقات الجديدة',
            value: 52,
            change: { value: -3, trend: 'down', period: 'اليوم' },
            icon: <MessageSquare className="w-6 h-6" />,
            color: 'purple'
          },
          {
            title: 'معدل المشاهدة',
            value: 94.2,
            change: { value: 5.1, trend: 'up', period: 'هذا الشهر' },
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'yellow'
          }
        ]);

        setRecentActivity([
          {
            id: '1',
            type: 'article',
            title: 'تم نشر مقال جديد: "تطورات الذكاء الاصطناعي"',
            time: 'منذ 5 دقائق',
            status: 'success'
          },
          {
            id: '2',
            type: 'user',
            title: 'انضم مستخدم جديد: أحمد محمد',
            time: 'منذ 15 دقيقة',
            status: 'info'
          },
          {
            id: '3',
            type: 'comment',
            title: 'تعليق جديد على مقال "مستقبل التكنولوجيا"',
            time: 'منذ 30 دقيقة',
            status: 'info'
          },
          {
            id: '4',
            type: 'article',
            title: 'تم تحديث مقال: "الأمن السيبراني"',
            time: 'منذ ساعة',
            status: 'warning'
          }
        ]);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // تحديد أعمدة جدول النشاط الأخير
  const activityColumns = [
    {
      key: 'title',
      label: 'النشاط',
      render: (value: string, item: RecentActivity) => (
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            item.status === 'success' ? 'bg-green-400' :
            item.status === 'warning' ? 'bg-yellow-400' :
            item.status === 'danger' ? 'bg-red-400' :
            'bg-blue-400'
          }`} />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'time',
      label: 'الوقت',
      width: '120px',
      render: (value: string) => (
        <span className="text-sm text-gray-500">{value}</span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* عنوان الصفحة */}
      <PageHeader
        title={`مرحباً ${user?.name || 'بك'}`}
        description="نظرة عامة على أداء منصة سبق الذكية"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 ml-2" />
              تقرير مفصل
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 ml-2" />
              إضافة محتوى
            </Button>
          </div>
        }
      />

      {/* الإحصائيات الرئيسية */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          الإحصائيات الرئيسية
        </h2>
        <StatsGrid stats={stats} />
      </section>

      {/* شبكة المحتوى */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* النشاط الأخير */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                النشاط الأخير
              </h3>
              <Button variant="ghost" size="sm">
                عرض الكل
                <ArrowUpRight className="w-4 h-4 mr-2" />
              </Button>
            </div>

            <DataTable
              data={recentActivity}
              columns={activityColumns}
              emptyMessage="لا توجد أنشطة حديثة"
            />
          </Card>
        </div>

        {/* الإجراءات السريعة */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              الإجراءات السريعة
            </h3>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => window.location.href = '/dashboard/articles/new'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="font-medium">إنشاء مقال جديد</div>
                    <div className="text-sm text-gray-500">اكتب محتوى جديد</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => window.location.href = '/dashboard/users'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="font-medium">إدارة المستخدمين</div>
                    <div className="text-sm text-gray-500">عرض وتحرير المستخدمين</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => window.location.href = '/dashboard/analytics'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="font-medium">التحليلات المتقدمة</div>
                    <div className="text-sm text-gray-500">تقارير وإحصائيات</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => window.location.href = '/dashboard/settings'}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-right">
                    <div className="font-medium">إعدادات النظام</div>
                    <div className="text-sm text-gray-500">تخصيص المنصة</div>
                  </div>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* مؤشرات الأداء */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          مؤشرات الأداء
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">المقالات المنشورة</h4>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              847
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                +12%
              </div>
              <span className="text-gray-500">من الشهر الماضي</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">متوسط وقت القراءة</h4>
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              3.2 دقيقة
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                +0.3
              </div>
              <span className="text-gray-500">من الأسبوع الماضي</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">معدل التفاعل</h4>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              89.4%
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                +2.1%
              </div>
              <span className="text-gray-500">من الشهر الماضي</span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
