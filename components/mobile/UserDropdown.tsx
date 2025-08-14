'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  User, Settings, LogOut, BookOpen, ChevronRight,
  Shield, Star, Award, Bookmark
} from 'lucide-react';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export default function UserDropdown({ isOpen, onClose, anchorRef }: UserDropdownProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode } = useDarkModeContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current || !anchorRef?.current) return;
      
      if (!dropdownRef.current.contains(event.target as Node) && 
          !anchorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  // بيانات المستخدم للعرض (مؤقتة للتجربة)
  const displayUser = user || {
    name: 'علي الحازمي',
    email: 'ali@sabq.org',
    role: 'PREMIUM',
    avatar: null
  };
  
  // للتجربة: دائماً إظهار المستخدم كمسجل دخول
  const isUserAuthenticated = true; // isAuthenticated || true;

  const handleLogout = () => {
    logout();
    onClose();
  };

  // عناصر القائمة الشخصية
  const personalMenuItems = [
    {
      label: 'الملف الشخصي',
      url: '/profile',
      icon: User,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'رحلتي المعرفية',
      url: '/knowledge-journey',
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'المحفوظات',
      url: '/bookmarks',
      icon: Bookmark,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'الإعدادات',
      url: '/settings',
      icon: Settings,
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  // أيقونة التوثيق حسب الدور
  const getVerificationIcon = () => {
    switch (displayUser.role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'EDITOR':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'PREMIUM':
        return <Award className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* الخلفية الشفافة */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* القائمة المنسدلة */}
      <div
        ref={dropdownRef}
        className={`
          absolute top-full left-0 mt-2 w-72
          bg-white dark:bg-gray-900 
          rounded-xl shadow-xl 
          border border-gray-200 dark:border-gray-700
          z-50 overflow-hidden
          animate-in fade-in slide-in-from-top-1 duration-200
        `}
      >
        {/* معلومات المستخدم */}
        {isUserAuthenticated && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {/* صورة المستخدم أو الأيقونة الافتراضية */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {displayUser.avatar ? (
                  <img 
                    src={displayUser.avatar} 
                    alt={displayUser.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg">
                    {displayUser.name?.charAt(0) || 'م'}
                  </span>
                )}
              </div>
              
              {/* اسم وبريد المستخدم */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {displayUser.name}
                  </h3>
                  {getVerificationIcon()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {displayUser.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* عناصر القائمة */}
        <div className="py-2">
          {personalMenuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.url}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-2.5
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors duration-200
                  text-gray-700 dark:text-gray-300
                `}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            );
          })}
        </div>

        {/* زر تسجيل الخروج */}
        {isUserAuthenticated && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                bg-red-50 dark:bg-red-900/20
                hover:bg-red-100 dark:hover:bg-red-900/30
                text-red-600 dark:text-red-400
                rounded-lg transition-all duration-200
                font-medium
              `}
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}

        {/* رسالة للزوار */}
        {!isUserAuthenticated && (
          <div className="p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              سجل دخولك للوصول إلى المزايا الكاملة
            </p>
            <Link
              href="/auth/login"
              onClick={onClose}
              className={`
                inline-flex items-center justify-center
                px-4 py-2 rounded-lg
                bg-blue-600 hover:bg-blue-700
                text-white font-medium text-sm
                transition-colors duration-200
              `}
            >
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
