"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ClientOnly from "./ClientOnly";
import UserDropdown from "./UserDropdown";
import MobileUserDropdown from "./mobile/UserDropdown";
import UserMenuDrawer from "./mobile/UserMenuDrawer";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Header() {
  const router = useRouter();
  const { darkMode, mounted, toggleDarkMode } = useDarkModeContext();
  const { logoUrl, siteName, loading: settingsLoading } = useSiteSettings();

  // Auth state
  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerElRef = useRef<HTMLElement>(null);
  const mobileUserBtnRef = useRef<HTMLButtonElement>(null);
  const [isMobileUserOpen, setIsMobileUserOpen] = useState(false);

  // فحص الأحداث الجديدة
  useEffect(() => {
    const checkEvents = async () => {
      try {
        const response = await fetch("/api/moment-by-moment/count");
        if (response.ok) {
          const data = await response.json();
          setNewEventsCount(data.count || 0);
        }
      } catch (error) {
        console.error("خطأ في جلب عدد الأحداث:", error);
      }
    };

    checkEvents();
    const interval = setInterval(checkEvents, 30000); // فحص كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  // عناصر المينيو الرئيسية
  const navigationItems = [
    { url: "/", label: "الرئيسية", icon: Home, highlight: false },
    { url: "/news", label: "الأخبار", icon: Newspaper, highlight: false },
    {
      url: "/opinion-articles",
      label: "المقالات",
      icon: Edit,
      highlight: false,
    },
    { url: "/categories", label: "الأقسام", icon: Folder, highlight: false },
    { url: "/muqtarab", label: "مُقترب", icon: Target, highlight: false },
    { url: "/insights/deep", label: "عمق", icon: Brain, highlight: false },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      router.push("/");
      toast.success("تم تسجيل الخروج بنجاح");
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ضبط متغير ارتفاع الهيدر لإضافة مسافة أعلى المحتوى
  useEffect(() => {
    const updateHeaderHeights = () => {
      const h = headerElRef.current?.offsetHeight || 64;
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--header-height", `${h}px`);
        document.documentElement.style.setProperty("--mobile-header-height", `${Math.min(h, 56)}px`);
      }
    };

    updateHeaderHeights();
    window.addEventListener("resize", updateHeaderHeights);
    return () => window.removeEventListener("resize", updateHeaderHeights);
  }, []);

  // عدم عرض أي شيء حتى يتم تحميل الثيم
  if (!mounted) {
    return null;
  }

  return (
    <>
      <header
        ref={headerElRef}
        className={`fixed-header transition-all duration-300 relative z-40 ${
          darkMode
            ? "bg-gray-900/95 border-gray-800"
            : "bg-blue-50/95 border-blue-200"
        } border-b shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          <div className="flex items-center justify-between h-full">
            {/* الشعار الرسمي - محاذاة لليمين مع تحسينات المظهر */}
            <Link
              href="/"
              className="flex-shrink-0 relative z-50 hover:scale-105 transition-transform duration-200 header-logo-wrapper ml-auto"
            >
              {settingsLoading ? (
                <div className="h-8 sm:h-10 w-28 sm:w-36 animate-pulse"></div>
              ) : (
                logoUrl && (
                  <div className="relative w-28 sm:w-36 h-8 sm:h-10 bg-transparent overflow-visible logo-container sabq-logo logo-fix">
                    <Image
                      src={logoUrl}
                      alt="سبق"
                      fill
                      className="object-contain drop-shadow-sm hover:drop-shadow-md transition-all duration-200 logo-fix"
                      priority
                      unoptimized={logoUrl.startsWith("http")}
                    />
                  </div>
                )
              )}
            </Link>

            {/* المينيو الرئيسية - Desktop - مع تحسين المسافات */}
            <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse flex-1 justify-center">
              {navigationItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`relative flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    item.highlight
                      ? darkMode
                        ? "text-red-400 hover:text-red-300 hover:bg-blue-800/40"
                        : "text-red-600 hover:text-red-700 hover:bg-blue-600/20"
                      : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-blue-800/40"
                      : "text-gray-700 hover:text-gray-900 hover:bg-blue-600/20"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label && <span>{item.label}</span>}
                  {/* شارة "جديد" للعناصر الجديدة */}
                  {(item as any).isNew && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                      جديد
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* أدوات الهيدر */}
            <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse">
              {/* الجرس */}
              <div className="hidden md:block">
                <NotificationBell />
              </div>
              {/* أيقونة لحظة بلحظة */}
              <Link
                href="/moment-by-moment"
                className={`relative p-2 rounded-lg transition-all duration-300 ${
                  darkMode
                    ? "text-red-400 hover:text-red-300 hover:bg-blue-800/40"
                    : "text-red-600 hover:text-red-700 hover:bg-blue-600/20"
                }`}
                aria-label="لحظة بلحظة"
              >
                <Activity className="w-5 h-5" />
                {newEventsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
                    {newEventsCount > 9 ? "9+" : newEventsCount}
                  </span>
                )}
              </Link>

              {/* الوضع الليلي */}
              <ClientOnly
                fallback={
                  <button className="p-2 rounded-md transition-colors duration-200 text-gray-600 hover:text-gray-800">
                    <Moon className="w-5 h-5" />
                  </button>
                }
              >
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                    darkMode
                      ? "text-yellow-400 hover:text-yellow-300 hover:bg-blue-800/40"
                      : "text-gray-600 hover:text-gray-800 hover:bg-blue-600/20"
                  }`}
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              </ClientOnly>

              {/* معلومات المستخدم */}
              {user ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={handleDropdownToggle}
                    className={`flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg transition-all duration-300 ${
                      darkMode
                        ? "text-gray-300 hover:text-white hover:bg-blue-800/40"
                        : "text-gray-700 hover:text-gray-900 hover:bg-blue-600/20"
                    }`}
                  >
                    {user?.avatar ? (
                      <Image
                        src={user.avatar as string}
                        alt={(user?.name as string) || "user"}
                        width={32}
                        height={32}
                        className="user-avatar"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.name || user?.email?.split("@")[0] || "مستخدم"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isDropdownOpen && user && (
                    <UserDropdown
                      user={{
                        id: user.id,
                        name:
                          user.name || user.email?.split("@")[0] || "مستخدم",
                        email: user.email,
                        avatar: user.avatar,
                        role: user.role,
                      }}
                      onLogout={handleLogout}
                      onClose={handleDropdownClose}
                    />
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    darkMode
                      ? "text-gray-300 hover:text-white hover:bg-blue-800/40"
                      : "text-gray-700 hover:text-gray-900 hover:bg-blue-600/20"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </Link>
              )}

              {/* زر وقائمة ملف شخصي للموبايل فقط */}
              {user && (
                <div className="md:hidden relative">
                  <UserMenuDrawer
                    trigger={
                      <button
                        ref={mobileUserBtnRef}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          darkMode
                            ? "text-gray-300 hover:text-white hover:bg-blue-800/40"
                            : "text-gray-700 hover:text-gray-900 hover:bg-blue-600/20"
                        }`}
                        aria-label="قائمة المستخدم للموبايل"
                        aria-haspopup="menu"
                      >
                        <span className="inline-flex items-center gap-1">
                          <User className="w-5 h-5" />
                          <ChevronDown className="w-3 h-3 opacity-70" />
                        </span>
                      </button>
                    }
                  />
                </div>
              )}

              {/* المينيو المحمول */}
              <button
                onClick={toggleMobileMenu}
                className={`md:hidden p-2 rounded-lg transition-all duration-300 ${
                  darkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-blue-800/40"
                    : "text-gray-600 hover:text-gray-800 hover:bg-blue-600/20"
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* المينيو المحمول */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop overlay */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <div
                className={`md:hidden fixed top-[var(--header-height)] left-0 right-0 z-50 ${
                  darkMode ? "bg-gray-900/98" : "bg-white/98"
                } backdrop-blur-md shadow-2xl border-t ${
                  darkMode ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <nav className="flex flex-col max-h-[calc(100vh-var(--header-height))] overflow-y-auto py-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`relative flex items-center space-x-2 rtl:space-x-reverse px-6 py-4 text-base font-medium transition-all duration-300 ${
                        item.highlight
                          ? darkMode
                            ? "text-red-400 hover:text-red-300 hover:bg-blue-800/40"
                            : "text-red-600 hover:text-red-700 hover:bg-blue-600/20"
                          : darkMode
                          ? "text-gray-300 hover:text-white hover:bg-blue-800/40"
                          : "text-gray-700 hover:text-gray-900 hover:bg-blue-600/20"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label && <span>{item.label}</span>}
                      {/* شارة "جديد" للعناصر الجديدة في المحمول */}
                      {(item as any).isNew && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                          جديد
                        </span>
                      )}
                    </Link>
                  ))}

                  {/* روابط إضافية للمحمول */}

                </nav>
              </div>
            </>
          )}
        </div>
      </header>
      {/* مباعد أسفل الهيدر لضمان مسافة فارغة قبل المحتوى */}
      <div
        aria-hidden="true"
        style={{ height: "var(--header-height, 64px)" }}
      />
    </>
  );
}
