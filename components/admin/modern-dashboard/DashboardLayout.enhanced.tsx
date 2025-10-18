/**
 * لوحة التحكم الحديثة - تخطيط احترافي محسّن
 * Professional Enhanced Dashboard Layout
 * 
 * التحسينات:
 * - ✅ Tailwind CSS بدلاً من inline styles
 * - ✅ هوامش مناسبة ومتوازنة
 * - ✅ responsive design كامل
 * - ✅ تخطيط منظم واحترافي
 */

"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ManusHeader from "./ManusHeader";
import { Menu, X } from "lucide-react";

// تحميل المكونات بشكل ديناميكي لتحسين الأداء
const ModernSidebar = dynamic(() => import("./ModernSidebar"), {
  loading: () => (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 animate-pulse"></div>
  ),
  ssr: true,
});

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  className?: string;
}

export default function DashboardLayoutEnhanced({
  children,
  pageTitle = "الإدارة",
  pageDescription = "نظام إدارة المحتوى",
  className,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // تحديد حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      {/* تحميل CSS Manus UI */}
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* الهيدر - ثابت في الأعلى */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <ManusHeader onMenuClick={toggleSidebar} showMenuButton={true} />
        </header>

        {/* التخطيط الرئيسي */}
        <div className="flex pt-14">
          {/* الشريط الجانبي - Desktop */}
          {!isMobile && (
            <aside
              className={cn(
                "fixed right-0 top-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out z-40",
                sidebarOpen ? "w-64" : "w-20"
              )}
            >
              <div className="p-4">
                <ModernSidebar
                  isCollapsed={!sidebarOpen}
                  onToggle={toggleSidebar}
                  isMobile={false}
                />
              </div>
            </aside>
          )}

          {/* الشريط الجانبي - Mobile */}
          {isMobile && sidebarOpen && (
            <>
              {/* طبقة خلفية */}
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={toggleSidebar}
                aria-hidden="true"
              />

              {/* الشريط الجانبي */}
              <aside className="fixed right-0 top-14 bottom-0 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto z-50 lg:hidden shadow-2xl">
                <div className="p-4">
                  <ModernSidebar
                    isCollapsed={false}
                    onToggle={toggleSidebar}
                    isMobile={true}
                  />
                </div>
              </aside>
            </>
          )}

          {/* منطقة المحتوى الرئيسية */}
          <main
            className={cn(
              "flex-1 transition-all duration-300 ease-in-out",
              !isMobile && sidebarOpen && "mr-64",
              !isMobile && !sidebarOpen && "mr-20"
            )}
          >
            {/* Container للمحتوى */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
              {/* عنوان الصفحة */}
              {(pageTitle || pageDescription) && (
                <div className="mb-6 md:mb-8">
                  {pageTitle && (
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {pageTitle}
                    </h1>
                  )}
                  {pageDescription && (
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      {pageDescription}
                    </p>
                  )}
                </div>
              )}

              {/* المحتوى */}
              <div className={cn("space-y-6", className)}>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

