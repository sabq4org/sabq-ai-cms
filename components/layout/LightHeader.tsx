"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, User, Moon, Sun, Home, Newspaper, Grid3X3, Sparkles, Brain, Palette } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// نظام الألوان المتغيرة المطور
const themes = [
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const { darkMode, toggleDarkMode, mounted } = useDarkModeContext();
  const { logoUrl, siteName, loading: settingsLoading } = useSiteSettings();

  // تحميل اللون المحفوظ عند التحميل
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-color');
    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme) || themes[0];
      setCurrentTheme(theme);
      applyThemeToDOM(theme);
    }
  }, []);

  // تطبيق اللون على DOM
  const applyThemeToDOM = (theme: typeof themes[0]) => {
    const root = document.documentElement;
    
    // إزالة جميع data-theme attributes
    themes.forEach(t => root.removeAttribute(`data-theme-${t.id}`));
    
    // تطبيق theme الجديد
    root.setAttribute('data-theme', theme.id);
    root.style.setProperty('--theme-primary', theme.color);
    root.style.setProperty('--theme-primary-rgb', theme.rgb);
    root.style.setProperty('--theme-primary-light', `rgba(${theme.rgb}, 0.1)`);
    root.style.setProperty('--theme-primary-lighter', `rgba(${theme.rgb}, 0.05)`);
  };

  // تطبيق اللون المختار
  const applyTheme = (theme: typeof themes[0]) => {
    setCurrentTheme(theme);
    applyThemeToDOM(theme);
    localStorage.setItem('theme-color', theme.id);
    setShowColorPicker(false);
  };

  // عناصر القائمة الجانبية
  const menuItems = [
    { icon: Home, label: 'الرئيسية', href: '/', description: 'الصفحة الرئيسية' },
    { icon: Newspaper, label: 'الأخبار', href: '/news', description: 'آخر الأخبار والمستجدات' },
    { icon: Grid3X3, label: 'الأقسام', href: '/categories', description: 'تصفح حسب القسم' },
    { icon: Sparkles, label: 'مقترب', href: '/muqtarab', description: 'مقالات إبداعية متنوعة' },
    { icon: Brain, label: 'عمق', href: '/deep-analysis', description: 'تحليلات معمقة' },
  ];

  // منع التحميل قبل mount للتجنب hydration errors
  if (!mounted || settingsLoading) {
    return (
      <header className={`sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur ${className}`}>
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="w-16 h-6 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* الهيدر الرئيسي */}
      <header className={`sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 ${className}`}>
        <div className="container flex h-14 items-center justify-between px-4">
          {/* الجانب الأيمن: زر القائمة + اللوجو */}
          <div className="flex items-center gap-3">
            {/* زر القائمة الجانبية */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>

            {/* اللوجو الأصلي */}
            <Link href="/" className="flex items-center gap-2 group">
              {settingsLoading ? (
                <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ) : (
                logoUrl && (
                  <div className="relative w-24 h-8 transition-all duration-200 group-hover:scale-105">
                    <Image
                      src={logoUrl}
                      alt={siteName || "سبق"}
                      fill
                      className="object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200"
                      priority
                      unoptimized={logoUrl.startsWith("http")}
                    />
                  </div>
                )
              )}
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                خفيف
              </span>
            </Link>
          </div>

          {/* الجانب الأيسر: نظام الألوان + الوضع الليلي + الملف الشخصي */}
          <div className="flex items-center gap-2">
            {/* نظام الألوان المتغيرة */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95"
                aria-label="تغيير اللون"
                title="تغيير لون الموقع"
              >
                <div className="relative">
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: currentTheme.color }}
                  />
                  <Palette className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </button>

              {/* قائمة الألوان المطورة */}
              {showColorPicker && (
                <div className="absolute left-0 top-12 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-[280px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">اختر لون الموقع</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => applyTheme(theme)}
                        className={`group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          currentTheme.id === theme.id 
                            ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-2 shadow-md"
                          style={{ backgroundColor: theme.color }}
                        />
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center">
                          {theme.name}
                        </div>
                        {currentTheme.id === theme.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      اللون الحالي: <span className="font-medium">{currentTheme.name}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* تبديل الوضع الليلي */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95"
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
            <button 
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95"
              title="الملف الشخصي"
            >
              <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
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
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                      style={{ backgroundColor: theme.color }}
                      title={theme.name}
                    >
                      {currentTheme.id === theme.id && (
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

      {/* إغلاق قائمة الألوان عند النقر خارجها */}
      {showColorPicker && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowColorPicker(false)}
        />
      )}
    </>
  );
}
