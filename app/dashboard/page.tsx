'use client';

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useDarkModeContext } from '@/contexts/DarkModeContext'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { 
  FileText, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  BarChart3,
  Star,
  UserCheck,
  Calendar,
  Eye,
  Menu,
  X,
  Plus,
  Newspaper,
  FolderOpen,
  UserPlus,
  Zap,
  Brain,
  Lightbulb,
  Award,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Target,
  Sparkles,
  ChevronRight,
  PenTool,
  BookOpen,
  HeartHandshake,
  Rocket,
  PlusCircle
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('behavior');
  const { darkMode } = useDarkModeContext();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    points: 0,
    articles: 0,
    interactions: 0,
    categories: 0,
    activeUsers: 0,
    comments: 0,
    accuracy: 0,
    updates: 0,
    views: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  // جلب البيانات الحقيقية
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        // جلب بيانات المستخدمين
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        const usersArray = usersData.users || usersData.data || usersData || [];
        const totalUsers = Array.isArray(usersArray) ? usersArray.length : 0;
        // جلب بيانات المقالات
        const articlesRes = await fetch('/api/articles');
        const articlesData = await articlesRes.json();
        const articlesArray = articlesData.articles || articlesData.data || articlesData || [];
        const totalArticles = Array.isArray(articlesArray) ? articlesArray.length : 0;
        // جلب بيانات التصنيفات
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        // التعامل مع الهيكل الصحيح للبيانات المُرجعة من API
        const categoriesArray = categoriesData.data || categoriesData || [];
        const activeCategories = Array.isArray(categoriesArray) 
          ? categoriesArray.filter((cat: any) => cat.is_active).length 
          : 0;
        // جلب بيانات التفاعلات (إن وجدت)
        let totalInteractions = 0;
        let totalPoints = 0;
        try {
          const interactionsRes = await fetch('/api/interactions/all');
          if (interactionsRes.ok) {
            const interactionsData = await interactionsRes.json();
            totalInteractions = interactionsData.data?.length || 0;
          }
        } catch (error) {
          console.log('تفاعلات غير متوفرة');
        }
        // جلب بيانات النقاط (إن وجدت)
        try {
          const pointsRes = await fetch('/api/loyalty/stats');
          if (pointsRes.ok) {
            const pointsData = await pointsRes.json();
            totalPoints = pointsData.data?.totalPoints || 0;
          }
        } catch (error) {
          console.log('نقاط الولاء غير متوفرة');
        }
        // تحديث الإحصائيات بالبيانات الحقيقية
        setStats({
          users: totalUsers,
          points: totalPoints,
          articles: totalArticles,
          interactions: totalInteractions,
          categories: activeCategories,
          activeUsers: 0, // سيتم حسابه من بيانات التفاعل الحقيقية
          comments: 0, // سيتم ربطه بنظام التعليقات الحقيقي
          accuracy: 0, // سيتم حسابه من التحليلات الحقيقية
          updates: 0, // سيتم حسابه من سجل التحديثات
          views: 0
        });
        // تصفير بيانات الجدول (سيتم ملؤها بالبيانات الحقيقية لاحقاً)
        // setTableData([]); // This line was removed as per the new_code, as the tableData state was removed.
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, []);
  // مكون بطاقة الإحصائية الدائرية
  const CircularStatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor,
    textColor = 'text-gray-700'
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    textColor?: string;
  }) => (
    <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm mb-0.5 sm:mb-1 truncate transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-base sm:text-lg lg:text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{loading ? '...' : value}</span>
            <span className={`text-xs hidden sm:inline transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
  // مكون الجدول - محسّن للموبايل
  const DataTable = () => {
    // ألوان الجدول حسب الوضع
    const tableColors = {
      headerBg: darkMode ? '#1e3a5f' : '#f0fdff',
      headerBorder: darkMode ? '#2563eb' : '#dde9fc',
      cellBorder: darkMode ? '#374151' : '#f4f8fe',
      containerBg: darkMode ? 'bg-gray-800' : 'bg-white',
      containerBorder: darkMode ? 'border-gray-700' : 'border-gray-100',
      titleText: darkMode ? 'text-white' : 'text-gray-800',
      headerText: darkMode ? 'text-gray-200' : 'text-gray-700',
      bodyText: darkMode ? 'text-gray-300' : 'text-gray-900',
      subText: darkMode ? 'text-gray-400' : 'text-gray-600',
      hoverBg: darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'
    };
    // عرض بطاقات للموبايل بدلاً من الجدول
    const MobileCard = ({ row }: { row: any }) => (
      <div className={`${tableColors.containerBg} rounded-lg p-4 border ${tableColors.containerBorder} mb-3`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className={`font-medium ${tableColors.bodyText}`}>{row.user}</h4>
          <span className="text-xs font-semibold text-green-500">{row.accuracy}</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className={tableColors.subText}>التصنيف:</span>
            <span className={tableColors.bodyText}>{row.classification}</span>
          </div>
          <div className="flex justify-between">
            <span className={tableColors.subText}>الفئة المفضلة:</span>
            <span className={tableColors.bodyText}>{row.category}</span>
          </div>
          <div className="flex justify-between">
            <span className={tableColors.subText}>التفاعلات:</span>
            <span className="font-medium text-blue-500">{row.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={tableColors.subText}>نقاط التفاعل:</span>
            <div className="flex items-center gap-2">
              <div className={`w-16 rounded-full h-1.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${row.engagement}%` }}
                ></div>
              </div>
              <span className={`text-xs ${tableColors.subText}`}>{row.engagement}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className={tableColors.subText}>آخر نشاط:</span>
            <span className={tableColors.subText}>{row.activity}</span>
          </div>
        </div>
      </div>
    );
    return (
      <>
        {/* عرض الجدول للشاشات الكبيرة */}
        <div className={`hidden md:block ${tableColors.containerBg} rounded-2xl shadow-sm border ${tableColors.containerBorder} overflow-hidden transition-colors duration-300`}>
          <div className="px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${tableColors.cellBorder}` }}>
            <h3 className={`text-base sm:text-lg font-semibold ${tableColors.titleText} transition-colors duration-300`}>
              سلوك المستخدمين الأكثر نشاطاً
            </h3>
          </div>
          {/* جدول متجاوب */}
          <div className="overflow-x-auto">
            {/* رأس الجدول */}
            <div 
              style={{ 
                backgroundColor: tableColors.headerBg,
                borderBottom: `2px solid ${tableColors.headerBorder}`
              }}
              className="min-w-[800px]"
            >
              <div className="grid grid-cols-7 gap-4 px-4 sm:px-6 py-4">
                <div className={`text-xs sm:text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>الفئات المفضلة</div>
                <div className={`text-xs sm:text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>دقة التفضيلات</div>
                <div className={`text-xs sm:text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>آخر نشاط</div>
                <div className={`text-xs sm:text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>نقاط التفاعل</div>
                <div className={`text-xs sm:text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>إجمالي التفاعلات</div>
                <div className={`text-xs sm:text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>المستخدم</div>
                <div className={`text-xs sm:text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>تصنيف العميق</div>
              </div>
            </div>
            {/* بيانات الجدول */}
            <div style={{ borderColor: tableColors.cellBorder }} className="divide-y min-w-[800px]">
              {loading ? (
                <div className="text-center py-8">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    جارٍ تحميل البيانات...
                  </p>
                </div>
              ) : // tableData.length === 0 ? ( // This line was removed as per the new_code, as the tableData state was removed.
                (
                <div className="text-center py-8">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    لا توجد بيانات متاحة حالياً
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* عرض البطاقات للموبايل */}
        <div className={`md:hidden ${tableColors.containerBg} rounded-xl p-4 border ${tableColors.containerBorder}`}>
          <h3 className={`text-base font-semibold ${tableColors.titleText} mb-4`}>
            سلوك المستخدمين الأكثر نشاطاً
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                جارٍ تحميل البيانات...
              </p>
            </div>
          ) : // tableData.length === 0 ? ( // This line was removed as per the new_code, as the tableData state was removed.
            (
            <div className="text-center py-8">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                لا توجد بيانات متاحة حالياً
              </p>
            </div>
          )}
        </div>
      </>
    );
  };
  const menuItems = [
    { href: '/dashboard/news', icon: FileText, label: 'المقالات' },
    { href: '/dashboard/categories', icon: BarChart3, label: 'التصنيفات' },
    { href: '/dashboard/users', icon: Users, label: 'المستخدمين' },
    { href: '/dashboard/analytics', icon: TrendingUp, label: 'التحليلات' },
    { href: '/dashboard/comments', icon: MessageSquare, label: 'التعليقات' },
    { href: '/dashboard/settings', icon: Calendar, label: 'الإعدادات' }
  ];
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* قسم الترحيب */}
        <div className="mb-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                مرحباً، {user?.name || 'المسؤول'}! 👋
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                سعداء بعودتك. إليك نظرة سريعة على آخر أنشطتك ومهامك.
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                النظام يعمل بكفاءة
              </span>
            </div>
          </div>
        </div>

        {/* بطاقات الوصول السريع */}
        <div className="mb-10">
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Zap className="w-5 h-5 text-yellow-500" />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* إضافة مقال */}
            <Link href="/dashboard/article/new" className="group">
              <div className={`relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700 hover:border-blue-600' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:border-blue-300'
              }`}>
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className={`relative z-10 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-blue-800' : 'bg-blue-500'
                }`}>
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  إضافة مقال
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  أنشئ محتوى جديد
                </p>
              </div>
            </Link>

            {/* إضافة خبر عاجل */}
            <Link href="/dashboard/article/new?breaking=true" className="group">
              <div className={`relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-red-900/50 to-red-800/50 border border-red-700 hover:border-red-600' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200 hover:border-red-300'
              }`}>
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-red-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className={`relative z-10 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-red-800' : 'bg-red-500'
                }`}>
                  <Newspaper className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  خبر عاجل
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  انشر خبراً عاجلاً
                </p>
              </div>
            </Link>

            {/* إدارة التصنيفات */}
            <Link href="/dashboard/categories" className="group">
              <div className={`relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-700 hover:border-purple-600' 
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:border-purple-300'
              }`}>
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className={`relative z-10 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-purple-800' : 'bg-purple-500'
                }`}>
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  التصنيفات
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  نظم المحتوى
                </p>
              </div>
            </Link>

            {/* إدارة المستخدمين */}
            <Link href="/dashboard/users" className="group">
              <div className={`relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-700 hover:border-green-600' 
                  : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:border-green-300'
              }`}>
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-green-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className={`relative z-10 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-green-800' : 'bg-green-500'
                }`}>
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  المستخدمون
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  إدارة الأعضاء
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* الإحصائيات المباشرة */}
        <div className="mb-10">
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-5 h-5 text-blue-500" />
            إحصائيات مباشرة
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* عدد المقالات */}
            <div className={`rounded-xl p-6 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  12%
                </span>
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '...' : stats.articles.toLocaleString()}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                إجمالي المقالات
              </p>
            </div>

            {/* عدد الأخبار */}
            <div className={`rounded-xl p-6 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <Newspaper className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  8%
                </span>
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '...' : '245'}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                الأخبار العاجلة
              </p>
            </div>

            {/* عدد المستخدمين */}
            <div className={`rounded-xl p-6 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  23%
                </span>
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '...' : stats.users.toLocaleString()}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                المستخدمون النشطون
              </p>
            </div>

            {/* عدد التعليقات */}
            <div className={`rounded-xl p-6 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                  <MessageSquare className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 rotate-90" />
                  5%
                </span>
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '...' : stats.comments.toLocaleString()}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                التعليقات الجديدة
              </p>
            </div>
          </div>
        </div>

        {/* نشاط المستخدم والاقتراحات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* رسم بياني لنشاط المستخدم */}
          <div className={`lg:col-span-2 rounded-xl p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Activity className="w-5 h-5 text-indigo-500" />
              نشاط الموقع خلال الأسبوع الماضي
            </h3>
            
            {/* رسم بياني بسيط */}
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {[65, 80, 45, 90, 120, 95, 110].map((height, index) => {
                  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative flex items-end h-48">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500 hover:from-indigo-600 hover:to-indigo-500"
                          style={{ height: `${(height / 120) * 100}%` }}
                        >
                          <span className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {height}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {days[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    مقالات منشورة
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    زوار جدد
                  </span>
                </div>
              </div>
              <Link href="/dashboard/analytics" className={`text-sm font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1`}>
                عرض التفاصيل
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* اقتراحات ذكية */}
          <div className={`rounded-xl p-6 ${
            darkMode ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-800' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              اقتراحات ذكية
            </h3>
            
            <div className="space-y-4">
              {/* اقتراح 1 */}
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <PenTool className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      أضف تحليلاً عميقاً
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      لم تنشر تحليلاً هذا الأسبوع
                    </p>
                  </div>
                </div>
              </div>

              {/* اقتراح 2 */}
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      مقالات تحتاج مراجعة
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      5 مقالات لم يتم التفاعل معها
                    </p>
                  </div>
                </div>
              </div>

              {/* اقتراح 3 */}
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Target className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      هدف الأسبوع
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      أنت على بعد 3 مقالات من هدفك
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button className={`w-full mt-6 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              darkMode 
                ? 'bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 border border-purple-700' 
                : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300'
            }`}>
              عرض جميع الاقتراحات
            </button>
          </div>
        </div>

        {/* الأنشطة الأخيرة والمقالات الشائعة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الأنشطة الأخيرة */}
          <div className={`rounded-xl p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center justify-between ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                الأنشطة الأخيرة
              </span>
              <Link href="/dashboard/activities" className="text-sm text-blue-500 hover:text-blue-600">
                عرض الكل
              </Link>
            </h3>
            
            <div className="space-y-4">
              {[
                { icon: FileText, color: 'blue', title: 'مقال جديد', desc: 'تم نشر "تطورات الذكاء الاصطناعي"', time: 'منذ 5 دقائق' },
                { icon: UserPlus, color: 'green', title: 'مستخدم جديد', desc: 'انضم أحمد محمد للموقع', time: 'منذ 12 دقيقة' },
                { icon: MessageSquare, color: 'purple', title: 'تعليق جديد', desc: 'على مقال "مستقبل التقنية"', time: 'منذ ساعة' },
                { icon: Award, color: 'yellow', title: 'إنجاز مفتوح', desc: 'حصل 10 مستخدمين على وسام القارئ', time: 'منذ ساعتين' },
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                    <div className={`p-2 rounded-lg bg-${activity.color}-500/10`}>
                      <Icon className={`w-4 h-4 text-${activity.color}-500`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.title}
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {activity.desc}
                      </p>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* المقالات الأكثر قراءة */}
          <div className={`rounded-xl p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center justify-between ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                الأكثر قراءة اليوم
              </span>
              <Link href="/dashboard/analytics/articles" className="text-sm text-green-500 hover:text-green-600">
                عرض الكل
              </Link>
            </h3>
            
            <div className="space-y-4">
              {[
                { rank: 1, title: 'تطورات الذكاء الاصطناعي في 2024', views: '12.5K', trend: 'up' },
                { rank: 2, title: 'دليل شامل للاستثمار في العملات الرقمية', views: '8.3K', trend: 'up' },
                { rank: 3, title: 'مستقبل السيارات الكهربائية في المملكة', views: '6.7K', trend: 'down' },
                { rank: 4, title: 'أفضل التطبيقات لتعلم البرمجة', views: '5.2K', trend: 'up' },
              ].map((article) => (
                <div key={article.rank} className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    article.rank === 1 ? 'bg-yellow-500 text-white' :
                    article.rank === 2 ? 'bg-gray-400 text-white' :
                    article.rank === 3 ? 'bg-orange-600 text-white' :
                    darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {article.rank}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium line-clamp-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {article.views} مشاهدة
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${
                        article.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <ArrowUpRight className={`w-3 h-3 ${article.trend === 'down' ? 'rotate-90' : ''}`} />
                        {article.trend === 'up' ? '+12%' : '-5%'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* شريط الإجراءات السريعة في الأسفل */}
        <div className={`mt-10 p-6 rounded-xl ${
          darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600' : 'bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                هل تحتاج للمساعدة؟
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                تصفح دليل المستخدم أو تواصل مع فريق الدعم
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/help" className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}>
                <BookOpen className="w-4 h-4 inline ml-2" />
                دليل المستخدم
              </Link>
              <Link href="/dashboard/support" className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}>
                <HeartHandshake className="w-4 h-4 inline ml-2" />
                الدعم الفني
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}