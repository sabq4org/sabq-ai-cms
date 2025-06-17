'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, Search, User, Bell, Settings, Heart, 
  LogOut, ChevronDown, Home, Newspaper, Star 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // جلب النقاط
      fetchUserPoints(parsedUser.id);
    }
  }, []);
  
  // جلب نقاط المستخدم
  const fetchUserPoints = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/loyalty-points/${userId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setUserPoints(data.data.totalPoints);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
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
    localStorage.removeItem('user');
    setUser(null);
    setUserPoints(0);
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/newspaper');
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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* الشعار */}
          <div className="flex items-center gap-8">
            <Link href="/newspaper" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">سبق</span>
              </div>
              <span className="hidden md:block text-xl font-bold text-gray-800">
                صحيفة سبق الإلكترونية
              </span>
            </Link>

            {/* روابط التنقل */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/newspaper" className="text-gray-600 hover:text-blue-600 transition-colors">
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
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-gray-700 font-medium">{user.name}</p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      رصيدك: {userPoints} نقطة
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* القائمة المنسدلة */}
                {showDropdown && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-amber-600">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">رصيدك: {userPoints} نقطة</span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>الملف الشخصي</span>
                    </Link>

                    <Link
                      href="/welcome/preferences"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Heart className="w-4 h-4" />
                      <span>اهتماماتي</span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>الإعدادات</span>
                    </Link>

                    <Link
                      href="/notifications"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Bell className="w-4 h-4" />
                      <span>الإشعارات</span>
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-right"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
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
                href="/newspaper"
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