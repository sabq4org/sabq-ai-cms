'use client';

import React, { useState, useEffect } from 'react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User,
  Home,
  FileText,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  BarChart3,
  MessageSquare
} from 'lucide-react';

// نوع المستخدم
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// خصائص المكون
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

// Hook للتحقق من حجم الشاشة
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}

export default function ResponsiveLayout({ children, user, onLogin, onLogout }: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { darkMode } = useDarkModeContext();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  // التحقق من التمرير
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isMobile && isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, isDropdownOpen]);

  // قائمة التنقل
  const navigationItems = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/articles', label: 'المقالات', icon: FileText },
    { href: '/news', label: 'الأخبار', icon: MessageSquare },
    { href: '/trending', label: 'الأكثر قراءة', icon: TrendingUp },
    { href: '/stats', label: 'الإحصائيات', icon: BarChart3 },
    { href: '/community', label: 'المجتمع', icon: Users },
  ];

  // معالج البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // تنفيذ البحث
      console.log('البحث عن:', searchQuery);
    }
  };

  return (
    <div className="responsive-layout">
      {/* الهيدر */}
      <header className={`optimized-header ${isScrolled ? 'scrolled' : ''} ${darkMode ? 'dark' : ''}`}>
        <div className="header-container container">
          {/* زر القائمة للموبايل */}
          {isMobile && (
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="فتح القائمة"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* الشعار */}
          <a href="/" className="logo">
            <div className="logo-icon">سبق</div>
            <span>صحيفة سبق AI</span>
          </a>

          {/* التنقل للديسكتوب */}
          {!isMobile && (
            <nav className="desktop-nav">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="nav-link"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {/* البحث */}
          {!isMobile && (
            <div className="search-container">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="ابحث في سبق..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="search-icon" size={16} />
              </form>
            </div>
          )}

          {/* الإجراءات */}
          <div className="header-actions">
            {/* زر البحث للموبايل */}
            {isMobile && (
              <button
                className="action-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="البحث"
              >
                <Search size={20} />
              </button>
            )}

            {/* الإشعارات */}
            {user && (
              <button className="action-btn" aria-label="الإشعارات">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>
            )}

            {/* المستخدم أو تسجيل الدخول */}
            {user ? (
              <div className={`dropdown ${isMobile && isDropdownOpen ? 'active' : ''}`}>
                <button 
                  className="action-btn"
                  onClick={(e) => {
                    if (isMobile) {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }
                  }}
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </button>
                <div className="dropdown-content">
                  <a href="/profile" className="dropdown-item">
                    <User size={16} />
                    الملف الشخصي
                  </a>
                  <a href="/dashboard" className="dropdown-item">
                    <Settings size={16} />
                    لوحة التحكم
                  </a>
                  <hr className="my-2" />
                  <button onClick={onLogout} className="dropdown-item w-full text-right">
                    <LogOut size={16} />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={onLogin} className="btn btn-primary btn-sm">
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>

        {/* شريط البحث للموبايل */}
        {isMobile && isSearchOpen && (
          <div className="mobile-search-bar bg-white border-t p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                className="search-input flex-1"
                placeholder="ابحث في سبق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={16} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* خلفية القائمة المنسدلة للموبايل */}
      {isMobile && isDropdownOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* القائمة الجانبية للموبايل */}
      {isMobile && (
        <>
          <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-sidebar-header">
              <div className="logo">
                <div className="logo-icon">سبق</div>
                <span>صحيفة سبق AI</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="action-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-sidebar-content">
              {/* معلومات المستخدم */}
              {user && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        <User size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* قائمة التنقل */}
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className="mobile-nav-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={20} />
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              {/* أزرار إضافية للمستخدم المسجل */}
              {user && (
                <div className="mt-6 pt-6 border-t space-y-1">
                  <a href="/profile" className="mobile-nav-item">
                    <User size={20} />
                    الملف الشخصي
                  </a>
                  <a href="/dashboard" className="mobile-nav-item">
                    <Settings size={20} />
                    لوحة التحكم
                  </a>
                  <button onClick={onLogout} className="mobile-nav-item w-full text-right">
                    <LogOut size={20} />
                    تسجيل الخروج
                  </button>
                </div>
              )}

              {/* زر تسجيل الدخول للغير مسجلين */}
              {!user && (
                <div className="mt-6 pt-6 border-t">
                  <button onClick={onLogin} className="btn btn-primary w-full">
                    تسجيل الدخول
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* خلفية القائمة */}
          <div 
            className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </>
      )}

      {/* المحتوى الرئيسي */}
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      {/* الفوتر */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="logo mb-4">
                <div className="logo-icon bg-white text-blue-600">سبق</div>
                <span>صحيفة سبق AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                صحيفة سبق الإلكترونية - أخبار ومقالات بتقنية الذكاء الاصطناعي
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-gray-400 hover:text-white">حول سبق</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white">اتصل بنا</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white">سياسة الخصوصية</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white">شروط الاستخدام</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">الأقسام</h3>
              <ul className="space-y-2 text-sm">
                {navigationItems.slice(0, 4).map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-gray-400 hover:text-white">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">تابعنا</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">تويتر</a>
                <a href="#" className="text-gray-400 hover:text-white">فيسبوك</a>
                <a href="#" className="text-gray-400 hover:text-white">إنستقرام</a>
              </div>
            </div>
          </div>

          <hr className="border-gray-700 my-6" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2024 صحيفة سبق الإلكترونية. جميع الحقوق محفوظة.</p>
            <p>صُنع بـ ❤️ في المملكة العربية السعودية</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
