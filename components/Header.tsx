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
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          try {
            localStorage.setItem('user', JSON.stringify(data.user));
          } catch (e) {
            console.error('localStorage error:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
      await fetchUserData();
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // التحقق من الأحداث الجديدة
  useEffect(() => {
    const checkNewEvents = async () => {
      try {
        const response = await fetch('/api/dashboard/activities?limit=5');
        if (response.ok) {
          const data = await response.json();
          const newCount = data.activities?.filter((event: any) => 
            new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length || 0;
          setNewEventsCount(newCount);
        }
      } catch (error) {
        console.error('Error checking new events:', error);
      }
    };

    checkNewEvents();
    const interval = setInterval(checkNewEvents, 60000); // كل دقيقة
    return () => clearInterval(interval);
  }, []);

  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  const handleToggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      localStorage.removeItem('user');
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // قائمة التنقل الرئيسية
  const navigationItems = [
    { 
      url: '/', 
      label: 'الرئيسية', 
      icon: Home, 
      highlight: false 
    },
    { 
      url: '/news', 
      label: 'الأخبار', 
      icon: Newspaper, 
      highlight: false 
    },
    { 
      url: '/categories', 
      label: 'الأقسام', 
      icon: Folder, 
      highlight: false 
    },
    { 
      url: '/opinion', 
      label: 'الرأي', 
      icon: Edit, 
      highlight: false 
    },
    { 
      url: '/forum', 
      label: 'المنتدى', 
      icon: MessageCircle, 
      highlight: true 
    },
    { 
      url: '/moment-by-moment', 
      label: 'لحظة بلحظة', 
      icon: Activity, 
      highlight: true 
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      darkMode ? 'bg-gray-900/95 backdrop-blur-md border-gray-800' : 'bg-white/95 backdrop-blur-md border-gray-200'
    } border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Mobile Layout */}
          <div className="lg:hidden flex items-center justify-between w-full">
            {/* زر القائمة المحمولة */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="القائمة الرئيسية"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* الشعار */}
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="سبق" 
                width={80} 
                height={32} 
                className="h-8 w-auto object-contain hover:opacity-80 transition-opacity"
                priority
              />
            </Link>

            {/* أزرار المستخدم للموبايل */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* زر الوضع الليلي */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع المظلم'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* صورة المستخدم أو زر تسجيل الدخول */}
              {user ? (
                <div className="relative" ref={mobileDropdownRef}>
                  <button
                    ref={mobileButtonRef}
                    onClick={handleToggleDropdown}
                    className={`flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg transition-colors ${
                      darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="قائمة المستخدم"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {getInitials(user.name)}
                      </div>
                    )}
                  </button>

                  {showDropdown && (
                    <UserDropdown
                      user={user}
                      onClose={handleCloseDropdown}
                      onLogout={handleLogout}
                      anchorElement={mobileButtonRef.current}
                    />
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="text-sm font-medium">دخول</span>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* الشعار */}
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="سبق" 
                width={120} 
                height={40} 
                className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
                priority
              />
            </Link>

            {/* القائمة الرئيسية - Desktop */}
            <nav className="flex items-center space-x-8 rtl:space-x-reverse">
              {navigationItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.highlight
                      ? darkMode
                        ? 'text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 border border-blue-800/30'
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-blue-200'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${item.highlight ? 'text-current' : ''}`} />
                  <span>{item.label}</span>
                  {item.url === '/moment-by-moment' && newEventsCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {newEventsCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* أزرار المستخدم - Desktop */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* زر البحث */}
              <Link
                href="/search"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="البحث"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* زر الوضع الليلي */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع المظلم'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* صورة المستخدم أو زر تسجيل الدخول */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    ref={desktopButtonRef}
                    onClick={handleToggleDropdown}
                    className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                      darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="قائمة المستخدم"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {getInitials(user.name)}
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-24 truncate">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showDropdown && (
                    <UserDropdown
                      user={user}
                      onClose={handleCloseDropdown}
                      onLogout={handleLogout}
                      anchorElement={desktopButtonRef.current}
                    />
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="text-sm font-medium">دخول</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className={`lg:hidden border-t ${
            darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
          }`}>
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    item.highlight
                      ? darkMode
                        ? 'text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 border border-blue-800/30'
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-blue-200'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.highlight ? 'text-current' : ''}`} />
                  <span>{item.label}</span>
                  {item.url === '/moment-by-moment' && newEventsCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {newEventsCount}
                    </span>
                  )}
                </Link>
              ))}
              
              {/* روابط إضافية للموبايل */}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                <Link
                  href="/search"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span>البحث</span>
                </Link>
                
                {user && (
                  <Link
                    href="/settings"
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>الإعدادات</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}