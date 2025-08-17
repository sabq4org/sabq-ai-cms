/**
 * لوحة التحكم الحديثة - تخطيط Manus UI فقط
 * Modern Dashboard Layout - Manus UI Only
 */

"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

// تحميل المكونات بشكل ديناميكي لتحسين الأداء
const ModernSidebar = dynamic(() => import("./ModernSidebar"), {
  loading: () => <div style={{ width: '280px', height: '100vh', background: 'hsl(var(--bg))' }}></div>,
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
      const mobile = window.innerWidth < 768;
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
      
      {/* تخطيط Manus UI البسيط - قائمة واحدة فقط */}
      <div className="manus-layout">
        {/* الشريط الجانبي الوحيد */}
        <aside 
          className="manus-sidebar" 
          style={{ 
            display: isMobile && !sidebarOpen ? 'none' : 'block',
            position: isMobile ? 'fixed' : 'static',
            zIndex: isMobile ? 1000 : 'auto'
          }}
        >
          <ModernSidebar isCollapsed={!sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="manus-main">
          {/* هيدر بسيط */}
          <header className="manus-header">
            <div>
              <h1 className="heading-2" style={{ margin: 0 }}>{pageTitle}</h1>
              <p className="text-sm text-muted">{pageDescription}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {isMobile && (
                <button 
                  className="btn btn-sm"
                  onClick={toggleSidebar}
                >
                  ☰
                </button>
              )}
              <button className="btn btn-sm">🔔</button>
              <button className="btn btn-sm">👤</button>
            </div>
          </header>

          {/* محتوى الصفحة */}
          <div className={cn("fade-in", className)} style={{ padding: '0' }}>
            {children}
          </div>
        </main>

        {/* طبقة تراكب للجوال */}
        {isMobile && sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
}