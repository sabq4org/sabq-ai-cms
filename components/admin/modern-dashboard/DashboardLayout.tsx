/**
 * لوحة التحكم الحديثة - تخطيط مع هيدر كامل العرض
 * Modern Dashboard Layout with Full-Width Header
 */

"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import ManusHeader from "./ManusHeader";

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
  pageTitle = "الإدارة",
  pageDescription = "نظام إدارة المحتوى",
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
      
      {/* الهيدر كامل العرض - ثابت في الأعلى */}
      <ManusHeader onMenuClick={toggleSidebar} showMenuButton={isMobile} />
      
      {/* التخطيط الرئيسي */}
      <div style={{
        minHeight: '100vh',
        background: 'hsl(var(--bg))',
        paddingTop: '0px',
        display: 'flex'
      }}>
        
        {/* الشريط الجانبي للديسكتوب */}
        {!isMobile && (
          <aside style={{
            position: 'fixed',
            top: '56px',
            right: 0,
            width: sidebarOpen ? '280px' : '80px',
            height: 'calc(100vh - 56px)',
            padding: '16px 12px',
            overflowY: 'auto',
            zIndex: 900,
            transition: 'width 0.3s ease',
            borderLeft: '1px solid hsl(var(--line))',
            background: 'hsl(var(--bg))'
          }}>
            <ModernSidebar isCollapsed={!sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />
          </aside>
        )}

        {/* الشريط الجانبي للجوال */}
        {isMobile && sidebarOpen && (
          <aside style={{
            position: 'fixed',
            top: '56px',
            right: 0,
            width: '280px',
            height: 'calc(100vh - 56px)',
            padding: '16px 12px',
            overflowY: 'auto',
            zIndex: 1000,
            borderLeft: '1px solid hsl(var(--line))',
            background: 'hsl(var(--bg))'
          }}>
            <ModernSidebar isCollapsed={false} onToggle={toggleSidebar} isMobile={isMobile} />
          </aside>
        )}

        {/* المحتوى الرئيسي */}
        <main style={{
          flex: 1,
          marginRight: !isMobile ? (sidebarOpen ? '280px' : '80px') : '0',
          padding: '0px 16px 16px 16px',
          minHeight: 'calc(100vh - 56px)',
          transition: 'margin-right 0.3s ease'
        }}>
          <div className={cn("fade-in", className)}>
            {children}
          </div>
        </main>

        {/* طبقة تراكب للجوال */}
        {isMobile && sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              top: '56px',
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