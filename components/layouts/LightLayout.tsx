"use client";

import { Moon, Sun, Menu, X, Home, Newspaper, Folder, Target, Brain, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useAuth } from "@/hooks/useAuth";
import "@/styles/light-layout.css";

interface LightLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { label: "الرئيسية", href: "/", icon: Home },
  { label: "الأخبار", href: "/news", icon: Newspaper },
  { label: "الأقسام", href: "/categories", icon: Folder },
  { label: "مقترب", href: "/muqtarab", icon: Target },
  { label: "عمق", href: "/insights/deep", icon: Brain },
];

export default function LightLayout({ children }: LightLayoutProps) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkModeContext();
  const { user } = useAuth();

  // إلغاء شرط mounted حتى يظهر الهيدر فوراً دون تأخير/وميض

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

  // إظهار الهيدر مباشرة في SSR وCSR

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60"
        style={{
          borderColor: 'var(--theme-primary, #3B82F6)20',
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
                  src="/logo.png"
                  alt="سبق الذكية"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                  priority
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

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isSideMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSideMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Side Menu */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 z-50 h-full w-72 bg-white dark:bg-gray-900 shadow-xl"
            >
              {/* Menu Header */}
              <div 
                className="flex h-16 items-center justify-between px-4 border-b"
                style={{
                  borderColor: 'var(--theme-primary, #3B82F6)20',
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
                <ul className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsSideMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            ':hover': {
                              backgroundColor: `var(--theme-primary, #3B82F6)10`,
                              color: 'var(--theme-primary, #3B82F6)',
                            }
                          }}
                        >
                          <Icon 
                            className="h-5 w-5"
                            style={{
                              color: 'var(--theme-primary, #3B82F6)',
                            }}
                          />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
