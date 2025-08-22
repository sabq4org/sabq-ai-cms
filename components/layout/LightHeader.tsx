"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, User, Moon, Sun, Home, Newspaper, Grid3X3, Sparkles, Brain, Palette } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

// نظام الألوان المتغيرة المطور
const themes = [
  { 
    id: 'default', 
    name: 'بلا لون', 
    color: '#3b82f6', // اللون الافتراضي للموقع
    rgb: '59 130 246',
    gradient: 'from-blue-500 to-blue-600',
    isDefault: true 
  },
  { 
    id: 'blue', 
    name: 'أزرق', 
    color: '#3b82f6', 
    rgb: '59 130 246',
    gradient: 'from-blue-500 to-blue-600' 
  },
  { 
    id: 'green', 
    name: 'أخضر', 
    color: '#10b981', 
    rgb: '16 185 129',
    gradient: 'from-green-500 to-green-600' 
  },
  { 
    id: 'purple', 
    name: 'بنفسجي', 
    color: '#8b5cf6', 
    rgb: '139 92 246',
    gradient: 'from-purple-500 to-purple-600' 
  },
  { 
    id: 'pink', 
    name: 'وردي', 
    color: '#ec4899', 
    rgb: '236 72 153',
    gradient: 'from-pink-500 to-pink-600' 
  },
  { 
    id: 'orange', 
    name: 'برتقالي', 
    color: '#f59e0b', 
    rgb: '245 158 11',
    gradient: 'from-orange-500 to-orange-600' 
  },
  { 
    id: 'red', 
    name: 'أحمر', 
    color: '#ef4444', 
    rgb: '239 68 68',
    gradient: 'from-red-500 to-red-600' 
  },
];

interface LightHeaderProps {
  className?: string;
}

export default function LightHeader({ className = '' }: LightHeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const { darkMode, toggleDarkMode, mounted } = useDarkModeContext();
  const { logoUrl, siteName, loading: settingsLoading } = useSiteSettings();
  const { user, isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // تحميل اللون المحفوظ عند التحميل
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-color');
    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme) || themes[0];
      setCurrentTheme(theme);
      applyThemeToDOM(theme);
    }
  }, []);

  // إغلاق القوائم عند تغيّر المسار
  useEffect(() => {
    if (isSidebarOpen || userMenuOpen) {
      setIsSidebarOpen(false);
      setUserMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // إغلاق قائمة المستخدم عند الضغط خارجها
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (!userMenuOpen) return;
      const target = e.target as Node | null;
      if (userMenuRef.current && target && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside, { passive: true } as any);
    document.addEventListener('touchstart', handleOutside, { passive: true } as any);
    return () => {
      document.removeEventListener('mousedown', handleOutside as any);
      document.removeEventListener('touchstart', handleOutside as any);
    };
  }, [userMenuOpen]);

  // تحويل Hex إلى HSL (لضبط متغيرات --accent كما في النسخة الكاملة)
  const hexToHsl = (hex: string) => {
    let r = 0, g = 0, b = 0;
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length === 6) {
      r = parseInt(clean.substring(0, 2), 16);
      g = parseInt(clean.substring(2, 4), 16);
      b = parseInt(clean.substring(4, 6), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; let l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const setThemeVars = (theme: typeof themes[0]) => {
    const root = document.documentElement;
    // إزالة جميع data-theme attributes
    themes.forEach(t => root.removeAttribute(`data-theme-${t.id}`));
    
    if (theme.isDefault) {
      // إذا كان "بلا لون"، إزالة جميع المتغيرات المخصصة
      root.removeAttribute('data-theme');
      root.style.removeProperty('--theme-primary');
      root.style.removeProperty('--theme-primary-rgb');
      root.style.removeProperty('--theme-primary-light');
      root.style.removeProperty('--theme-primary-lighter');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-hover');
      root.style.removeProperty('--accent-light');
    } else {
      // تطبيق theme الجديد
      root.setAttribute('data-theme', theme.id);
      root.style.setProperty('--theme-primary', theme.color);
      root.style.setProperty('--theme-primary-rgb', theme.rgb);
      root.style.setProperty('--theme-primary-light', `rgba(${theme.rgb}, 0.1)`);
      root.style.setProperty('--theme-primary-lighter', `rgba(${theme.rgb}, 0.05)`);

      // ضبط متغيرات النسخة الكاملة (--accent*) لضمان توافق البلوكات القديمة
      const { h, s, l } = hexToHsl(theme.color);
      const hoverL = Math.max(0, Math.min(100, l - 5));
      const lightL = 96; // كما في النسخة الكاملة تقريباً
      root.style.setProperty('--accent', `${h} ${s}% ${l}%`);
      root.style.setProperty('--accent-hover', `${h} ${s}% ${hoverL}%`);
      root.style.setProperty('--accent-light', `${h} ${s}% ${lightL}%`);
    }
  };

  // تطبيق اللون على DOM
  const applyThemeToDOM = (theme: typeof themes[0]) => {
    setThemeVars(theme);
  };

  // تطبيق اللون المختار
  const applyTheme = (theme: typeof themes[0]) => {
    setCurrentTheme(theme);
    setThemeVars(theme);
    localStorage.setItem('theme-color', theme.id);
  };

  // عناصر القائمة الجانبية
  const menuItems = [
    { icon: Home, label: 'الرئيسية', href: '/', description: 'الصفحة الرئيسية' },
    { icon: Newspaper, label: 'الأخبار', href: '/news', description: 'آخر الأخبار والمستجدات' },
    { icon: Grid3X3, label: 'الأقسام', href: '/categories', description: 'تصفح حسب القسم' },
    { icon: Sparkles, label: 'مقترب', href: '/muqtarab', description: 'مقالات إبداعية متنوعة' },
    { icon: Brain, label: 'عمق', href: '/deep-analysis', description: 'تحليلات معمقة' },
  ];

  // تشخيص - إضافة console.log لمعرفة حالة الهيدر
  useEffect(() => {
    console.log('🔍 حالة LightHeader:', { mounted, settingsLoading, pathname, logoUrl, siteName });
  }, [mounted, settingsLoading, pathname, logoUrl, siteName]);

  // منع التحميل قبل mount للتجنب hydration errors
  if (!mounted || settingsLoading) {
    console.log('⏳ LightHeader - في وضع التحميل:', { mounted, settingsLoading });
    return (
      <header className={`sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-red-200/95 dark:bg-red-900/85 backdrop-blur supports-[backdrop-filter]:bg-red-200/70 dark:supports-[backdrop-filter]:bg-red-900/60 ${className}`}>
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="w-16 h-6 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
          </div>
          <div className="text-xs text-red-600">تحميل هيدر...</div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* الهيدر الرئيسي */}
      <header className={`sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-gray-200/95 dark:bg-gray-900/85 backdrop-blur supports-[backdrop-filter]:bg-gray-200/70 dark:supports-[backdrop-filter]:bg-gray-900/60 ${className}`}>
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          {/* الجانب الأيمن: زر القائمة + اللوجو */}
          <div className="flex items-center gap-0">
            {/* زر القائمة الجانبية */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="px-1.5 py-2 bg-transparent rounded-none transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 hover:bg-transparent"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>

            {/* اللوجو الأصلي - متحرك يميناً */}
            <Link href="/" className="flex items-center group -mr-2 -ml-1">
              {settingsLoading ? (
                <div className="w-[140px] md:w-[200px] h-10 md:h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ) : (
                logoUrl && (
                  <div className="relative h-10 md:h-12 w-[140px] md:w-[200px] transition-all duration-200 group-hover:scale-105">
                    <Image
                      src={logoUrl}
                      alt={siteName || "سبق"}
                      fill
                      className="object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200 mix-blend-multiply dark:mix-blend-normal"
                      priority
                      unoptimized={logoUrl.startsWith("http")}
                    />
                  </div>
                )
              )}
            </Link>
          </div>

          {/* الجانب الأيسر: الوضع الليلي + الملف الشخصي */}
          <div className="flex items-center gap-2">
            {/* تبديل الوضع الليلي */}
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-transparent rounded-none transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 hover:bg-transparent"
              aria-label="تبديل الوضع الليلي"
              title={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* الملف الشخصي */}
            {!isLoggedIn ? (
              <Link
                href={typeof window !== 'undefined' ? `/login?next=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}` : '/login'}
                className="p-2 bg-transparent rounded-none transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 hover:bg-transparent"
                title="تسجيل الدخول"
                aria-label="تسجيل الدخول"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </Link>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="p-2 bg-transparent rounded-none transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 hover:bg-transparent"
                  aria-label="قائمة المستخدم"
                  title={user?.name || 'قائمة المستخدم'}
                >
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-10 left-0 min-w-[180px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-50">
                    <div className="py-2 text-sm">
                      <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">الملف الشخصي</Link>
                      <Link href="/favorites" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">المفضلة</Link>
                      <Link href="/bookmarks" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">المحفوظات</Link>
                      <button
                        onClick={async () => {
                          try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-right px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* القائمة الجانبية المطورة */}
      {isSidebarOpen && (
        <>
          {/* خلفية شفافة */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* القائمة */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform shadow-2xl">
            <div className="p-6 h-full flex flex-col">
              {/* رأس القائمة */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {settingsLoading ? (
                    <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  ) : (
                    logoUrl && (
                      <div className="relative w-20 h-8">
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
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">النسخة الخفيفة</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95 text-gray-500 dark:text-gray-400"
                  aria-label="إغلاق القائمة"
                >
                  ✕
                </button>
              </div>

              {/* عناصر القائمة */}
              <nav className="space-y-2 flex-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group active:scale-95"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: `${currentTheme.color}20` }}
                    >
                      <item.icon 
                        className="w-4 h-4 transition-colors duration-200" 
                        style={{ color: currentTheme.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>

              {/* نظام الألوان في القائمة */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">نظام الألوان</h3>
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => applyTheme(theme)}
                      className={`relative w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 active:scale-95 ${
                        currentTheme.id === theme.id 
                          ? 'border-gray-900 dark:border-white scale-105' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: theme.isDefault ? '#e5e7eb' : theme.color }}
                      title={theme.name}
                    >
                      {theme.isDefault ? (
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-300" />
                          {currentTheme.id === theme.id && (
                            <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-gray-600 dark:bg-gray-200 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      ) : currentTheme.id === theme.id && (
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  اللون الحالي: <span className="font-medium">{currentTheme.name}</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
