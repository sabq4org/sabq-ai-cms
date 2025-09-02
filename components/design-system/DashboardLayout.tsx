/**
 * 🏗️ تخطيط لوحة التحكم الموحد - Unified Dashboard Layout
 * Layout محسن وموحد لجميع صفحات لوحة التحكم
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { sabqTheme } from '@/lib/design-system/theme';
import SabqCard from './SabqCard';
import SabqButton from './SabqButton';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  Search,
  Settings,
  User,
  Home,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface DashboardLayoutProps {
  // 📄 محتوى الصفحة
  children: React.ReactNode;
  
  // 📝 معلومات الصفحة
  pageTitle?: string;
  pageDescription?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  
  // 🎨 خيارات التصميم
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  
  // 🔧 خيارات الوظائف
  showSidebar?: boolean;
  showHeader?: boolean;
  showBreadcrumbs?: boolean;
  
  // 🎯 أدوات إضافية
  headerActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle = "لوحة التحكم",
  pageDescription,
  breadcrumbs = [],
  containerSize = 'full',
  padding = 'lg',
  showSidebar = true,
  showHeader = true,
  showBreadcrumbs = true,
  headerActions,
  sidebarFooter,
  className
}) => {
  
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 📱 تحديد حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 🎨 أنماط الحاوي
  const containerClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl', 
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-none'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 lg:p-8'
  };

  // 🧭 روابط التنقل الرئيسية
  const navigationItems = [
    { label: 'لوحة التحكم', href: '/admin', icon: Home },
    { label: 'إدارة الأخبار', href: '/admin/articles', icon: Menu },
    { label: 'التحليلات', href: '/admin/analytics', icon: Menu },
    { label: 'الإعدادات', href: '/admin/settings', icon: Settings },
  ];

  // 🎯 Sidebar مبسط
  function renderSidebar() {
    if (!showSidebar) return null;

    return (
      <>
        {/* Desktop Sidebar */}
        <aside className={cn(
          'fixed top-0 right-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 z-40',
          sidebarOpen ? 'w-64' : 'w-16',
          isMobile && 'hidden'
        )}>
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className={cn(
              'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700',
              !sidebarOpen && 'justify-center'
            )}>
              {sidebarOpen && (
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  سبق الذكية
                </h1>
              )}
              <SabqButton
                variant="ghost"
                size="sm"
                icon={sidebarOpen ? ChevronRight : ChevronLeft}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === item.href 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                    !sidebarOpen && 'justify-center'
                  )}>
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                </Link>
              ))}
            </nav>

            {/* Footer */}
            {sidebarFooter && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {sidebarFooter}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 z-50">
              {/* نفس محتوى Sidebar */}
            </aside>
          </>
        )}
      </>
    );
  }

  // 🎯 Header مبسط
  function renderHeader() {
    if (!showHeader) return null;

    return (
      <header className={cn(
        'sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        'transition-all duration-300'
      )}>
        <div className={cn(
          'flex items-center justify-between h-16 px-6',
          showSidebar && !isMobile && (sidebarOpen ? 'mr-64' : 'mr-16')
        )}>
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <SabqButton
                variant="ghost"
                size="sm"
                icon={<Menu />}
                onClick={() => setSidebarOpen(true)}
              />
            )}

            {/* Page Title */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {pageTitle}
              </h1>
              {pageDescription && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pageDescription}
                </p>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {headerActions}
            
            <SabqButton variant="ghost" size="sm" icon={<Bell />} />
            <SabqButton variant="ghost" size="sm" icon={<Search />} />
            <SabqButton variant="ghost" size="sm" icon={<User />} />
          </div>
        </div>
      </header>
    );
  }

  // 🧭 مسار التنقل
  function renderBreadcrumbs() {
    if (!showBreadcrumbs || breadcrumbs.length === 0) return null;

    return (
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <Link href="/admin" className="hover:text-blue-600 dark:hover:text-blue-400">
          الرئيسية
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <ChevronLeft className="w-4 h-4" />
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-blue-600 dark:hover:text-blue-400">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  return (
    <div className={cn(
      'min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300',
      className
    )}>
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content Area */}
      <div className={cn(
        'transition-all duration-300',
        showSidebar && !isMobile && (sidebarOpen ? 'mr-64' : 'mr-16')
      )}>
        {/* Header */}
        {renderHeader()}

        {/* Page Content */}
        <main className={cn(
          'mx-auto',
          containerClasses[containerSize],
          paddingClasses[padding]
        )}>
          {/* Breadcrumbs */}
          {renderBreadcrumbs()}

          {/* Children */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;