"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useAuth } from "@/contexts/AuthContext";
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
import NotificationBell from "@/components/Notifications/NotificationBell";
import { NotificationDropdown } from "@/components/Notifications/NotificationDropdown";

export default function Header() {
  const router = useRouter();
  const { darkMode, mounted, toggleDarkMode } = useDarkModeContext();
  const { logoUrl, siteName, loading: settingsLoading } = useSiteSettings();

  // Auth state (موحد)
  const { user, logout, refreshUser } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerElRef = useRef<HTMLElement>(null);
  const mobileUserBtnRef = useRef<HTMLButtonElement>(null);
  const [isMobileUserOpen, setIsMobileUserOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userAnchorRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

  // بعد العودة من تسجيل الدخول، حاول تحديث المستخدم فوراً
  useEffect(() => {
    refreshUser?.().catch(() => {});
  }, [refreshUser]);

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
            {/* الشعار */}
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

            {/* المينيو الرئيسية */}
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
                </Link>
              ))}
            </nav>

            {/* أدوات الهيدر */}
            <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse header-tools">
              {/* زر لحظة بلحظة - يظهر على الشاشات المتوسطة فأعلى فقط */}
              <Link
                href="/moment-by-moment"
                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                aria-label="لحظة بلحظة"
                title="لحظة بلحظة"
              >
                <Activity className="h-6 w-6" />
                {newEventsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                    {newEventsCount > 99 ? '99+' : newEventsCount}
                  </span>
                )}
              </Link>

              {/* زر الوضع الليلي */}
              <button
                onClick={toggleDarkMode}
                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                aria-label={darkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
                title={darkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
              >
                {darkMode ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>

              {/* الإشعارات الذكية */}
              {/* سطح المكتب: قائمة منسدلة متقدمة */}
              <div className="hidden md:block">
                <NotificationDropdown />
              </div>
              {/* الجوال: جرس بسيط مع عدّاد - يظهر فقط على الشاشات الصغيرة */}
              <div className="md:hidden" id="mobile-notification-bell">
                <NotificationBell />
              </div>

              {/* المستخدم أو تسجيل الدخول */}
              {user ? (
                <button
                  ref={userAnchorRef as any}
                  onClick={() => setUserOpen((v) => !v)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode
                      ? "text-blue-300 hover:text-white hover:bg-blue-800/40"
                      : "text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                  }`}
                >
                  <User className="w-4 h-4" />
                  {user.name || "حسابي"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    darkMode
                      ? "text-blue-300 hover:text-white hover:bg-blue-800/40"
                      : "text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                  }`}
                  title="تسجيل الدخول"
                >
                  <LogIn className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* قائمة المستخدم */}
      {user && (
        <UserDropdown
          user={user as any}
          onLogout={handleLogout}
          anchorElement={userAnchorRef.current as any}
          open={userOpen}
          onClose={() => setUserOpen(false)}
        />
      )}
    </>
  );
}
