"use client";

import { useState, useEffect } from "react";
import { Search, Bell, User, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface SmartHeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

export default function SmartHeader({ user }: SmartHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("");
  const { theme, setTheme } = useTheme();

  // تحديد التحية بناءً على الوقت
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("صباح الخير");
    } else if (hour < 18) {
      setGreeting("مساء الخير");
    } else {
      setGreeting("مساء الخير");
    }
  }, []);

  const navigationItems = [
    { name: "الرئيسية", href: "/" },
    { name: "الأخبار", href: "/news" },
    { name: "الأقسام", href: "/sections" },
    { name: "مقترب", href: "/muqtarab" },
    { name: "عمق", href: "/deep-analysis" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // تنفيذ البحث الذكي
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* الشعار */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="relative">
                <Image
                  src="/images/sabq-logo.svg"
                  alt="سبق الذكية"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />
                </div>
              </div>
            </Link>
          </div>

          {/* القائمة الرئيسية - الديسكتوب */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* الأدوات والمستخدم */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* البحث الذكي */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                aria-label="البحث الذكي"
              >
                <Search className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ابحث بالذكاء الاصطناعي..."
                          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        البحث مدعوم بالذكاء الاصطناعي
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* الإشعارات */}
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 relative"
              aria-label="الإشعارات"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* تبديل الوضع الليلي */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              aria-label="تبديل الوضع"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>

            {/* المستخدم */}
            {user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="hidden md:block text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {greeting}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                </div>
                <div className="relative">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                تسجيل الدخول
              </Link>
            )}

            {/* قائمة الموبايل */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* القائمة المحمولة */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
