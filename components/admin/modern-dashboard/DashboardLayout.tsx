/**
 * لوحة التحكم الحديثة - التخطيط الأساسي
 * Modern Dashboard Layout Component
 */

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LoadingSpinner } from '@/components/ui/loading';
import dynamic from 'next/dynamic';
import { 
  Menu,
  Bell,
  Search,
  Settings,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// تحميل المكونات بشكل ديناميكي لتحسين الأداء
const ModernSidebar = dynamic(() => import('./ModernSidebar'), {
  loading: () => <LoadingSpinner size="sm" text="تحميل القائمة..." />,
  ssr: false
});

const ModernHeader = dynamic(() => import('./ModernHeader'), {
  loading: () => <div className="h-16 bg-white dark:bg-gray-800 border-b animate-pulse" />,
  ssr: false
});

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  className?: string;
}

export default function DashboardLayout({ 
  children, 
  pageTitle = "لوحة التحكم",
  pageDescription = "إدارة منصة سبق الذكية",
  className 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // التأكد من التحميل على العميل
  useEffect(() => {
    setMounted(true);
  }, []);

  // تحديد حجم الشاشة
  useEffect(() => {
    if (!mounted) return;
    
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // على الشاشات الصغيرة، أغلق الشريط الجانبي تلقائياً
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // استرجاع حالة الشريط الجانبي من localStorage
        const savedState = localStorage.getItem('sidebar-open');
        setSidebarOpen(savedState !== 'false');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [mounted]);

  // حفظ حالة الشريط الجانبي
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-open', sidebarOpen.toString());
    }
  }, [sidebarOpen, isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // منع الرندر حتى يتم التحميل على العميل
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* الشريط الجانبي للشاشات الكبيرة */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed top-0 right-0 z-40 h-screen transition-all duration-300 ease-in-out",
            "bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700",
            "shadow-lg dark:shadow-gray-900/50",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <ModernSidebar 
            isCollapsed={!sidebarOpen} 
            onToggle={toggleSidebar}
          />
        </aside>
      )}

      {/* الشريط الجانبي للهواتف */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="w-64 p-0 bg-white dark:bg-gray-800">
            <ModernSidebar 
              isCollapsed={false} 
              onToggle={() => setSidebarOpen(false)}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* المحتوى الرئيسي */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          !isMobile && sidebarOpen ? "mr-64" : !isMobile ? "mr-16" : "mr-0"
        )}
      >
        {/* الترويسة */}
        <ModernHeader 
          pageTitle={pageTitle}
          pageDescription={pageDescription}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={isMobile}
        />

        {/* محتوى الصفحة */}
        <main className={cn(
          "p-4 lg:p-6", 
          "pt-[calc(var(--dashboard-header-height)+1rem)]", // padding ديناميكي باستخدام CSS variable
          "bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-var(--dashboard-header-height))]",
          "transition-colors duration-300",
          className
        )}>
          {children}
        </main>
      </div>

      {/* طبقة التداخل للهواتف */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 dark:bg-black/70 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
