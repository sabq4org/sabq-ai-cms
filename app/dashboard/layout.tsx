'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell,
  User,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Activity,
  BarChart3,
  LogOut,
  Folder,
  Trophy,
  Brain,
  Target,
  Database,
  Zap,
  Shield,
  Menu,
  X,
  Mail
} from 'lucide-react';
import { getCurrentUser, logActions } from '@/lib/log-activity';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { darkMode } = useDarkMode();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    // الحصول على معلومات المستخدم الحالي
    const userInfo = getCurrentUser();
    
    // تسجيل حدث تسجيل الخروج
    await logActions.logout(userInfo);
    
    // حذف معلومات المستخدم من localStorage
    localStorage.removeItem('currentUser');
    
    // توجيه المستخدم إلى صفحة تسجيل الدخول
    window.location.href = '/login';
  };

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // إغلاق الـ sidebar عند تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ease-in-out ${
        darkMode ? 'bg-gray-900' : 'bg-slate-50'
      }`}
      style={{
        fontFamily: 'Tajawal, system-ui, -apple-system, "Segoe UI", "Noto Sans Arabic", Arial, sans-serif',
        direction: 'rtl'
      }}
    >
      {/* مؤشر حالة الوضع الليلي */}
      {darkMode && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 z-50 animate-pulse"></div>
      )}
      
      {/* Header الموحد للوحة التحكم */}
      <header className={`shadow-sm border-b px-4 sm:px-6 py-4 sm:py-6 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          {/* الجهة اليمنى - القائمة واللوجو والعنوان */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* زر القائمة للموبايل */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">س</span>
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>لوحة تحكم سبق</h1>
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>نسخة 1.0</p>
            </div>
          </div>
        
          {/* الجهة اليسرى - الأدوات */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* زر التبديل للوضع الليلي */}
            <DarkModeToggle />

            {/* الإشعارات */}
            <button className={`relative p-2 rounded-lg transition-colors duration-300 ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}>
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </button>

            {/* الملف الشخصي */}
            <div className="relative profile-menu-container">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2 sm:gap-3 cursor-pointer rounded-lg p-1 sm:p-2 transition-colors duration-300 ${
                  darkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-right">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>علي الحازمي</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>مدير النظام</p>
                </div>
                <ChevronDown className={`hidden sm:block w-4 h-4 transition-transform duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-400'
                } ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* قائمة الملف الشخصي المنسدلة */}
              {showProfileMenu && (
                <div className={`absolute left-0 mt-2 w-48 rounded-lg shadow-lg border transition-all duration-200 z-50 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-opacity-10 transition-colors duration-200 rounded-t-lg ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-white' 
                        : 'text-gray-700 hover:bg-gray-500'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">الملف الشخصي</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-opacity-10 transition-colors duration-200 ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-white' 
                        : 'text-gray-700 hover:bg-gray-500'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">الإعدادات</span>
                  </Link>
                  
                  <hr className={`my-1 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                  
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-4 py-3 w-full text-right hover:bg-opacity-10 transition-colors duration-200 rounded-b-lg ${
                      darkMode 
                        ? 'text-red-400 hover:bg-red-500' 
                        : 'text-red-600 hover:bg-red-500'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay للموبايل */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* القائمة الجانبية اليمنى */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 fixed lg:relative w-72 shadow-xl border-l min-h-screen transition-all duration-300 z-50 ${
          darkMode 
            ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' 
            : 'bg-gradient-to-b from-slate-50 to-white border-gray-100'
        }`}>
          {/* زر إغلاق للموبايل */}
          <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              القائمة الرئيسية
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-4rem)] lg:max-h-full">
            {/* شارة الحالة */}
            <div className={`p-4 rounded-xl border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700' 
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-green-300' : 'text-green-800'
                  }`}>النظام يعمل بشكل طبيعي</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`}>آخر تحديث: الآن</p>
                </div>
              </div>
            </div>

            
            {/* قائمة التنقل الأنيقة */}
            <nav className="mt-8 space-y-2">
              <Link 
                href="/dashboard" 
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 hover:text-blue-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-blue-900/40 group-hover:bg-blue-500 group-hover:text-white' 
                    : 'bg-blue-100 group-hover:bg-blue-500 group-hover:text-white'
                }`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">لوحة التحكم</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-blue-300' 
                      : 'text-gray-500 group-hover:text-blue-600'
                  }`}>الرئيسية</p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link 
                href="/dashboard/news" 
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-green-900/30 hover:to-emerald-900/30 hover:text-green-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-green-900/40 group-hover:bg-green-500 group-hover:text-white' 
                    : 'bg-green-100 group-hover:bg-green-500 group-hover:text-white'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">إدارة الأخبار</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-green-300' 
                      : 'text-gray-500 group-hover:text-green-600'
                  }`}>المقالات والمحتوى</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-green-900/40 text-green-300 group-hover:bg-green-500 group-hover:text-white' 
                    : 'bg-green-100 text-green-700 group-hover:bg-green-500 group-hover:text-white'
                }`}>
                  24
                </div>
              </Link>

              <Link 
                href="/dashboard/categories" 
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-indigo-900/30 hover:to-blue-900/30 hover:text-indigo-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 hover:text-indigo-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-indigo-900/40 group-hover:bg-indigo-500 group-hover:text-white' 
                    : 'bg-indigo-100 group-hover:bg-indigo-500 group-hover:text-white'
                }`}>
                  <Folder className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">التصنيفات</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-indigo-300' 
                      : 'text-gray-500 group-hover:text-indigo-600'
                  }`}>إدارة الأقسام</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-indigo-900/40 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white' 
                    : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-500 group-hover:text-white'
                }`}>
                  7
                </div>
              </Link>

              <Link 
                href="/dashboard/users" 
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-pink-900/30 hover:text-purple-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-purple-900/40 group-hover:bg-purple-500 group-hover:text-white' 
                    : 'bg-purple-100 group-hover:bg-purple-500 group-hover:text-white'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">المستخدمون</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-purple-300' 
                      : 'text-gray-500 group-hover:text-purple-600'
                  }`}>إدارة المستخدمين</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-purple-900/40 text-purple-300 group-hover:bg-purple-500 group-hover:text-white' 
                    : 'bg-purple-100 text-purple-700 group-hover:bg-purple-500 group-hover:text-white'
                }`}>
                  1.2M
                </div>
              </Link>

              <Link 
                href="/dashboard/messages" 
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-amber-900/30 hover:to-orange-900/30 hover:text-amber-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-amber-900/40 group-hover:bg-amber-500 group-hover:text-white' 
                    : 'bg-amber-100 group-hover:bg-amber-500 group-hover:text-white'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">صندوق الرسائل</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-amber-300' 
                      : 'text-gray-500 group-hover:text-amber-600'
                  }`}>رسائل المستخدمين</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-amber-900/40 text-amber-300 group-hover:bg-amber-500 group-hover:text-white' 
                    : 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                }`}>
                  جديد
                </div>
              </Link>

              <Link href="/dashboard/console" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-cyan-900/30 hover:to-teal-900/30 hover:text-cyan-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-cyan-900/40 group-hover:bg-cyan-500 group-hover:text-white' 
                    : 'bg-cyan-100 group-hover:bg-cyan-500 group-hover:text-white'
                }`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">وحدة التحكم</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-cyan-300' 
                      : 'text-gray-500 group-hover:text-cyan-600'
                  }`}>الإحصائيات والتقارير</p>
                </div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link href="/dashboard/loyalty" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-yellow-900/30 hover:to-orange-900/30 hover:text-yellow-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:text-yellow-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-yellow-900/40 group-hover:bg-yellow-500 group-hover:text-white' 
                    : 'bg-yellow-100 group-hover:bg-yellow-500 group-hover:text-white'
                }`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">برنامج الولاء</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-yellow-300' 
                      : 'text-gray-500 group-hover:text-yellow-600'
                  }`}>النقاط والمكافآت</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-yellow-900/40 text-yellow-300 group-hover:bg-yellow-500 group-hover:text-white' 
                    : 'bg-yellow-100 text-yellow-700 group-hover:bg-yellow-500 group-hover:text-white'
                }`}>
                  456K
                </div>
              </Link>

              <Link href="/dashboard/preferences" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-pink-900/30 hover:to-rose-900/30 hover:text-pink-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-pink-900/40 group-hover:bg-pink-500 group-hover:text-white' 
                    : 'bg-pink-100 group-hover:bg-pink-500 group-hover:text-white'
                }`}>
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">التفضيلات الذكية</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-pink-300' 
                      : 'text-gray-500 group-hover:text-pink-600'
                  }`}>تحليل الاهتمامات</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-pink-900/40 text-pink-300 group-hover:bg-pink-500 group-hover:text-white' 
                    : 'bg-pink-100 text-pink-700 group-hover:bg-pink-500 group-hover:text-white'
                }`}>
                  AI
                </div>
              </Link>

              <Link href="/dashboard/personalization" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-teal-900/30 hover:to-cyan-900/30 hover:text-teal-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-teal-900/40 group-hover:bg-teal-500 group-hover:text-white' 
                    : 'bg-teal-100 group-hover:bg-teal-500 group-hover:text-white'
                }`}>
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">التخصيص الذكي</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-teal-300' 
                      : 'text-gray-500 group-hover:text-teal-600'
                  }`}>تجربة مخصصة</p>
                </div>
                <div className="w-2 h-2 bg-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link href="/dashboard/analytics" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-emerald-900/30 hover:to-green-900/30 hover:text-emerald-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-emerald-900/40 group-hover:bg-emerald-500 group-hover:text-white' 
                    : 'bg-emerald-100 group-hover:bg-emerald-500 group-hover:text-white'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">تحليلات AI</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-emerald-300' 
                      : 'text-gray-500 group-hover:text-emerald-600'
                  }`}>الذكاء الاصطناعي</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-emerald-900/40 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white' 
                    : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white'
                }`}>
                  12
                </div>
              </Link>

              <Link href="/newspaper" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-red-900/30 hover:to-pink-900/30 hover:text-red-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-red-900/40 group-hover:bg-red-500 group-hover:text-white' 
                    : 'bg-red-100 group-hover:bg-red-500 group-hover:text-white'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">سبق الذكية</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-red-300' 
                      : 'text-gray-500 group-hover:text-red-600'
                  }`}>الواجهة التفاعلية</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-red-900/40 text-red-300 group-hover:bg-red-500 group-hover:text-white' 
                    : 'bg-red-100 text-red-700 group-hover:bg-red-500 group-hover:text-white'
                }`}>
                  🧠
                </div>
              </Link>

              <Link href="/dashboard/settings" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-slate-800 hover:text-gray-200' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:text-gray-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 group-hover:bg-gray-500 group-hover:text-white' 
                    : 'bg-gray-100 group-hover:bg-gray-500 group-hover:text-white'
                }`}>
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">الإعدادات</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-gray-300' 
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`}>تخصيص النظام</p>
                </div>
                <div className="w-2 h-2 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link href="/dashboard/activities" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-orange-900/30 hover:to-red-900/30 hover:text-orange-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-orange-900/40 group-hover:bg-orange-500 group-hover:text-white' 
                    : 'bg-orange-100 group-hover:bg-orange-500 group-hover:text-white'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">الأنشطة</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-orange-300' 
                      : 'text-gray-500 group-hover:text-orange-600'
                  }`}>تتبع العمليات</p>
                </div>
                <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link href="/dashboard/system/logs" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-indigo-900/30 hover:to-purple-900/30 hover:text-indigo-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-indigo-900/40 group-hover:bg-indigo-500 group-hover:text-white' 
                    : 'bg-indigo-100 group-hover:bg-indigo-500 group-hover:text-white'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">سجلات النظام</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-indigo-300' 
                      : 'text-gray-500 group-hover:text-indigo-600'
                  }`}>المراقبة الأمنية</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  darkMode 
                    ? 'bg-indigo-900/40 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white' 
                    : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-500 group-hover:text-white'
                }`}>
                  🔐
                </div>
              </Link>

              <Link href="/dashboard/roles" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-cyan-900/30 hover:to-blue-900/30 hover:text-cyan-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-cyan-900/40 group-hover:bg-cyan-500 group-hover:text-white' 
                    : 'bg-cyan-100 group-hover:bg-cyan-500 group-hover:text-white'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">الأدوار</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-cyan-300' 
                      : 'text-gray-500 group-hover:text-cyan-600'
                  }`}>إدارة الصلاحيات</p>
                </div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link href="/dashboard/team" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-emerald-900/30 hover:to-green-900/30 hover:text-emerald-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:text-emerald-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-emerald-900/40 group-hover:bg-emerald-500 group-hover:text-white' 
                    : 'bg-emerald-100 group-hover:bg-emerald-500 group-hover:text-white'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">الفريق</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-emerald-300' 
                      : 'text-gray-500 group-hover:text-emerald-600'
                  }`}>إدارة الأعضاء</p>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link href="/dashboard/templates" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md hover:translate-x-1 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-violet-900/30 hover:to-purple-900/30 hover:text-violet-300' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-700'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-violet-900/40 group-hover:bg-violet-500 group-hover:text-white' 
                    : 'bg-violet-100 group-hover:bg-violet-500 group-hover:text-white'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">القوالب</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'text-gray-400 group-hover:text-violet-300' 
                      : 'text-gray-500 group-hover:text-violet-600'
                  }`}>تصميم الصفحات</p>
                </div>
                <div className="w-2 h-2 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </nav>

            {/* زر تسجيل الخروج المميز */}
            <div className={`mt-8 pt-6 border-t transition-colors duration-300 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-md w-full ${
                darkMode 
                  ? 'text-red-400 hover:bg-gradient-to-r hover:from-red-900/30 hover:to-pink-900/30 hover:text-red-300' 
                  : 'text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-red-900/40 group-hover:bg-red-500 group-hover:text-white' 
                    : 'bg-red-100 group-hover:bg-red-500 group-hover:text-white'
                }`}>
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="flex-1 text-right">
                  <span className="font-medium">تسجيل الخروج</span>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-red-500' : 'text-red-400'
                  }`}>إنهاء الجلسة</p>
                </div>
              </button>
            </div>

          </div>
        </aside>

        {/* محتوى الصفحات */}
        <main className={`flex-1 transition-colors duration-300 ${
          darkMode ? 'bg-gray-900' : ''
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
} 