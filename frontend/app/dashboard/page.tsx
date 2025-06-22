'use client';

import React from 'react';
import { FileText, Users, Eye, MessageSquare, TrendingUp, Clock, Award, Activity } from 'lucide-react';
import { SabqCard } from '@/components/ui/SabqCard';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة التحكم الرئيسية</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">مرحباً بك في لوحة تحكم صحيفة سبق</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="sabq-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">المقالات اليوم</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">145</p>
              <p className="text-sm text-green-600 mt-2">+12% من الأمس</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="sabq-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">الزوار النشطون</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3,456</p>
              <p className="text-sm text-orange-600 mt-2">-2% من الأمس</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="sabq-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">التفاعلات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">892</p>
              <p className="text-sm text-green-600 mt-2">+23% من الأمس</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="sabq-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">المشاهدات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">23.5K</p>
              <p className="text-sm text-green-600 mt-2">+18% من الأمس</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/console">
          <SabqCard className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">لوحة سبق الذكية</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">مراقبة لحظية مع AI</p>
              </div>
            </div>
          </SabqCard>
        </Link>

        <Link href="/dashboard/articles">
          <SabqCard className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">إدارة المقالات</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">إنشاء وتحرير المحتوى</p>
              </div>
            </div>
          </SabqCard>
        </Link>

        <Link href="/dashboard/team">
          <SabqCard className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">إدارة الفريق</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">المستخدمين والصلاحيات</p>
              </div>
            </div>
          </SabqCard>
        </Link>
      </div>

      {/* نشاط حديث */}
      <SabqCard>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">النشاط الأخير</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">نشر مقال جديد</p>
                <p className="text-xs text-gray-500">بواسطة أحمد محمد - قبل 5 دقائق</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">انضمام عضو جديد</p>
                <p className="text-xs text-gray-500">سارة القحطاني - قبل 20 دقيقة</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">مقال يحقق رواجاً</p>
                <p className="text-xs text-gray-500">"الذكاء الاصطناعي في السعودية" - 15K مشاهدة</p>
              </div>
            </div>
          </div>
        </div>
      </SabqCard>
    </div>
  );
} 