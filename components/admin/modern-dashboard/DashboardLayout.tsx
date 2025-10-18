/**
 * لوحة التحكم - مُعاد بناؤها من الصفر تماماً
 * Dashboard Layout - Built from Scratch
 * 
 * التصميم الجديد:
 * - لا هوامش من الأعلى أو اليمين
 * - المحتوى يملأ كامل المساحة المتاحة
 * - الشريط الجانبي ثابت على اليمين
 * - المحتوى يبدأ مباشرة بعد الشريط الجانبي
 */

"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/EnhancedAuthContextWithSSR";
import ManusHeader from "./ManusHeader";

const ModernSidebar = dynamic(() => import("./ModernSidebar"), {
  loading: () => <div className="w-[200px] h-screen bg-white dark:bg-gray-800 animate-pulse"></div>,
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
  pageTitle,
  pageDescription,
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

  if (!user) return null;

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      {/* الهيدر الثابت */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ManusHeader onMenuClick={toggleSidebar} showMenuButton={true} />
      </header>

      {/* الشريط الجانبي الثابت - Desktop */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed right-0 top-14 bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 z-40",
            sidebarOpen ? "w-[200px]" : "w-16"
          )}
        >
          <ModernSidebar isCollapsed={!sidebarOpen} onToggle={toggleSidebar} isMobile={false} />
        </aside>
      )}

      {/* الشريط الجانبي - Mobile */}
      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} />
          <aside className="fixed right-0 top-14 bottom-0 w-[200px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto z-50">
            <ModernSidebar isCollapsed={false} onToggle={toggleSidebar} isMobile={true} />
          </aside>
        </>
      )}

      {/* المحتوى الرئيسي - يملأ كامل المساحة */}
      <main
        className={cn(
          "fixed top-14 bottom-0 left-0 overflow-y-auto bg-gray-50 dark:bg-gray-900",
          !isMobile && sidebarOpen && "right-[200px]",
          !isMobile && !sidebarOpen && "right-16",
          isMobile && "right-0"
        )}
      >
        {/* المحتوى بدون أي هوامش */}
        <div className={cn("min-h-full", className)}>
          {children}
        </div>
      </main>
    </>
  );
}

