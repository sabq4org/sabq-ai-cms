/**
 * لوحة التحكم الحديثة - التخطيط الأساسي
 * Modern Dashboard Layout Component
 */

"use client";

import { LoadingSpinner } from "@/components/ui/loading";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import QuickAccessHeader from "./QuickAccessHeader";
import React, { useEffect, useState } from "react";

// تحميل المكونات بشكل ديناميكي لتحسين الأداء
const ModernSidebar = dynamic(() => import("./ModernSidebar"), {
  loading: () => <LoadingSpinner size="sm" text="تحميل القائمة..." />,
  ssr: true,
});

const ModernHeader = dynamic(() => import("./ModernHeader"), {
  loading: () => (
    <div className="h-16 bg-white dark:bg-gray-800 border-b animate-pulse" />
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
  pageTitle = "لوحة التحكم",
  pageDescription = "إدارة منصة سبق الذكية",
  className,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // تحديد حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // على الشاشات الصغيرة، أغلق الشريط الجانبي تلقائياً
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // استرجاع حالة الشريط الجانبي من localStorage
        const savedState = localStorage.getItem("sidebar-open");
        setSidebarOpen(savedState !== "false");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // حفظ حالة الشريط الجانبي
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebar-open", sidebarOpen.toString());
    }
  }, [sidebarOpen, isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // منع الرندر حتى يتم التحميل على العميل
  // تم تعطيل هذا التحقق مؤقتاً لحل مشكلة التحميل
  // if (!mounted) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
  //       <div className="animate-pulse">
  //         <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
  //         <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="admin-dashboard-layout min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* الهيدر الجديد (استبدال كامل) */}
      <QuickAccessHeader fullReplace showMenuButton={isMobile} onMenuClick={toggleSidebar} />

      {/* الشريط الجانبي للشاشات الكبيرة */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed right-0 z-40 transition-all duration-300 ease-in-out",
            "top-[var(--dashboard-header-height)] h-[calc(100vh-var(--dashboard-header-height))]",
            "bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700",
            "shadow-lg dark:shadow-gray-900/50",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <ModernSidebar isCollapsed={!sidebarOpen} onToggle={toggleSidebar} />
        </aside>
      )}

      {/* الشريط الجانبي للهواتف */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="right"
            className="w-64 p-0 bg-white dark:bg-gray-800"
          >
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
        {/* محتوى الصفحة */}
        <main
          className={cn(
            "p-0 max-w-none", // إزالة كل الـ padding الجانبي وعدم تحديد عرض أقصى
            "pt-[calc(var(--dashboard-header-height)+1rem)]", // padding ديناميكي باستخدام CSS variable
            "bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-var(--dashboard-header-height))]",
            "w-full", // عرض كامل
            "transition-colors duration-300",
            className
          )}
        >
          {/* حاوية محتوى مرنة */}
          <div
            className={cn(
              "w-full max-w-none transition-all duration-300", // عرض كامل دائماً بدون حدود قصوى
              "px-4 lg:px-6 xl:px-8 2xl:px-10", // padding أفقي فقط
              "space-y-6"
            )}
          >
            {children}
          </div>
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
