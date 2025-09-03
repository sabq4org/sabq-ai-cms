"use client";

import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/admin/modern-dashboard/DashboardLayout";
import { SidebarPreferencesProvider } from "@/contexts/SidebarPreferencesContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { Toaster } from "react-hot-toast";

export default function AdminPureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // صفحة دخول الإدارة: بدون أي شيء إضافي
  if (pathname === "/admin/login" || pathname?.includes("access-denied")) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        {children}
      </div>
    );
  }

  // لوحة التحكم الكاملة
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
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
    </div>
  );
}
