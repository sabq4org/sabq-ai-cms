"use client";

import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import DashboardLayout from "@/components/admin/modern-dashboard/DashboardLayout";
import { SidebarPreferencesProvider } from "@/contexts/SidebarPreferencesContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

// CSS خاص بالإدارة فقط
import "./admin-globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap"
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // صفحة دخول الإدارة: layout خاص جداً - بدون أي هيدر أو مكونات إضافية
  const isLoginPage = pathname === "/admin/login" || pathname?.includes("login");
  const isAccessDenied = pathname?.startsWith("/admin/access-denied");
  
  if (isLoginPage || isAccessDenied) {
    return (
      <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
        <head>
          <meta name="theme-color" content="#1f2937" />
          <title>دخول الإداريين - سبق الذكية</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className={`${ibmPlexArabic.className} antialiased`} suppressHydrationWarning>
          {/* بدون أي هيدر أو providers معقدة - فقط الصفحة */}
          <DarkModeProvider>
            {children}
            <Toaster position="top-center" />
          </DarkModeProvider>
        </body>
      </html>
    );
  }

  // لوحة التحكم الكاملة
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <head>
        <meta name="theme-color" content="#1f2937" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>لوحة التحكم - سبق الذكية</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${ibmPlexArabic.className} antialiased bg-gray-50 dark:bg-gray-900`} suppressHydrationWarning>
        <DarkModeProvider>
          <SidebarPreferencesProvider>
            <DashboardLayout
              pageTitle="لوحة الإدارة"
              pageDescription="إدارة منصة سبق الذكية"
            >
              {children}
            </DashboardLayout>
            <Toaster position="top-center" />
          </SidebarPreferencesProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}