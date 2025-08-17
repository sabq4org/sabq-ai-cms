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

  // لمنع انحشار المحتوى في صفحات الأخبار، نلف المحتوى بداخل حاوية RTL نظيفة
  const isNews = pathname?.startsWith("/admin/news");

  return (
    <SidebarPreferencesProvider>
      <DashboardLayout
        pageTitle="لوحة الإدارة"
        pageDescription="إدارة منصة سبق الذكية"
      >
        {isNews ? (
          <div style={{
            width: "100%",
            display: "block",
            marginInline: "auto",
          }}>
            <div style={{
              maxWidth: "1536px", // ~ max-w-screen-2xl
              marginInline: "auto",
              paddingInline: "16px",
            }}>
              <main style={{ minWidth: 0 }}>{children}</main>
            </div>
          </div>
        ) : (
          children
        )}
      </DashboardLayout>
    </SidebarPreferencesProvider>
  );
}
