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
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }

    // جلب إعدادات الموقع (اللوقو المخصص)
    const siteSettings = localStorage.getItem('siteSettings');
    if (siteSettings) {
      const settings = JSON.parse(siteSettings);
      if (settings.logoUrl) {
        setCustomLogo(settings.logoUrl);
      }
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

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* الشعار */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              {/* شعار سبق - مخصص أو افتراضي */}
              {customLogo ? (
                <img 
                  src={customLogo} 
                  alt="سبق" 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <SabqLogo />
              )}
            </Link>

            {/* روابط التنقل */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                الرئيسية
              </Link>
              <Link href="/news" className="text-gray-600 hover:text-blue-600 transition-colors">
                الأخبار
              </Link>
              <Link href="/categories" className="text-gray-600 hover:text-blue-600 transition-colors">
                التصنيفات
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                عن سبق
              </Link>
            </nav>
          </div>

          {/* الجزء الأيمن */}
          <div className="flex items-center gap-4">
            {/* البحث */}
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* معلومات المستخدم */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
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
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
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
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* القائمة للموبايل */}
        {showMobileMenu && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                الرئيسية
              </Link>
              <Link
                href="/news"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                الأخبار
              </Link>
              <Link
                href="/categories"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                التصنيفات
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                عن سبق
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 