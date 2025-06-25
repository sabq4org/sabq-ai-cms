'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, Search, ChevronDown 
} from 'lucide-react';
import toast from 'react-hot-toast';
import UserDropdown from './UserDropdown';
// import DarkModeToggle from './DarkModeToggle'; // تم تعطيل الوضع الليلي

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user_loyalty_points');
        
        setUser(null);
        toast.success('تم تسجيل الخروج بنجاح');
        router.push('/');
      } else {
        toast.error('حدث خطأ في تسجيل الخروج');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      toast.error('حدث خطأ في تسجيل الخروج');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // روابط التنقل الثابتة
  const navigationItems = [
    { label: 'الرئيسية', url: '/', order: 1 },
    { label: 'الأخبار', url: '/news', order: 2 },
    { label: 'التصنيفات', url: '/categories', order: 3 },
    { label: 'تواصل معنا', url: '/contact', order: 4 }
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-black/50 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* الشعار في اليمين */}
          <Link href="/" className="flex-shrink-0 min-w-[120px]">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">سبق</span>
          </Link>

          {/* روابط التنقل في الوسط */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navigationItems.map((item) => (
              <Link 
                key={item.url}
                href={item.url} 
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-lg hover:font-semibold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* الجزء الأيسر */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* البحث */}
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Search className="w-5 h-5" />
            </button>

            {/* زر التبديل للوضع الليلي - تم تعطيله */}
            {/* <DarkModeToggle /> */}

            {/* معلومات المستخدم */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm shadow-md">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform hidden sm:block ${
                    showDropdown ? 'rotate-180' : ''
                  }`} />
                </button>

                {showDropdown && (
                  <UserDropdown 
                    user={user}
                    onClose={() => setShowDropdown(false)}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : null}

            {/* زر القائمة للموبايل */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* القائمة للموبايل */}
        {showMobileMenu && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900">
            <nav className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
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