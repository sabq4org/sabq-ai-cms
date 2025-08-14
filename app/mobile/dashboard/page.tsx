/**
 * 📱 لوحة التحكم المخصصة للهواتف الذكية
 * تصميم منفصل تمامًا مع تجربة مثالية للأجهزة المحمولة
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Edit3, 
  Users, 
  BarChart3, 
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Clock,
  Settings,
  Moon,
  Sun,
  Smartphone,
  Zap,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface DashboardData {
  articles: {
    total: number;
    published: number;
    drafts: number;
    pending: number;
  };
  analytics: {
    views: number;
    engagement: number;
    growth: number;
  };
  notifications: number;
  recentActivities: Array<{
    id: string;
    type: 'article' | 'comment' | 'user';
    title: string;
    time: string;
    status: 'success' | 'warning' | 'info';
  }>;
}

export default function MobileDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    articles: { total: 0, published: 0, drafts: 0, pending: 0 },
    analytics: { views: 0, engagement: 0, growth: 0 },
    notifications: 0,
    recentActivities: []
  });

  // تحديد الوضع الداكن تلقائيًا حسب إعدادات الجهاز
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // تحميل بيانات اللوحة
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // محاكاة تحميل البيانات - استبدل بـ API حقيقي
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDashboardData({
        articles: {
          total: 127,
          published: 98,
          drafts: 23,
          pending: 6
        },
        analytics: {
          views: 45780,
          engagement: 87,
          growth: 12.5
        },
        notifications: 8,
        recentActivities: [
          {
            id: '1',
            type: 'article',
            title: 'تم نشر مقال جديد: التقنية في 2025',
            time: 'منذ 5 دقائق',
            status: 'success'
          },
          {
            id: '2',
            type: 'comment',
            title: 'تعليق جديد على مقال الاقتصاد',
            time: 'منذ 15 دقيقة',
            status: 'info'
          },
          {
            id: '3',
            type: 'user',
            title: 'مستخدم جديد انضم للمنصة',
            time: 'منذ ساعة',
            status: 'success'
          }
        ]
      });
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className={`text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            جاري تحميل لوحة التحكم...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* شريط علوي محسن للهاتف */}
      <div className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-colors ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                لوحة التحكم
              </h1>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                النسخة المحمولة
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-xl ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`w-10 h-10 rounded-xl relative ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Bell className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`} />
              {dashboardData.notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {dashboardData.notifications}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* بطاقات الإحصائيات السريعة */}
        <div className="grid grid-cols-2 gap-3">
          <Card className={`border-0 shadow-lg ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30' 
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">إجمالي المقالات</p>
                  <p className="text-white text-2xl font-bold">
                    {dashboardData.articles.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-0 shadow-lg ${
            isDarkMode 
              ? 'bg-gradient-to-br from-green-900/50 to-green-800/30' 
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">المشاهدات</p>
                  <p className="text-white text-2xl font-bold">
                    {(dashboardData.analytics.views / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* بطاقة التفاعل والنمو */}
        <Card className={`border-0 shadow-lg ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                الأداء اليومي
              </h3>
              <Badge variant="outline" className={`${
                isDarkMode 
                  ? 'border-green-600 text-green-400' 
                  : 'border-green-600 text-green-600'
              }`}>
                +{dashboardData.analytics.growth}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  معدل التفاعل
                </span>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {dashboardData.analytics.engagement}%
                </span>
              </div>
              <Progress 
                value={dashboardData.analytics.engagement} 
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {dashboardData.articles.published}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  منشور
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {dashboardData.articles.drafts}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  مسودة
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {dashboardData.articles.pending}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  معلق
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* النشاطات الأخيرة */}
        <Card className={`border-0 shadow-lg ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                النشاطات الأخيرة
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDashboardData}
                className="w-8 h-8 p-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.status === 'success' 
                    ? (isDarkMode ? 'bg-green-900/50' : 'bg-green-100')
                    : activity.status === 'warning'
                    ? (isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100')
                    : (isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100')
                }`}>
                  {activity.type === 'article' && (
                    <Edit3 className={`w-4 h-4 ${
                      activity.status === 'success' 
                        ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                        : (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                    }`} />
                  )}
                  {activity.type === 'comment' && (
                    <MessageSquare className={`w-4 h-4 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  )}
                  {activity.type === 'user' && (
                    <Users className={`w-4 h-4 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {activity.title}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* أزرار الإجراءات السريعة */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className={`h-14 text-base font-medium ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-xl shadow-lg`}
          >
            <Plus className="w-5 h-5 mr-2" />
            مقال جديد
          </Button>
          
          <Button
            variant="outline"
            className={`h-14 text-base font-medium rounded-xl ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            التقارير
          </Button>
        </div>

        {/* مساحة إضافية للتمرير المريح */}
        <div className="h-20"></div>
      </div>

      {/* شريط تنقل سفلي */}
      <div className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-lg ${
        isDarkMode 
          ? 'bg-gray-900/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="grid grid-cols-4 p-2">
          {[
            { icon: BarChart3, label: 'الرئيسية', active: true, href: '/mobile/dashboard' },
            { icon: Edit3, label: 'المقالات', active: false, href: '/mobile/articles' },
            { icon: Users, label: 'المستخدمين', active: false, href: '/admin/users' },
            { icon: Settings, label: 'الإعدادات', active: false, href: '/mobile/settings' }
          ].map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => {
                if (item.href) {
                  window.location.href = item.href;
                }
              }}
              className={`flex flex-row items-center gap-2 h-16 px-4 cursor-pointer ${
                item.active 
                  ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
