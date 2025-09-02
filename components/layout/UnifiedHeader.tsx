"use client";

/**
 * هيدر موحد يستخدم نظام المصادقة الموحد
 * يحل مشاكل عدم تطابق حالة تسجيل الدخول
 */

import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Activity,
  Brain,
  ChevronDown,
  Edit,
  Folder,
  Home,
  LogIn,
  Menu,
  Moon,
  Newspaper,
  Settings,
  Sun,
  Target,
  User,
  LogOut,
  Shield,
  UserPlus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ClientOnly from "../ClientOnly";
import { NotificationDropdown } from '@/components/Notifications/NotificationDropdownOptimized';


export default function UnifiedHeader() {
  const router = useRouter();
  const { logoUrl, siteName, loading: settingsLoading } = useSiteSettings();
  
  // استخدام نظام المصادقة الموحد
  const { user, loading, isAuthenticated, isAdmin, logout, refreshUser } = useUnifiedAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerElRef = useRef<HTMLElement>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // تحديث بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    if (!loading) {
      refreshUser?.().catch(() => {});
    }
  }, [refreshUser, loading]);

  // إغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // فحص الأحداث الجديدة
  useEffect(() => {
    const checkEvents = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch('/api/events/unread-count', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setNewEventsCount(data.count || 0);
          }
        } catch (error) {
          console.error('خطأ في جلب عدد الأحداث:', error);
        }
      }
    };

    checkEvents();
    const interval = setInterval(checkEvents, 60000); // فحص كل دقيقة
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      toast.error('حدث خطأ في تسجيل الخروج');
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.email?.split('@')[0] || 'مستخدم';
  };

  const getUserRole = () => {
    if (!user) return '';
    if (isAdmin) return 'مدير';
    if (user.role === 'moderator') return 'مشرف';
    if (user.role === 'author') return 'كاتب';
    return 'عضو';
  };

  if (!mounted) {
    return null; // تجنب مشاكل الهيدرة
  }

  return (
    <ClientOnly>
      <header 
        ref={headerElRef}
        className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* الشعار والعنوان */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={siteName || "سبق الذكية"}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                )}
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {siteName || "سبق الذكية"}
                </span>
              </Link>
            </div>

            {/* القائمة الرئيسية - سطح المكتب */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Home className="w-4 h-4" />
                الرئيسية
              </Link>
              <Link 
                href="/news" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Newspaper className="w-4 h-4" />
                الأخبار
              </Link>
              <Link 
                href="/articles" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Edit className="w-4 h-4" />
                المقالات
              </Link>
              <Link 
                href="/categories" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Folder className="w-4 h-4" />
                الأقسام
              </Link>
            </nav>

            {/* الأدوات والمستخدم */}
            <div className="flex items-center gap-3">
              
              {/* مبدل الثيم */}
              <CompactThemeSwitcher />

              {/* الإشعارات */}
              {isAuthenticated && user && (
                <div className="relative">
                  <NotificationDropdown userId={user.id} />
                  {newEventsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {newEventsCount > 9 ? '9+' : newEventsCount}
                    </span>
                  )}
                </div>
              )}

              {/* حالة المستخدم */}
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              ) : isAuthenticated && user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={getUserDisplayName()} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        getUserInitials(getUserDisplayName())
                      )}
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getUserRole()}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* قائمة المستخدم المنسدلة */}
                  {userDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                      
                      {/* معلومات المستخدم */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={getUserDisplayName()} 
                                className="w-full h-full rounded-full object-cover" 
                              />
                            ) : (
                              getUserInitials(getUserDisplayName())
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getUserDisplayName()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                {getUserRole()}
                              </span>
                              {user.loyalty_points && (
                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                  {user.loyalty_points} نقطة
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* روابط الملف الشخصي */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          الملف الشخصي
                        </Link>
                        
                        <Link
                          href="/profile/settings"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          الإعدادات
                        </Link>

                        <Link
                          href="/profile/activity"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Activity className="w-4 h-4" />
                          النشاط
                        </Link>

                        {/* روابط الإدارة */}
                        {isAdmin && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                            <Link
                              href="/sabq-admin"
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400"
                              onClick={() => setUserDropdownOpen(false)}
                            >
                              <Shield className="w-4 h-4" />
                              لوحة التحكم
                            </Link>
                            <Link
                              href="/admin-lite/news"
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400"
                              onClick={() => setUserDropdownOpen(false)}
                            >
                              <Target className="w-4 h-4" />
                              النسخة الخفيفة
                            </Link>
                          </>
                        )}
                      </div>

                      {/* تسجيل الخروج */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">دخول</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">تسجيل</span>
                  </Link>
                </div>
              )}

              {/* قائمة الجوال */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* القائمة المنسدلة للجوال */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <nav className="space-y-2">
                <Link 
                  href="/" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-4 h-4" />
                  الرئيسية
                </Link>
                <Link 
                  href="/news" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Newspaper className="w-4 h-4" />
                  الأخبار
                </Link>
                <Link 
                  href="/articles" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Edit className="w-4 h-4" />
                  المقالات
                </Link>
                <Link 
                  href="/categories" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Folder className="w-4 h-4" />
                  الأقسام
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </ClientOnly>
  );
}
