'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Home, Bookmark, User, Bell, Settings, LogOut } from 'lucide-react';

interface MobileHeaderCompactProps {
  className?: string;
}

export default function MobileHeaderCompact({ className }: MobileHeaderCompactProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications] = useState(3); // مثال على عدد التنبيهات

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const quickNavItems = [
    { icon: Home, label: 'الرئيسية', href: '/' },
    { icon: Bookmark, label: 'المحفوظات', href: '/bookmarks' },
    { icon: User, label: 'الملف الشخصي', href: '/profile' },
    { icon: Bell, label: 'التنبيهات', href: '/notifications', badge: notifications },
    { icon: Settings, label: 'الإعدادات', href: '/settings' },
  ];

  const navigationItems = [
    { label: 'الرئيسية', url: '/', icon: Home },
    { label: 'السياسة', url: '/categories/politics', icon: Home },
    { label: 'الاقتصاد', url: '/categories/economy', icon: Home },
    { label: 'الرياضة', url: '/categories/sports', icon: Home },
    { label: 'التقنية', url: '/categories/technology', icon: Home },
    { label: 'الثقافة', url: '/categories/culture', icon: Home },
  ];

  return (
    <>
      {/* الهيدر المحسن */}
      <div className={`mobile-header-enhanced fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-md' 
          : ''
      } ${className || ''}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          {/* الشعار المحسن */}
          <Link href="/" className="mobile-logo-enhanced flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">س</span>
            </div>
            <span className="logo-text text-lg font-bold">
              سبق الذكية
            </span>
          </Link>

          {/* أزرار الهيدر */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="mobile-header-button relative"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-header-button relative"
            >
              <Menu className="w-5 h-5" />
              {notifications > 0 && (
                <span className="mobile-notification-badge">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* شريط البحث المحسن */}
        {searchOpen && (
          <div className="mobile-search-bar animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في الأخبار..."
                className="mobile-search-input"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* التنقل السريع المحسن */}
        <div className="mobile-quick-nav">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
            {quickNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="mobile-quick-nav-item"
              >
                <div className="relative">
                  <item.icon className="quick-nav-icon" />
                  {item.badge && item.badge > 0 && (
                    <span className="mobile-notification-badge">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="quick-nav-text">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* القائمة الجانبية المحسنة */}
      {mobileMenuOpen && (
        <>
          {/* خلفية شفافة */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* القائمة المحسنة */}
          <div className="mobile-dropdown-enhanced fixed top-0 right-0 bottom-0 w-80 max-w-sm z-50 animate-in slide-in-from-right duration-300 overflow-y-auto">
            {/* رأس القائمة */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="mobile-logo-enhanced flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">س</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">سبق الذكية</h2>
                    <p className="text-sm text-white/70">منصة الأخبار الذكية</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-header-button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="mobile-quick-stats">
              <h3 className="text-sm font-semibold mb-2">إحصائيات اليوم</h3>
              <div className="mobile-quick-stats-grid">
                <div className="mobile-quick-stat-item">
                  <div className="mobile-quick-stat-number">245</div>
                  <div className="mobile-quick-stat-label">أخبار جديدة</div>
                </div>
                <div className="mobile-quick-stat-item">
                  <div className="mobile-quick-stat-number">12K</div>
                  <div className="mobile-quick-stat-label">قراءة</div>
                </div>
                <div className="mobile-quick-stat-item">
                  <div className="mobile-quick-stat-number">350</div>
                  <div className="mobile-quick-stat-label">تعليق</div>
                </div>
              </div>
            </div>

            {/* عناصر القائمة */}
            <nav className="flex-1 px-3 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.url}
                  className="mobile-dropdown-item-enhanced mobile-enter"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* قسم الإعدادات */}
            <div className="border-t border-white/10 p-3">
              <div className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                الإعدادات
              </div>
              <div className="space-y-1">
                <Link
                  href="/settings"
                  className="mobile-dropdown-item-enhanced"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span>الإعدادات</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    // إضافة منطق تسجيل الخروج هنا
                  }}
                  className="mobile-dropdown-item-enhanced w-full text-left"
                  style={{ color: '#ef4444' }}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* مساحة للهيدر الثابت */}
      <div className="h-32" />
    </>
  );
}
