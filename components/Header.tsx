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
  Menu, ChevronDown, LogIn, User, Sun, Moon, Activity, Clock, MessageCircle
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
      console.log('[Safari Debug] Fetching user data from API...');
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('[Safari Debug] API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Safari Debug] API Response data:', data);
        
        if (data.user) {
          setUser(data.user);
          try {
            localStorage.setItem('user', JSON.stringify(data.user));
          } catch (e) {
            console.error('[Safari Debug] localStorage error:', e);
          }
        }
      }
    } catch (error) {
      console.error('[Safari Debug] Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // محاولة تحميل البيانات من localStorage أولاً
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('[Safari Debug] Loaded user from localStorage:', parsedUser);
      }
      
      // ثم تحديث البيانات من الخادم
      await fetchUserData();
    } catch (error) {
      console.error('[Safari Debug] Error loading user data:', error);
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
    const interval = setInterval(checkNewEvents, 30000); // كل 30 ثانية

    return () => clearInterval(interval);
  }, []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        localStorage.removeItem('user');
        toast.success('تم تسجيل الخروج بنجاح');
        router.push('/');
      } else {
        toast.error('حدث خطأ أثناء تسجيل الخروج');
      }
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

  const navigationItems = [
    { url: '/', label: 'الرئيسية', icon: null, highlight: false },
    { url: '/news', label: 'الأخبار', icon: null, highlight: false },
    { url: '/categories', label: 'الأقسام', icon: null, highlight: false },
    { url: '/opinion', label: 'الرأي', icon: null, highlight: false },
    { url: '/forum', label: 'المنتدى', icon: MessageCircle, highlight: true },
    { url: '/moment-by-moment', label: '', icon: Activity, highlight: true },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      darkMode ? 'bg-gray-900/95 backdrop-blur-md border-gray-800' : 'bg-white/95 backdrop-blur-md border-gray-200'
    } border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Layout */}
          <div className="lg:hidden flex items-center justify-between w-full">
            {/* زر القائمة */}
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

            {/* أدوات التحكم */}
            <div className="flex items-center gap-2">
              {/* زر الوضع الليلي */}
              {mounted && (
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="تبديل الوضع الليلي"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {isLoading ? (
                <div className="w-8 h-8" />
              ) : user ? (
                <div ref={mobileDropdownRef} className="relative">
                  <button
                    ref={mobileButtonRef}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                    aria-label="قائمة المستخدم"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm user-avatar"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const parent = target.parentElement;
                          if (parent) {
                            // إخفاء الصورة
                            target.style.display = 'none';
                            // إنشاء وإظهار الدائرة البديلة
                            const fallback = document.createElement('div');
                            fallback.className = 'w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs shadow-sm border-2 border-white dark:border-gray-800';
                            fallback.textContent = getInitials(user.name);
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs shadow-sm border-2 border-white dark:border-gray-800">
                        {getInitials(user.name)}
                      </div>
                    )}
                  </button>

                  {showDropdown && (
                    <UserDropdown 
                      user={user}
                      onClose={() => setShowDropdown(false)}
                      onLogout={handleLogout}
                      anchorElement={mobileButtonRef.current}
                    />
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  aria-label="تسجيل الدخول"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* الشعار */}
            <Link href="/" className="flex-shrink-0 min-w-[120px]">
              <Image 
                src="/logo.png" 
                alt="سبق" 
                width={100} 
                height={40} 
                className="h-12 w-auto object-contain hover:opacity-80 transition-opacity mt-1"
                priority
              />
            </Link>

            {/* التنقل الرئيسي */}
            <nav className="flex items-center gap-8 flex-1 justify-center">
              {navigationItems.map((item) => (
                <Link 
                  key={item.url}
                  href={item.url} 
                  className={`flex items-center gap-2 transition-all font-medium text-lg ${
                    item.highlight 
                      ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 relative' 
                      : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
                  } hover:font-semibold`}
                  title={item.label === '' ? 'لحظة بلحظة' : item.label}
                >
                  {(item.label === '' || item.label === 'لحظة بلحظة') && (
                    <Activity className="w-5 h-5 animate-pulse" />
                  )}
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.label && <span>{item.label}</span>}
                  {item.highlight && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </Link>
              ))}
            </nav>

            {/* أدوات التحكم - مبسطة ومتناسقة */}
            <div className="flex items-center gap-2 min-w-[120px] justify-end">
              {/* زر الوضع الليلي */}
              {mounted && (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  aria-label="تبديل الوضع الليلي"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {isLoading ? (
                <div className="w-10 h-10" />
              ) : user ? (
                <div className="relative dropdown-container" ref={dropdownRef}>
                  <button
                    ref={desktopButtonRef}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                    aria-label="قائمة المستخدم"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        width={36} 
                        height={36} 
                        className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm user-avatar"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const parent = target.parentElement;
                          if (parent) {
                            // إخفاء الصورة
                            target.style.display = 'none';
                            // إنشاء وإظهار الدائرة البديلة
                            const fallback = document.createElement('div');
                            fallback.className = 'w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm border-2 border-white dark:border-gray-800';
                            fallback.textContent = getInitials(user.name);
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm border-2 border-white dark:border-gray-800">
                        {getInitials(user.name)}
                      </div>
                    )}
                    {/* إزالة السهم لتقليل التشتيت */}
                  </button>

                  {showDropdown && (
                    <UserDropdown 
                      user={user}
                      onClose={() => setShowDropdown(false)}
                      onLogout={handleLogout}
                      anchorElement={desktopButtonRef.current}
                    />
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                    item.highlight
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {(item.label === '' || item.label === 'لحظة بلحظة') && (
                    <Activity className="w-5 h-5 animate-pulse" />
                  )}
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span className="flex-1">
                    {item.label === '' ? 'لحظة بلحظة' : item.label}
                  </span>
                  {item.highlight && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}