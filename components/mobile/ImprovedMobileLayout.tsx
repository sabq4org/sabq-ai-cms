"use client";

import React, { useState } from "react";
import ImprovedMobileHeader from "./ImprovedMobileHeader";
import ImprovedMobileSidebar from "./ImprovedMobileSidebar";
import { useDarkModeContext } from "@/contexts/DarkModeContext";

interface ImprovedMobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function ImprovedMobileLayout({
  children,
  showHeader = true,
  showFooter = false,
  className = "",
}: ImprovedMobileLayoutProps) {
  const { darkMode } = useDarkModeContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""} ${className}`}>
      {/* الهيدر */}
      {showHeader && (
        <ImprovedMobileHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          showSearch={true}
          showNotifications={true}
        />
      )}

      {/* القائمة الجانبية */}
      <ImprovedMobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* المحتوى الرئيسي */}
      <main className="min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>

      {/* الفوتر - يمكن إضافته لاحقاً */}
      {showFooter && (
        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            جميع الحقوق محفوظة © 2024 صحيفة سبق الإلكترونية
          </div>
        </footer>
      )}
    </div>
  );
}
