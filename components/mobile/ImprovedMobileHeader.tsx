"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  BarChart3,
  Bookmark,
  Heart,
  Award,
  Edit3,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import SiteLogo from "../ui/SiteLogo";

interface ImprovedMobileHeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export default function ImprovedMobileHeader({
  onMenuClick,
  showSearch = true,
  showNotifications = true,
}: ImprovedMobileHeaderProps) {
  const { user, logout } = useAuth();
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const profileRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push("/");
  };

  const profileMenuItems = [
    {
      icon: UserCircle,
      label: "الملف الشخصي",
      href: "/profile",
      badge: null,
    },
    {
      icon: Edit3,
      label: "تعديل الملف الشخصي",
      href: "/profile/edit",
      badge: null,
    },
    {
      icon: BarChart3,
      label: "الإحصائيات",
      href: "/profile/stats",
      badge: null,
    },
    {
      icon: Bookmark,
      label: "المحفوظات",
      href: "/profile/saved",
      badge: "12",
    },
    {
      icon: Heart,
      label: "المفضلة",
      href: "/profile/favorites",
      badge: "8",
    },
    {
      icon: Award,
      label: "برنامج الولاء",
      href: "/loyalty",
      badge: "جديد",
    },
    {
      icon: Settings,
      label: "الإعدادات",
      href: "/settings",
      badge: null,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 h-14">
        {/* الجانب الأيسر - القائمة والشعار */}
        <div className="flex items-center gap-3">
          {/* زر القائمة الجانبية */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* الشعار */}
          <Link href="/" className="flex items-center">
            <SiteLogo />
          </Link>
        </div>

        {/* الجانب الأيمن - الأيقونات */}
        <div className="flex items-center gap-2">
          {/* البحث */}
          {showSearch && (
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="البحث"
            >
              <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {/* الإشعارات */}
          {showNotifications && user && (
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="الإشعارات"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          )}

          {/* البروفايل / تسجيل الدخول */}
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="القائمة الشخصية"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "المستخدم"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* القائمة المنسدلة للبروفايل */}
              {isProfileOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* معلومات المستخدم */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "المستخدم"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user.name || "المستخدم"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* قائمة الخيارات */}
                  <nav className="py-2">
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="flex-1 text-gray-700 dark:text-gray-300">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.badge === "جديد"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </nav>

                  {/* زر تسجيل الخروج */}
                  <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>

      {/* شريط البحث */}
      {isSearchOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <input
              type="search"
              placeholder="ابحث في سبق..."
              className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>
      )}
    </header>
  );
}
