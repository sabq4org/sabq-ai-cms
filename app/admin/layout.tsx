"use client";

import DashboardLayout from "@/components/admin/modern-dashboard/DashboardLayout";
import { SidebarPreferencesProvider } from "@/contexts/SidebarPreferencesContext";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // صفحة دخول الإدارة بدون أي تخطيطات إضافية (لا هيدر/لا فوتر/لا سايدبار)
  if (pathname?.startsWith("/admin/login")) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <SidebarPreferencesProvider>
      <DashboardLayout
        pageTitle="لوحة الإدارة"
        pageDescription="إدارة منصة سبق الذكية"
      >
        {children}
      </DashboardLayout>
    </SidebarPreferencesProvider>
  );
}
