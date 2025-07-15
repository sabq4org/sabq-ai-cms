'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import UserDropdown from './UserDropdown';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
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
  Settings,
  Brain
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { darkMode, mounted, toggleDarkMode } = useDarkModeContext();
  const { user, logout } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveEventCount, setLiveEventCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // عناصر المينيو الرئيسية
  const navigationItems = [
    { url: '/', label: 'الرئيسية', icon: Home, highlight: false },
    { url: '/news', label: 'الأخبار', icon: Newspaper, highlight: false },
    { url: '/categories', label: 'الأقسام', icon: Folder, highlight: false },
    { url: '/insights/deep', label: 'عمق', icon: Brain, highlight: false },
    { url: '/opinion', label: 'الرأي', icon: Edit, highlight: false },
    { 
      url: '/moment-by-moment', 
      label: '', 
      icon: Activity, 
      highlight: true,
      showBadge: true,
      badgeCount: liveEventCount
    }
  ];

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
      setIsDropdownOpen(false);
      router.push('/');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
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
          {/* الشعار الرسمي */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              {/* اللوقو الرسمي - أكبر حجماً */}
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="صحيفة سبق الإلكترونية"
                  width={140}
                  height={45}
                  className="h-10 w-auto"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* المينيو الرئيسية - Desktop - مع تحسين المسافات */}
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {navigationItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className={`flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
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

          {/* أدوات الهيدر */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* البحث */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="البحث..."
                    className={`w-64 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className={`ml-2 p-1 rounded-md ${
                      darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    ×
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* الوضع الليلي */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md transition-colors duration-200 ${
                darkMode 
                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* معلومات المستخدم */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleDropdownToggle}
                  className={`flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-md transition-colors duration-200 ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="user-avatar"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline text-sm font-medium">{user.name || user.email?.split('@')[0] || 'مستخدم'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <UserDropdown
                    user={user}
                    onLogout={handleLogout}
                    onClose={handleDropdownClose}
                  />
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>
            )}

            {/* المينيو المحمول */}
            <button
              onClick={toggleMobileMenu}
              className={`md:hidden p-2 rounded-md transition-colors duration-200 ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* المينيو المحمول */}
        {isMobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
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
              
              {/* روابط إضافية للمحمول */}
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>الملف الشخصي</span>
              </Link>
              
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>الإعدادات</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}