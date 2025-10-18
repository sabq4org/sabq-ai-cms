/**
 * لوحة التحكم الحديثة - مُعاد بناؤها من الصفر
 * Modern Dashboard Layout - Rebuilt from Scratch
 * 
 * التحسينات الحقيقية:
 * - ✅ شريط جانبي أضيق (200px بدلاً من 256px)
 * - ✅ استخدام كامل عرض الشاشة
 * - ✅ هوامش معقولة (16px-24px)
 * - ✅ لا فراغات كبيرة
 * - ✅ تصميم نظيف واحترافي
 */

"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/EnhancedAuthContextWithSSR";
import ManusHeader from "./ManusHeader";

// تحميل الشريط الجانبي ديناميكياً
const ModernSidebar = dynamic(() => import("./ModernSidebar"), {
  loading: () => (
    <div className="w-[200px] h-screen bg-white dark:bg-gray-800 animate-pulse"></div>
  ),
  ssr: true,
});

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  className?: string;
}

export default function DashboardLayout({
  children,
  pageTitle = "الإدارة",
  pageDescription = "نظام إدارة المحتوى",
  className,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // التحقق من المصادقة
  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login?next=/admin/modern");
    }
  }, [user, loading, router]);

  // تحديد حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // عرض loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // عدم عرض المحتوى إذا لم يكن مسجل دخول
  if (!user) {
    return null;
  }

  return (
    <>
      {/* تحميل CSS */}
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* الهيدر - ثابت في الأعلى */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <ManusHeader onMenuClick={toggleSidebar} showMenuButton={true} />
        </header>

        {/* التخطيط الرئيسي */}
        <div className="flex pt-14">
          {/* الشريط الجانبي - Desktop */}
          {!isMobile && (
            <aside
              className={cn(
                "fixed right-0 top-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 z-40",
                sidebarOpen ? "w-[200px]" : "w-16"
              )}
            >
              <ModernSidebar
                isCollapsed={!sidebarOpen}
                onToggle={toggleSidebar}
                isMobile={false}
              />
            </aside>
          )}

          {/* الشريط الجانبي - Mobile */}
          {isMobile && sidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={toggleSidebar}
              />
              <aside className="fixed right-0 top-14 bottom-0 w-[200px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto z-50">
                <ModernSidebar
                  isCollapsed={false}
                  onToggle={toggleSidebar}
                  isMobile={true}
                />
              </aside>
            </>
          )}

          {/* منطقة المحتوى - استخدام كامل العرض */}
          <main
            className={cn(
              "flex-1 transition-all duration-300",
              !isMobile && sidebarOpen && "mr-[200px]",
              !isMobile && !sidebarOpen && "mr-16"
            )}
          >
            {/* Container بدون هوامش جانبية */}
            <div className="w-full py-6">
              {/* عنوان الصفحة */}
              {(pageTitle || pageDescription) && (
                <div className="mb-6">
                  {pageTitle && (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {pageTitle}
                    </h1>
                  )}
                  {pageDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pageDescription}
                    </p>
                  )}
                </div>
              )}

              {/* المحتوى */}
              <div className={cn("w-full", className)}>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

