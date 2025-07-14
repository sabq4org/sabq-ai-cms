'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import UserDropdown from './UserDropdown';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { getCookie } from '@/lib/cookies';
import { 
  Menu, 
  ChevronDown, 
  LogIn, 
  User, 
  Sun, 
  Moon, 
  Activity, 
  Clock, 
  MessageCircle,
  Home,
  Newspaper,
  Folder,
  Edit,
  Users,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function Header() {
  const router = useRouter();
  const { darkMode, mounted, toggleDarkMode } = useDarkModeContext();
  const [user, setUser] = useState<UserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveEventCount, setLiveEventCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  // عناصر المينيو الرئيسية
  const navigationItems = [
    { url: '/', label: 'الرئيسية', icon: Home, highlight: false },
    { url: '/news', label: 'الأخبار', icon: Newspaper, highlight: false },
    { url: '/categories', label: 'الأقسام', icon: Folder, highlight: false },
    { url: '/opinion', label: 'الرأي', icon: Edit, highlight: false },
    { 
      url: '/moment-by-moment', 
      label: '', 
      icon: Activity, 
      highlight: true,
      showBadge: true,
      badgeCount: liveEventCount
    },
  ];

  // جلب بيانات المستخدم
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getCookie('token');
        if (!token) return;

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات المستخدم:', error);
      }
    };

    fetchUserData();
  }, []);

  // تحديث عداد الأحداث المباشرة
  useEffect(() => {
    const updateEventCount = () => {
      setLiveEventCount(Math.floor(Math.random() * 10) + 1);
    };

    const interval = setInterval(updateEventCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsDropdownOpen(false);
      router.push('/');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      toast.error('حدث خطأ في تسجيل الخروج');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // عدم عرض أي شيء حتى يتم تحميل الثيم
  if (!mounted) {
    return null;
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-900/95 border-gray-700' 
        : 'bg-white/95 border-gray-200'
    } backdrop-blur-md border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* الشعار */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                darkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                س
              </div>
              <span className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                سبق
              </span>
            </Link>
          </div>

          {/* المينيو الرئيسية - Desktop */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navigationItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  item.highlight
                    ? darkMode
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-red-600 hover:text-red-700'
                    : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label && <span>{item.label}</span>}
                {item.showBadge && item.badgeCount && item.badgeCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {item.badgeCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* أدوات التحكم - Desktop */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {/* زر البحث */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="البحث"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* زر الوضع الليلي */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label={darkMode ? 'تبديل إلى الوضع النهاري' : 'تبديل إلى الوضع الليلي'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* منطقة المستخدم */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleDropdownToggle}
                  className={`flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg transition-colors duration-200 ${
                    darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="قائمة المستخدم"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <UserDropdown
                    user={user}
                    onClose={handleDropdownClose}
                    onLogout={handleLogout}
                    anchorElement={dropdownRef.current}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  href="/login"
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </Link>
              </div>
            )}
          </div>

          {/* زر المينيو المحمول */}
          <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
            {/* زر الوضع الليلي - Mobile */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label={darkMode ? 'تبديل إلى الوضع النهاري' : 'تبديل إلى الوضع الليلي'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="قائمة التنقل"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* شريط البحث */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث في الأخبار..."
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                بحث
              </button>
            </form>
          </div>
        )}

        {/* المينيو المحمول */}
        {isMobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    item.highlight
                      ? darkMode
                        ? 'text-red-400 hover:text-red-300 hover:bg-gray-800'
                        : 'text-red-600 hover:text-red-700 hover:bg-gray-100'
                      : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <item.icon className="w-5 h-5" />
                    {item.label && <span>{item.label}</span>}
                  </div>
                  {item.showBadge && item.badgeCount && item.badgeCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              ))}
              
              {/* فاصل */}
              <div className={`my-2 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}></div>
              
              {/* روابط إضافية */}
              <Link
                href="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>البحث</span>
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>الملف الشخصي</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>الإعدادات</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 text-red-600 hover:text-red-700 ${
                      darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}