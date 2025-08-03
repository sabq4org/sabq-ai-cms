"use client";

import DashboardLayout from "@/components/admin/modern-dashboard/DashboardLayout";
import { SidebarPreferencesProvider } from "@/contexts/SidebarPreferencesContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
