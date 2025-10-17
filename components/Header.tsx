"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Activity,
  Brain,
  ChevronDown,
  Folder,
  Home,
  LogIn,
  Moon,
  Newspaper,
  Sun,
  Target,
  User,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ClientOnly from "./ClientOnly";
import UserDropdown from "./UserDropdown";
import { NotificationDropdown } from '@/components/Notifications/NotificationDropdownOptimized';

/**
 * مكون الهيدر المحسّن (Enhanced Header)
 * 
 * التحسينات الرئيسية:
 * - تصميم أنظف وأبسط
 * - استخدام نظام الألوان الجديد (brand colors)
 * - تحسين التباين والوضوح
 * - إضافة تأثيرات حركية دقيقة (micro-interactions)
 * - تحسين تجربة المستخدم على الأجهزة المختلفة
 */
export default function HeaderEnhanced() {
  const router = useRouter();
  const { darkMode, mounted, toggleDarkMode } = useDarkModeContext();
  const { logoUrl, siteName, loading: settingsLoading } = useSiteSettings();

  // Auth state
  const { user, logout, refreshUser } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const headerElRef = useRef<HTMLElement>(null);
  const userAnchorRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

  // تحديث المستخدم بعد تسجيل الدخول (مرة واحدة فقط)
  useEffect(() => {
    refreshUser?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // تنفيذ مرة واحدة فقط عند mount

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
    const interval = setInterval(checkEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  // عناصر المينيو الرئيسية
  const navigationItems = [
    { url: "/", label: "الرئيسية", icon: Home },
    { url: "/news", label: "الأخبار", icon: Newspaper },
    { url: "/categories", label: "الأقسام", icon: Folder, hasDropdown: true },
    { url: "/muqtarab", label: "مُقترب", icon: Target },
    { url: "/insights/deep", label: "عمق", icon: Brain },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    try { await logout(); } catch {}
    try { setIsDropdownOpen(false); } catch {}
    try { toast.success("تم تسجيل الخروج بنجاح"); } catch {}
    router.replace("/");
  };

  // ضبط متغير ارتفاع الهيدر
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

  if (!mounted) {
    return null;
  }

  return (
    <>
      <motion.header
        ref={headerElRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          darkMode
            ? "bg-brand-primaryDark/95 backdrop-blur-lg border-gray-800"
            : "bg-white/95 backdrop-blur-lg border-brand-borderLight"
        } border-b shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* الشعار */}
            <Link
              href="/"
              className="flex-shrink-0 hover:scale-105 transition-transform duration-200"
            >
              {settingsLoading ? (
                <div className="h-10 w-36 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                logoUrl && (
                  <div className="relative w-36 h-10">
                    <Image
                      src={logoUrl}
                      alt={siteName || "سبق"}
                      fill
                      className="object-contain"
                      priority
                      unoptimized={logoUrl.startsWith("http")}
                    />
                  </div>
                )
              )}
            </Link>

            {/* المينيو الرئيسية - Desktop */}
            <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
              {navigationItems.map((item) => (
                <motion.div
                  key={item.url}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      darkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                        : "text-brand-fg hover:text-brand-primary hover:bg-brand-secondary"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* أدوات الهيدر */}
            <div className="flex items-center gap-2">
              
              {/* زر البحث */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    : "text-brand-fgMuted hover:text-brand-primary hover:bg-brand-secondary"
                }`}
                aria-label="البحث"
                title="البحث"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* زر لحظة بلحظة */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="/moment-by-moment"
                  className={`relative p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      : "text-brand-fgMuted hover:text-brand-primary hover:bg-brand-secondary"
                  }`}
                  aria-label="لحظة بلحظة"
                  title="لحظة بلحظة"
                >
                  <Activity className="w-5 h-5" />
                  {newEventsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-brand-danger text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center"
                    >
                      {newEventsCount > 9 ? '9+' : newEventsCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* زر الوضع الليلي */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    : "text-brand-fgMuted hover:text-brand-primary hover:bg-brand-secondary"
                }`}
                aria-label={darkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
                title={darkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* الإشعارات */}
              {user && <NotificationDropdown />}

              {/* المستخدم أو تسجيل الدخول */}
              {user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  ref={userAnchorRef as any}
                  onClick={() => setUserOpen((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      : "text-brand-primary hover:text-brand-primaryDark hover:bg-brand-secondary"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name || "حسابي"}</span>
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      darkMode
                        ? "bg-brand-accent/20 text-brand-accentLight hover:bg-brand-accent/30"
                        : "bg-brand-accent text-brand-accentFg hover:bg-brand-accentDark"
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">تسجيل الدخول</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

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

