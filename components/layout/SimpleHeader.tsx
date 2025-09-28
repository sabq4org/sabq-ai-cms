"use client";

/**
 * هيدر مبسط لا يستخدم نظام المصادقة الموحد
 * لحل مشكلة البناء في صفحات not-found
 */

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Activity,
  Brain,
  Edit,
  Folder,
  Home,
  LogIn,
  Menu,
  Newspaper,
  User,
  UserPlus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ClientOnly from "../ClientOnly";

export default function SimpleHeader() {
  const router = useRouter();
  const { darkMode, mounted, toggleDarkMode } = useDarkModeContext();
  const { logoUrl, siteName, loading: settingsLoading } = useSiteSettings();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!mounted) {
    return null; // تجنب مشاكل الهيدرة
  }

  return (
    <ClientOnly>
      <header 
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
              {/* أزرار تسجيل الدخول */}
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
                <Link 
                  href="/trending" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Activity className="w-4 h-4" />
                  الأكثر قراءة
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </ClientOnly>
  );
}
