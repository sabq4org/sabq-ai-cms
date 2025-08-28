/**
 * صفحة اختبار حل مشكلة التمدد
 * Test Page for Full Width Solution
 */

'use client';

import Image from 'next/image';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { SidebarPreferencesProvider } from '@/contexts/SidebarPreferencesContext';
import { DesignComponents } from '@/components/design-system/DesignSystemGuide';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    Eye,
    FileText,
    Heart,
    MessageCircle,
    Share,
    TrendingUp,
    Users
} from 'lucide-react';

// بيانات تجريبية للاختبار
const statsData = [
  { title: 'إجمالي المقالات', value: '2,847', change: '+12%', icon: FileText, color: 'text-blue-600' },
  { title: 'المشتركون', value: '45,231', change: '+8%', icon: Users, color: 'text-green-600' },
  { title: 'المشاهدات', value: '892,456', change: '+23%', icon: Eye, color: 'text-purple-600' },
  { title: 'التفاعل', value: '34,521', change: '+15%', icon: Heart, color: 'text-red-600' },
];

const articlesData = [
  { title: 'الذكاء الاصطناعي في التعليم السعودي', views: '12,543', comments: '89', likes: '342' },
  { title: 'رؤية 2030 والتحول الرقمي', views: '8,921', comments: '156', likes: '567' },
  { title: 'مستقبل الطاقة المتجددة في المملكة', views: '15,678', comments: '234', likes: '789' },
  { title: 'الأمن السيبراني والحماية الرقمية', views: '6,789', comments: '67', likes: '234' },
  { title: 'الابتكار في قطاع الصحة', views: '9,876', comments: '123', likes: '456' },
];

export default function FullWidthTestPage() {
  return (
    <SidebarPreferencesProvider>
      <DashboardLayout
        pageTitle="اختبار حل التمدد الكامل"
        pageDescription="صفحة لاختبار حل مشكلة عدم التمدد على الشاشات الكبيرة"
      >
      <div className="space-y-8">
        {/* رسالة الترحيب والإرشادات */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                ✅ تم حل مشكلة التمدد بنجاح!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                لوحة التحكم الآن تتمدد تلقائياً على جميع أحجام الشاشات. ابحث عن زر التحكم في العرض على الجانب الأيسر من الشاشة.
              </p>
              <div className="flex gap-3">
                <DesignComponents.StatusIndicator status="success" text="تم حل المشكلة" />
                <DesignComponents.StatusIndicator status="info" text="دعم الشاشات الكبيرة" />
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* إحصائيات المنصة */}
        <div>
          <DesignComponents.SectionHeader
            title="إحصائيات المنصة"
            description="البيانات الرئيسية للمنصة - لاحظ كيف تتوزع البطاقات بجمال على عرض الشاشة"
            action={
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 ml-2" />
                تقرير مفصل
              </Button>
            }
          />

          <DesignComponents.DynamicGrid minItemWidth="280px" className="mb-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <DesignComponents.StandardCard key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </DesignComponents.StandardCard>
              );
            })}
          </DesignComponents.DynamicGrid>
        </div>

        {/* جدول المقالات الحديثة */}
        <div>
          <DesignComponents.SectionHeader
            title="المقالات الحديثة"
            description="أحدث المقالات المنشورة - الجدول يتمدد كاملاً الآن"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">عرض الكل</Button>
                <Button size="sm">
                  <FileText className="w-4 h-4 ml-2" />
                  مقال جديد
                </Button>
              </DesignComponents.ActionBar>
            }
          />

          <DesignComponents.StandardCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      العنوان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      المشاهدات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      التعليقات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الإعجابات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {articlesData.map((article, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center ml-3">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                            {article.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Eye className="w-4 h-4 ml-1" />
                          {article.views}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MessageCircle className="w-4 h-4 ml-1" />
                          {article.comments}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Heart className="w-4 h-4 ml-1" />
                          {article.likes}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">تحرير</Button>
                          <Button variant="ghost" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DesignComponents.StandardCard>
        </div>

        {/* رسالة النجاح النهائية */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              🎉 المشكلة تم حلها بنجاح!
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              لوحة التحكم الآن تتمدد بجمال على جميع أحجام الشاشات - من الهاتف إلى شاشة 8K!
            </p>
            <div className="flex justify-center gap-4">
              <DesignComponents.StatusIndicator status="success" text="تم التطبيق" />
              <DesignComponents.StatusIndicator status="info" text="مُختبر" />
              <DesignComponents.StatusIndicator status="success" text="جاهز للإنتاج" />
            </div>
          </div>
        </DesignComponents.StandardCard>
      </div>
      </DashboardLayout>
    </SidebarPreferencesProvider>
  );
}
