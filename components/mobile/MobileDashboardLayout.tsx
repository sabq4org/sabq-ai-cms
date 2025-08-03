'use client';

import { useDarkModeContext } from '@/contexts/DarkModeContext';
import {
    BarChart3,
    FileText,
    Filter,
    Menu,
    Newspaper,
    Plus,
    Search,
    Settings,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import DashboardMobileHeader from './DashboardMobileHeader';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showAdd?: boolean;
  showBack?: boolean;
  onAdd?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onBack?: () => void;
}

export default function MobileDashboardLayout({
  children,
  title,
  showSearch = false,
  showFilter = false,
  showAdd = false,
  showBack = false,
  onAdd,
  onSearch,
  onFilter,
  onBack
}: MobileDashboardLayoutProps) {
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // التحقق من أن الجهاز موبايل
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // قائمة الروابط السريعة للموبايل
  const quickLinks = [
    {
      title: 'إنشاء خبر',
      icon: <Plus className="w-5 h-5" />,
      href: '/dashboard/news/unified',
      color: 'bg-blue-500'
    },
    {
      title: 'إدارة الأخبار',
      icon: <Newspaper className="w-5 h-5" />,
      href: '/dashboard/news',
      color: 'bg-green-500'
    },
    {
      title: 'التحليلات',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/dashboard/insights',
      color: 'bg-purple-500'
    },
    {
      title: 'المقالات',
      icon: <FileText className="w-5 h-5" />,
      href: '/dashboard/article',
      color: 'bg-orange-500'
    }
  ];

  if (!isMobile) {
    return <div>{children}</div>;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* الهيدر المحسن للوحة التحكم */}
      <DashboardMobileHeader
        title={title}
        showSearch={showSearch}
        showNotifications={true}
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* المحتوى الرئيسي */}
      <main className="relative">
        {/* الأزرار السريعة */}
        {(showAdd || showFilter) && (
          <div className={`
            sticky top-[72px] z-40 border-b px-4 py-3
            ${darkMode ? 'bg-gray-800/95 border-gray-700 backdrop-blur-sm' : 'bg-white/95 border-gray-200 backdrop-blur-sm'}
          `}>
            <div className="flex items-center gap-2">
              {showSearch && (
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSearchOpen
                      ? 'bg-blue-500 text-white'
                      : darkMode
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {showFilter && (
                <button
                  onClick={onFilter}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              )}

              {showAdd && (
                <button
                  onClick={onAdd}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}

              {/* قائمة هامبرغر */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* شريط البحث القابل للتوسيع */}
        {isSearchOpen && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                className={`
                  w-full pl-10 pr-4 py-2 rounded-lg border
                  ${darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* القائمة المنسدلة للموبايل */}
        {isMobileMenuOpen && (
          <div className={`
            border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}
          `}>
            <div className="p-4">
              <h3 className={`text-sm font-medium mb-3 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                الروابط السريعة
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      router.push(link.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-colors
                      ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-lg ${link.color} flex items-center justify-center text-white`}>
                      {link.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {link.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* شريط التنقل السفلي الثابت (اختياري) */}
      <div className={`
        fixed bottom-0 left-0 right-0 border-t
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        safe-area-pb
      `}>
        <div className="flex items-center justify-around p-2">
          <button
            onClick={() => router.push('/dashboard')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs">الرئيسية</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/news')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Newspaper className="w-5 h-5 mb-1" />
            <span className="text-xs">الأخبار</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/insights')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs">الإحصائيات</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/article')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <FileText className="w-5 h-5 mb-1" />
            <span className="text-xs">المقالات</span>
          </button>
        </div>
      </div>

      {/* مساحة إضافية لشريط التنقل السفلي */}
      <div className="h-16"></div>
    </div>
  );
}
