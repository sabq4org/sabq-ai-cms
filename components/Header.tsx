'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, Search, ChevronDown 
} from 'lucide-react';
import toast from 'react-hot-toast';
import SabqLogo from './SabqLogo';
import UserDropdown from './UserDropdown';
import { DarkModeToggle } from './DarkModeToggle';
import { useDarkModeContext } from './DarkModeProvider';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Template {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
  is_default: boolean;
  logo_url?: string;
  logo_alt?: string;
  logo_width?: number;
  logo_height?: number;
  primary_color?: string;
  secondary_color?: string;
  header_height?: number;
  content?: {
    logo?: {
      url: string;
      alt: string;
      width?: number;
      height?: number;
    };
    navigation?: {
      items: Array<{
        label: string;
        url: string;
        order: number;
      }>;
    };
    theme?: {
      headerHeight?: number;
    };
  };
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [headerTemplate, setHeaderTemplate] = useState<Template | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }

    // جلب القالب النشط من API
    fetchActiveHeaderTemplate();
  }, []);

  const fetchActiveHeaderTemplate = async () => {
    try {
      const response = await fetch('/api/templates/active-header');
      if (response.ok) {
        const template = await response.json();
        setHeaderTemplate(template);
      }
    } catch (error) {
      console.error('Error fetching header template:', error);
    }
  };

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // إزالة جميع بيانات المستخدم
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user_loyalty_points');
    
    setUser(null);
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // استخدام بيانات القالب للشعار
  const getLogoUrl = () => {
    if (headerTemplate?.logo_url) {
      return headerTemplate.logo_url;
    }
    if (headerTemplate?.content?.logo?.url) {
      return headerTemplate.content.logo.url;
    }
    return null;
  };

  const getLogoAlt = () => {
    if (headerTemplate?.logo_alt) {
      return headerTemplate.logo_alt;
    }
    if (headerTemplate?.content?.logo?.alt) {
      return headerTemplate.content.logo.alt;
    }
    return 'سبق';
  };

  // استخدام روابط التنقل من القالب
  const getNavigationItems = () => {
    if (headerTemplate?.content?.navigation?.items) {
      return headerTemplate.content.navigation.items
        .filter(item => item.label !== 'عن سبق')
        .sort((a, b) => a.order - b.order);
    }
    // الروابط الافتراضية
    return [
      { label: 'الرئيسية', url: '/', order: 1 },
      { label: 'الأخبار', url: '/news', order: 2 },
      { label: 'التصنيفات', url: '/categories', order: 3 },
      { label: 'تواصل معنا', url: '/contact', order: 4 }
    ];
  };

  // الحصول على ارتفاع الهيدر
  const getHeaderHeight = () => {
    if (headerTemplate?.header_height) {
      return headerTemplate.header_height;
    }
    if (headerTemplate?.content?.theme?.headerHeight) {
      return headerTemplate.content.theme.headerHeight;
    }
    return 64; // الارتفاع الافتراضي
  };

  // الحصول على أبعاد الشعار
  const getLogoWidth = () => {
    return headerTemplate?.logo_width || headerTemplate?.content?.logo?.width || 'auto';
  };

  const getLogoHeight = () => {
    return headerTemplate?.logo_height || headerTemplate?.content?.logo?.height || 40;
  };

  // استخدام useDarkMode hook
  const { darkMode } = useDarkModeContext();

  // الاستماع لتغييرات الوضع المظلم
  useEffect(() => {
    const handleDarkModeChange = () => {
      // فرض إعادة رسم المكون
      setShowDropdown(false);
      setShowMobileMenu(false);
    };

    window.addEventListener('dark-mode-changed', handleDarkModeChange);
    window.addEventListener('dark-mode-toggled', handleDarkModeChange);

    return () => {
      window.removeEventListener('dark-mode-changed', handleDarkModeChange);
      window.removeEventListener('dark-mode-toggled', handleDarkModeChange);
    };
  }, []);

  return (
    <header 
      className="shadow-md dark:shadow-gray-900/50 sticky top-0 z-50 border-b transition-colors duration-300"
      style={{
        backgroundColor: darkMode 
          ? '#1f2937' // gray-800 في الوضع المظلم
          : (headerTemplate?.primary_color || '#ffffff'), // أبيض أو لون القالب في الوضع العادي
        borderColor: darkMode ? '#374151' : '#e5e7eb', // gray-700 / gray-200
        color: headerTemplate?.secondary_color || undefined
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div 
          className="flex items-center justify-between"
          style={{ height: `${getHeaderHeight()}px` }}
        >
          {/* الشعار في اليمين */}
          <Link href="/" className="flex-shrink-0">
            {/* شعار سبق - من القالب أو افتراضي */}
            {getLogoUrl() ? (
              <img 
                src={getLogoUrl()!} 
                alt={getLogoAlt()} 
                className="object-contain"
                style={{
                  width: getLogoWidth() === 'auto' ? 'auto' : `${getLogoWidth()}px`,
                  height: `${getLogoHeight()}px`
                }}
              />
            ) : (
              <SabqLogo />
            )}
          </Link>

          {/* روابط التنقل في الوسط */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {getNavigationItems().map((item) => (
              <Link 
                key={item.url}
                href={item.url} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-lg"
                style={{
                  color: darkMode 
                    ? '#d1d5db' // gray-300 في الوضع المظلم
                    : (headerTemplate?.secondary_color || '#374151') // gray-700 أو لون القالب
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* الجزء الأيسر - البحث والمستخدم وزر القائمة */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* البحث */}
            <button 
              className="p-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              style={{
                color: darkMode ? '#d1d5db' : '#4b5563' // gray-300 / gray-600
              }}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* زر التبديل للوضع الليلي */}
            <DarkModeToggle />

            {/* معلومات المستخدم */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shadow-md dark:shadow-gray-900/50"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md dark:shadow-gray-900/50">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* القائمة المنسدلة الجديدة */}
                {showDropdown && (
                  <UserDropdown 
                    user={user}
                    onClose={() => setShowDropdown(false)}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* زر القائمة للموبايل */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              style={{
                color: darkMode ? '#d1d5db' : '#4b5563' // gray-300 / gray-600
              }}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* القائمة للموبايل */}
        {showMobileMenu && (
          <div 
            className="lg:hidden py-4 border-t"
            style={{
              borderColor: darkMode ? '#374151' : '#e5e7eb' // gray-700 / gray-200
            }}
          >
            <nav className="flex flex-col gap-2">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    color: darkMode ? '#d1d5db' : '#4b5563', // gray-300 / gray-600
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'; // gray-700 / gray-50
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 