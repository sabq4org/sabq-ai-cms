'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Menu, Search, Bell, User, ChevronDown, Home, Newspaper, MessageSquare, Bookmark, Settings, LogOut, X, Sun, Moon, Activity } from 'lucide-react';
import NotificationBell from '@/components/Notifications/NotificationBell';

interface MobileHeaderProps {
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
}

export default function MobileHeader({ 
  showSearch = true, 
  showNotifications = true,
  showUserMenu = true 
}: MobileHeaderProps) {
  const { darkMode, mounted, toggleDarkMode } = useDarkModeContext();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const navigationItems = [
    { label: 'الرئيسية', url: '/', icon: Home },
    { 
      label: 'اللحظة بلحظة', 
      url: '/moment-by-moment', 
              icon: Activity,
      highlight: true,
      badge: newEventsCount > 0 ? newEventsCount : null
    },
    { label: 'الأخبار', url: '/news', icon: Newspaper },
    { label: 'التصنيفات', url: '/categories', icon: Bookmark },
    { label: 'المحفوظات', url: '/bookmarks', icon: Bookmark },
  ];

  // وظيفة تسجيل الخروج
  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      router.push('/');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  // فحص الأحداث الجديدة
  useEffect(() => {
    const checkNewEvents = async () => {
      try {
        const response = await fetch('/api/articles?status=published&limit=10&article_type=news');
        const data = await response.json();
        
        if (data.articles) {
          const newEvents = data.articles.filter((article: any) => 
            new Date(article.created_at).getTime() > Date.now() - 3600000 // آخر ساعة
          );
          setNewEventsCount(newEvents.length);
        }
      } catch (error) {
        console.error('Error checking new events:', error);
      }
    };

    checkNewEvents();
    const interval = setInterval(checkNewEvents, 300000); // كل 5 دقائق
    
    return () => clearInterval(interval);
  }, []);

  // مراقبة التمرير لإخفاء/إظهار الهيدر
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, []);

  if (!isMobile) {
    // الهيدر العادي للشاشات الكبيرة
    return null; // استخدم الهيدر الافتراضي
  }

  return (
    <>
      <div className={`mobile-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}>
        <div className="px-4 py-3">
          {/* الصف الرئيسي */}
          <div className="flex items-center justify-between">
            {/* زر القائمة والشعار */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="فتح القائمة"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">س</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    سبق
                  </h1>
                </div>
              </Link>
            </div>

            {/* الأدوات */}
            <div className="flex items-center gap-2">
              {/* البحث */}
              {showSearch && (
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="البحث"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}

              {/* اللحظة بلحظة */}
              <Link
                href="/moment-by-moment"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="اللحظة بلحظة"
              >
                <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                {newEventsCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] leading-none px-1 py-[2px] rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                    {newEventsCount > 9 ? '9+' : newEventsCount}
                  </span>
                )}
              </Link>

              {/* الإشعارات */}
              {showNotifications && (
                <NotificationBell />
              )}

              {/* تبديل الوضع الليلي */}
              {mounted && (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="تبديل الوضع الليلي"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              )}

              {/* قائمة المستخدم */}
              {showUserMenu && (
                <Link
                  href="/login"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="تسجيل الدخول"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
              )}
            </div>
          </div>

          {/* شريط البحث */}
          {searchOpen && (
            <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
              <form className="relative">
                <input
                  type="search"
                  placeholder="ابحث في الأخبار..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 dark:text-gray-400"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* شريط التقدم للتحميل */}
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform origin-left scale-x-0 transition-transform duration-300" />
      </div>

      {/* القائمة الجانبية */}
      {mobileMenuOpen && (
        <>
          {/* خلفية شفافة */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* القائمة */}
          <div className="mobile-sidebar fixed top-0 right-0 bottom-0 w-80 max-w-sm bg-white dark:bg-gray-900 z-50 animate-in slide-in-from-right duration-300 overflow-y-auto">
            {/* رأس القائمة */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">س</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">سبق الذكية</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">منصة الأخبار الذكية</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* عناصر القائمة */}
            <nav className="flex-1 px-3 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.url}
                  className={`mobile-nav-item group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 min-h-[44px] ${
                    item.highlight
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon
                    className="icon flex-shrink-0 w-5 h-5 ml-3"
                    aria-hidden="true"
                  />
                  <span className="text">{item.label}</span>
                  {item.badge && (
                    <span className="badge bg-red-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* قسم الإعدادات */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="sidebar-group-title">الإعدادات</div>
              <div className="space-y-1">
                <Link
                  href="/settings"
                  className="mobile-nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="icon flex-shrink-0 w-5 h-5 ml-3" />
                  <span className="text">الإعدادات</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="mobile-nav-item danger w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px]"
                >
                  <LogOut className="icon flex-shrink-0 w-5 h-5 ml-3" />
                  <span className="text">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* مساحة للهيدر الثابت - مقللة */}
      <div className="h-14" />
    </>
  );
}

// مكون مبسط للهيدر
export function SimpleMobileHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className={`simple-mobile-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">س</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              سبق
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <Link
              href="/menu"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
      <div className="h-14" />
    </>
  );
}