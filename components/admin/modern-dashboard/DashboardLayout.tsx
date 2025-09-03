/**
 * لوحة التحكم الحديثة - تخطيط مع هيدر كامل العرض
 * Modern Dashboard Layout with Full-Width Header
 */

"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
      {/* تحميل تحسينات الموبايل */}
      <link rel="stylesheet" href="/admin-modern-mobile.css" />
      <link rel="stylesheet" href="/admin-modern-mobile-enhanced.css" />
      
      {/* الهيدر كامل العرض - ثابت في الأعلى */}
      <ManusHeader onMenuClick={toggleSidebar} showMenuButton={isMobile} />
      
      {/* التخطيط الرئيسي */}
      <div style={{
        minHeight: '100vh',
        background: 'hsl(var(--bg))',
        paddingTop: '0px',
        position: 'relative',
        overflow: 'hidden'
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
          <>
            {/* طبقة خلفية */}
            <div 
              className="sidebar-backdrop"
              onClick={toggleSidebar}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999
              }}
            />
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
          </>
        )}

        {/* حاوية المحتوى مع حجز مساحة للسايدبار */}
        <div style={{
          marginRight: !isMobile ? (sidebarOpen ? '280px' : '80px') : '0',
          minHeight: 'calc(100vh - 56px)',
          transition: 'margin-right 0.3s ease',
        }}>
          {/* المحتوى الرئيسي */}
          <main className="admin-modern-main admin-dashboard-layout" style={{
            paddingTop: '80px',
            paddingBottom: '16px',
            width: '100%',
            // تمرير عرض السايدبار كمتغير CSS ليقرأه CSS العام
            ['--sidebar-width' as any]: !isMobile ? (sidebarOpen ? '280px' : '80px') : '0'
          }}>
            <div className={cn("fade-in", className)} style={{ 
              padding: '0 24px',
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%'
            }}>
              {children}
            </div>
          </main>
        </div>

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
        
        {/* التنقل السفلي للموبايل */}
        {isMobile && (
          <nav className="bottom-nav">
            <Link href="/admin/modern" className="bottom-nav-item">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>الرئيسية</span>
            </Link>
            <Link href="/admin/news" className="bottom-nav-item">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span>الأخبار</span>
            </Link>
            <Link href="/admin/news/unified" className="bottom-nav-item">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>جديد</span>
            </Link>
            <Link href="/admin/modern/analytics" className="bottom-nav-item">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>التحليلات</span>
            </Link>
            <Link href="/admin/modern/settings" className="bottom-nav-item">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>الإعدادات</span>
            </Link>
          </nav>
        )}
      </div>
    </>
  );
}