"use client";

import SabqLogo from "@/components/SabqLogo";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

interface DashboardMobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  onMenuClick?: () => void;
}

export default function DashboardMobileHeader({
  title = "لوحة التحكم",
  showSearch = true,
  showNotifications = true,
  onMenuClick,
}: DashboardMobileHeaderProps) {
  const { darkMode, toggleDarkMode } = useDarkModeContext();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState([
    {
      id: 1,
      message: "مقال جديد في انتظار المراجعة",
      type: "info",
      time: "5 دقائق",
    },
    {
      id: 2,
      message: "تم نشر 3 مقالات جديدة",
      type: "success",
      time: "10 دقائق",
    },
    {
      id: 3,
      message: "تحديث في إعدادات النظام",
      type: "warning",
      time: "1 ساعة",
    },
  ]);

  // عناصر القائمة الجانبية
  const dashboardMenuItems = [
    { label: "الرئيسية", url: "/dashboard", icon: LayoutDashboard },
    { label: "المقالات", url: "/dashboard/articles", icon: FileText },
    { label: "المستخدمين", url: "/dashboard/users", icon: Users },
    { label: "الإحصائيات", url: "/dashboard/analytics", icon: BarChart3 },
    { label: "النشاطات", url: "/dashboard/activities", icon: Activity },
    { label: "الإعدادات", url: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* الهيدر الرئيسي */}
      <header
        className={`
        sticky top-0 z-50 w-full border-b transition-all duration-300
        ${
          darkMode
            ? "bg-gray-800/95 border-gray-700 backdrop-blur-sm"
            : "bg-white/95 border-gray-200 backdrop-blur-sm"
        }
      `}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* الجهة اليمنى - القائمة واللوجو */}
          <div className="flex items-center gap-3">
            {/* زر القائمة */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                onMenuClick?.();
              }}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }
              `}
              aria-label="قائمة لوحة التحكم"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* اللوجو والعنوان */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <SabqLogo className="w-8 h-8" />
              <div className="hidden sm:block">
                <h1
                  className={`
                  text-lg font-bold transition-colors duration-300
                  ${darkMode ? "text-white" : "text-gray-800"}
                `}
                >
                  {title}
                </h1>
                <p
                  className={`
                  text-xs transition-colors duration-300
                  ${darkMode ? "text-gray-400" : "text-gray-500"}
                `}
                >
                  منصة سبق الذكية
                </p>
              </div>
            </Link>
          </div>

          {/* الجهة اليسرى - الأدوات */}
          <div className="flex items-center gap-2">
            {/* زر البحث */}
            {showSearch && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  }
                `}
                aria-label="البحث"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* زر الإشعارات */}
            {showNotifications && (
              <div className="relative">
                <button
                  className={`
                    p-2 rounded-lg transition-colors duration-200 relative
                    ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-600"
                    }
                  `}
                  aria-label="الإشعارات"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {notifications.length}
                      </span>
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* زر وضع الظلام */}
            <button
              onClick={toggleDarkMode}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${
                  darkMode
                    ? "hover:bg-gray-700 text-yellow-400"
                    : "hover:bg-gray-100 text-gray-600"
                }
              `}
              aria-label="تبديل وضع الظلام"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* قائمة المستخدم */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg transition-colors duration-200
                  ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  }
                `}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0) || "م"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* قائمة المستخدم المنسدلة */}
              {userMenuOpen && (
                <div
                  className={`
                  absolute left-0 mt-2 w-56 rounded-lg shadow-lg border z-50
                  ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }
                `}
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user?.name || "مستخدم"}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {user?.email || "admin@sabq.ai"}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/dashboard/settings"
                      className={`
                        flex items-center gap-3 px-3 py-2 text-sm transition-colors
                        ${
                          darkMode
                            ? "hover:bg-gray-700 text-gray-300"
                            : "hover:bg-gray-100 text-gray-700"
                        }
                      `}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      الإعدادات
                    </Link>

                    <button
                      onClick={handleLogout}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors
                        ${
                          darkMode
                            ? "hover:bg-red-900/20 text-red-400"
                            : "hover:bg-red-50 text-red-600"
                        }
                      `}
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* شريط البحث المنسدل */}
        {searchOpen && (
          <div
            className={`
            border-t px-4 py-3
            ${
              darkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }
          `}
          >
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث في لوحة التحكم..."
                  className={`
                    w-full px-4 py-2 rounded-lg border transition-colors
                    ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }
                  `}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                بحث
              </button>
            </form>
          </div>
        )}
      </header>

      {/* القائمة الجانبية للموبايل */}
      {mobileMenuOpen && (
        <>
          {/* الخلفية المعتمة */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* القائمة الجانبية */}
          <div
            className={`
            fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 overflow-y-auto
            ${darkMode ? "bg-gray-800" : "bg-white"}
            ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
          >
            {/* رأس القائمة */}
            <div
              className={`
              flex items-center justify-between p-4 border-b
              ${darkMode ? "border-gray-700" : "border-gray-200"}
            `}
            >
              <div className="flex items-center gap-3">
                <SabqLogo className="w-8 h-8" />
                <div>
                  <h2
                    className={`font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    لوحة التحكم
                  </h2>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    منصة سبق الذكية
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
                `}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* عناصر القائمة */}
            <nav className="p-4 space-y-2">
              {dashboardMenuItems.map((item) => {
                const isActive = pathname === item.url;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? darkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                          : darkMode
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* رابط العودة للموقع */}
            <div
              className={`
              p-4 border-t mt-auto
              ${darkMode ? "border-gray-700" : "border-gray-200"}
            `}
            >
              <Link
                href="/"
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-300 border border-gray-600"
                      : "hover:bg-gray-100 text-gray-700 border border-gray-300"
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">عرض الموقع</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* إغلاق القوائم عند النقر خارجها */}
      {(userMenuOpen || searchOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setUserMenuOpen(false);
            setSearchOpen(false);
          }}
        />
      )}
    </>
  );
}
