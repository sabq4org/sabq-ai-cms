/**
 * لوحة التحكم الحديثة - بدون تخطيط مُشكِل
 * Modern Dashboard - Without Problematic Layout
 */

"use client";

import { useState, useEffect } from 'react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  ArrowUpRight,
  Settings,
  Plus
} from 'lucide-react';

export default function ModernDashboardPage() {
  const { darkMode } = useDarkModeContext();
  const [stats, setStats] = useState({
    totalUsers: 1248,
    totalArticles: 856,
    totalViews: 45230,
    totalComments: 324
  });

  return (
    <div className="p-6 space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            لوحة التحكم
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            إدارة منصة سبق الذكية
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة جديد
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقالات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              +8% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاهدات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              +15% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التعليقات</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              +5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              إدارة المقالات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              إضافة وتحرير ومراجعة المقالات والأخبار
            </p>
            <Button variant="outline" size="sm" className="w-full gap-2">
              الذهاب للمقالات
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              إدارة المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              إدارة حسابات المستخدمين والصلاحيات
            </p>
            <Button variant="outline" size="sm" className="w-full gap-2">
              الذهاب للمستخدمين
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              التحليلات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              عرض التقارير والإحصائيات التفصيلية
            </p>
            <Button variant="outline" size="sm" className="w-full gap-2">
              عرض التحليلات
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
