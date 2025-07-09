'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, User, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import SabqLogo from '@/components/SabqLogo';

interface EnhancedMobileHeaderProps {
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
}

export default function EnhancedMobileHeader({
  showSearch = true,
  showNotifications = true,
  showUserMenu = true
}: EnhancedMobileHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // مراقبة التمرير
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // فحص الأحداث الجديدة
  useEffect(() => {
    const checkNewEvents = async () => {
      try {
        const response = await fetch('/api/articles?status=published&limit=10');
        const data = await response.json();
        
        if (data.articles) {
          const newEvents = data.articles.filter((article: any) => 
            new Date(article.created_at).getTime() > Date.now() - 3600000
          );
          setNewEventsCount(newEvents.length);
        }
      } catch (error) {
        console.error('Error checking new events:', error);
      }
    };

    checkNewEvents();
    const interval = setInterval(checkNewEvents, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // إغلاق القوائم عند تغيير المسار
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, []);

  if (!isMobile) {
    return null; // استخدم الهيدر العادي للشاشات الكبيرة
  }

  return (
    <>
      {/* الهيدر المحسن */}
      <header className={`mobile-header-enhanced fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}>
        <div className="header-container">
          {/* شريط علوي ثابت */}
          <div className="top-bar">
            {/* زر القائمة والشعار */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="menu-button"
                aria-label="فتح القائمة"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              <Link href="/" className="flex items-center gap-2">
                <div className="logo-container">
                  <SabqLogo />
                </div>
              </Link>
            </div>

            {/* الأدوات */}
            <div className="actions-container flex items-center gap-2">
              {/* البحث */}
              {showSearch && (
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="search-button"
                  aria-label="البحث"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* الإشعارات */}
              {showNotifications && (
                <Link
                  href="/moment-by-moment"
                  className="notification-button relative"
                  aria-label="الإشعارات"
                >
                  <Bell className="w-5 h-5" />
                  {newEventsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {newEventsCount > 9 ? '9+' : newEventsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* تبديل الوضع الليلي */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="user-button"
                  aria-label="تبديل الوضع الليلي"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* قائمة المستخدم */}
              {showUserMenu && (
                <Link
                  href="/login"
                  className="user-button"
                  aria-label="تسجيل الدخول"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* شريط البحث */}
          {searchOpen && (
            <div className="search-bar animate-in slide-in-from-top-2 duration-200">
              <form className="relative">
                <input
                  type="search"
                  placeholder="ابحث في الأخبار..."
                  className="search-input"
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
      </header>

      {/* القائمة الجانبية */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">القائمة</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-900 dark:text-white font-medium">الرئيسية</span>
                </Link>
                
                <Link
                  href="/moment-by-moment"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-900 dark:text-white font-medium">اللحظة بلحظة</span>
                  {newEventsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {newEventsCount}
                    </span>
                  )}
                </Link>
                
                <Link
                  href="/news"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-900 dark:text-white font-medium">الأخبار</span>
                </Link>
                
                <Link
                  href="/categories"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-900 dark:text-white font-medium">التصنيفات</span>
                </Link>
                
                <Link
                  href="/bookmarks"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-gray-900 dark:text-white font-medium">المحفوظات</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* مساحة للهيدر الثابت */}
      <div className="h-16"></div>
    </>
  );
}

// مكون مبسط للهيدر
export function SimpleEnhancedMobileHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`mobile-header-enhanced fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="top-bar">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="logo-container">
              <SabqLogo />
            </div>
          </Link>
        </div>
        
        <div className="actions-container flex items-center gap-2">
          <Link href="/search" className="search-button">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/moment-by-moment" className="notification-button">
            <Bell className="w-5 h-5" />
          </Link>
          <Link href="/login" className="user-button">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
} 