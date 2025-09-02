"use client";

import { Moon, Sun, Menu, X, Home, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface LightLayoutProps {
  children: React.ReactNode;
}

// قائمة مبسطة
const navigationItems = [
  { label: "الرئيسية", href: "/" },
  { label: "آخر الأخبار", href: "/news" },
  { label: "الأقسام", href: "/categories" },
];

export default function LightLayout({ children }: LightLayoutProps) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { user } = useAuth();
  const { logoUrl, logoDarkUrl } = useSiteSettings();

  // إغلاق القائمة عند تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSideMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // منع التمرير عند فتح القائمة
  useEffect(() => {
    if (isSideMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSideMenuOpen]);

  // إزالة شرط الإظهار بعد mount لتجنّب الوميض الأبيض وتأخير العرض

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 w-full border-b border-white/30 dark:border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-gray-900/40"
        style={{
          borderColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.18)',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Right Side: Menu + Logo */}
            <div className="flex items-center gap-3">
              {/* Menu Toggle */}
              <button
                onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{
                  color: 'var(--theme-primary, #3B82F6)',
                }}
                aria-label="تبديل القائمة"
              >
                {isSideMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center">
                <Image
                  src={(darkMode ? (logoDarkUrl || logoUrl) : (logoUrl || "/logo.png")) as string}
                  alt="سبق الذكية"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                  priority
                  unoptimized={Boolean((darkMode ? (logoDarkUrl || logoUrl) : (logoUrl || "/logo.png"))?.toString().startsWith("http"))}
                />
              </Link>
            </div>

            {/* Left Side: Profile + Dark Mode */}
            <div className="flex items-center gap-2">
              {/* Profile */}
              <Link
                href={user ? "/profile" : "/login"}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{
                  color: 'var(--theme-primary, #3B82F6)',
                }}
                aria-label="الملف الشخصي"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{
                  color: 'var(--theme-primary, #3B82F6)',
                }}
                aria-label="تبديل الوضع الليلي"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu - مبسط بدون animations */}
      {isSideMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsSideMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />

          {/* Side Menu */}
          <aside className="fixed right-0 top-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-xl">
              {/* Menu Header */}
              <div 
                className="flex h-16 items-center justify-between px-4 border-b"
                style={{
                  borderColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.2)',
                }}
              >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  القائمة الرئيسية
                </h2>
                <button
                  onClick={() => setIsSideMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style={{
                    color: 'var(--theme-primary, #3B82F6)',
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="p-4">
                <ul className="space-y-1">
                  {navigationItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsSideMenuOpen(false)}
                        className="block rounded px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* User Info (if logged in) */}
              {user && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: 'var(--theme-primary, #3B82F6)',
                      }}
                    >
                      {user.name?.charAt(0) || "م"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name || "مستخدم"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
