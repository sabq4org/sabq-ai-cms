'use client';

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { 
  Menu, Search, Bell, User, X, Sun, Moon, Activity, 
  Home, Newspaper, Bookmark, Settings, LogOut, ChevronDown 
} from 'lucide-react';

// واجهة محسنة
interface MobileHeaderProps {
  variant?: 'default' | 'minimal' | 'transparent';
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  className?: string;
}

// hook مخصص للتحقق من الأحداث الجديدة
const useNewEventsCounter = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const checkNewEvents = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/articles?status=published&limit=10', {
        next: { revalidate: 300 } // 5 دقائق
      });
      
      if (response.ok) {
        const data = await response.json();
        const hourAgo = Date.now() - 3600000;
        const newEvents = data.articles?.filter((article: any) => 
          new Date(article.created_at).getTime() > hourAgo
        ) || [];
        
        setCount(newEvents.length);
      }
    } catch (error) {
      console.warn('خطأ في جلب الأحداث الجديدة:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    checkNewEvents();
    
    // فحص دوري كل 5 دقائق
    const interval = setInterval(checkNewEvents, 300000);
    return () => clearInterval(interval);
  }, [checkNewEvents]);

  return { count, loading, refresh: checkNewEvents };
};

// hook للتحقق من التمرير
const useScrollDetection = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // إزالة التأخير السابق
      clearTimeout(timeoutId);
      
      // تحديث مؤجل لتحسين الأداء
      timeoutId = setTimeout(() => {
        setIsScrolled(currentScrollY > 10);
        setIsScrollingDown(currentScrollY > lastScrollY && currentScrollY > 100);
        lastScrollY = currentScrollY;
      }, 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return { isScrolled, isScrollingDown };
};

// عناصر التنقل الرئيسية
const navigationItems = [
  { 
    label: 'الرئيسية', 
    url: '/', 
    icon: Home,
    color: 'text-blue-600 dark:text-blue-400'
  },
  { 
    label: 'اللحظة بلحظة', 
    url: '/moment-by-moment', 
    icon: Activity,
    highlight: true,
    color: 'text-red-500 dark:text-red-400'
  },
  { 
    label: 'الأخبار', 
    url: '/news', 
    icon: Newspaper,
    color: 'text-green-600 dark:text-green-400'
  },
  { 
    label: 'المحفوظات', 
    url: '/bookmarks', 
    icon: Bookmark,
    color: 'text-purple-600 dark:text-purple-400'
  },
];

// لوجو الموقع المحسن
const SiteLogo = memo(() => (
  <Link href="/" className="flex items-center gap-3 group">
    <div className="relative">
      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <span className="text-white font-bold text-lg font-arabic">س</span>
      </div>
      <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
    </div>
    <div className="hidden sm:block">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
        سبق
      </h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
        ذكية
      </p>
    </div>
  </Link>
));

SiteLogo.displayName = 'SiteLogo';

// شريط البحث المحسن
const SearchBar = memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg animate-in slide-in-from-top-2 duration-200">
      <div className="p-4">
        <form className="relative" onSubmit={(e) => { e.preventDefault(); /* منطق البحث */ }}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الأخبار والمقالات..."
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            autoFocus
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
        
        {/* اقتراحات البحث السريع */}
        {query.length === 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">بحث سريع:</p>
            <div className="flex flex-wrap gap-2">
              {['الرياضة', 'الاقتصاد', 'التقنية', 'السياسة'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

// القائمة الجانبية المحسنة
const SideMenu = memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { count: newEventsCount } = useNewEventsCounter();

  if (!isOpen) return null;

  return (
    <>
      {/* الخلفية الشفافة */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* القائمة */}
      <nav className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white dark:bg-gray-900 z-50 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* رأس القائمة */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <SiteLogo />
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="إغلاق القائمة"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              صحيفة سبق الإلكترونية - مدعومة بالذكاء الاصطناعي
            </p>
          </div>

          {/* عناصر القائمة الرئيسية */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-4">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <Link
                      href={item.url}
                      onClick={onClose}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        item.highlight
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${item.color} ${item.highlight ? 'animate-pulse' : ''} group-hover:scale-110 transition-transform duration-200`} />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.highlight && newEventsCount > 0 && (
                        <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce font-bold">
                          {newEventsCount > 9 ? '9+' : newEventsCount}
                        </span>
                      )}
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* فاصل */}
            <div className="my-6 mx-4 border-t border-gray-200 dark:border-gray-700" />

            {/* روابط إضافية */}
            <ul className="space-y-1 px-4">
              <li>
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                >
                  <Settings className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:rotate-90 transition-all duration-200" />
                  <span>الإعدادات</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* تذييل القائمة */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onClose();
                // منطق تسجيل الخروج
              }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
            >
              <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
});

SideMenu.displayName = 'SideMenu';

// الهيدر الرئيسي المحسن
const MobileHeader = memo(({ 
  variant = 'default',
  showSearch = true, 
  showNotifications = true,
  showUserMenu = true,
  className = ''
}: MobileHeaderProps) => {
  const { darkMode, mounted, toggleDarkMode } = useDarkModeContext();
  const { isScrolled, isScrollingDown } = useScrollDetection();
  const { count: newEventsCount } = useNewEventsCounter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // إغلاق القوائم عند تغيير المسار
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, []);

  // منع التمرير عند فتح القائمة
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // تحديد أنماط الهيدر حسب النوع
  const headerStyles = useMemo(() => {
    const base = 'mobile-header fixed top-0 left-0 right-0 z-50 transition-all duration-300';
    
    switch (variant) {
      case 'minimal':
        return `${base} bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`;
      case 'transparent':
        return `${base} ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`;
      default:
        return `${base} ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'}`;
    }
  }, [variant, isScrolled]);

  // إخفاء الهيدر عند التمرير للأسفل (للشاشات الصغيرة)
  const shouldHideHeader = isScrollingDown && isMobile && variant !== 'minimal';

  if (!isMobile && variant !== 'minimal') {
    return null; // استخدام الهيدر العادي للشاشات الكبيرة
  }

  return (
    <>
      <header 
        className={`${headerStyles} ${shouldHideHeader ? '-translate-y-full' : 'translate-y-0'} ${className}`}
        style={{ transform: shouldHideHeader ? 'translateY(-100%)' : 'translateY(0)' }}
      >
        <div className="px-4 py-3">
          {/* الصف الرئيسي */}
          <div className="flex items-center justify-between">
            {/* القسم اليميني - القائمة والشعار */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              <SiteLogo />
            </div>

            {/* القسم الأيسر - الأدوات */}
            <div className="flex items-center gap-1">
              {/* البحث */}
              {showSearch && (
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                  aria-label="البحث"
                >
                  <Search className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${searchOpen ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                </button>
              )}

              {/* الإشعارات */}
              {showNotifications && (
                <Link
                  href="/moment-by-moment"
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                  aria-label={`الإشعارات ${newEventsCount > 0 ? `- ${newEventsCount} جديد` : ''}`}
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {newEventsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold shadow-lg">
                      {newEventsCount > 9 ? '9+' : newEventsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* تبديل الوضع الليلي */}
              {mounted && (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                  aria-label={darkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
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
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                  aria-label="تسجيل الدخول"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* شريط البحث */}
        <SearchBar 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)} 
        />

        {/* شريط التقدم للتحميل */}
        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 transform origin-left scale-x-0 transition-transform duration-300" />
      </header>

      {/* القائمة الجانبية */}
      <SideMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* مساحة للهيدر الثابت */}
      <div className="h-16" />
    </>
  );
});

MobileHeader.displayName = 'MobileHeader';

// نسخة مبسطة للهيدر
export const SimpleMobileHeader = memo(() => {
  const { isScrolled } = useScrollDetection();

  return (
    <>
      <header className={`simple-mobile-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <SiteLogo />
          
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
              aria-label="البحث"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <Link
              href="/menu"
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
          </div>
        </div>
      </header>
      <div className="h-16" />
    </>
  );
});

SimpleMobileHeader.displayName = 'SimpleMobileHeader';

export default MobileHeader;
