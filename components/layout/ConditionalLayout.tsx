"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeApplier from "@/components/ThemeApplier";

// Layouts
import AdminPureLayout from "./AdminPureLayout";
import SiteLayout from "./SiteLayout";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // تحميل سريع بدون animations معقدة
  if (!isClient) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#f8f8f7' }}>جاري التحميل...</div>;
  }

  // تحديد نوع Layout بناءً على المسار
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdminLoginPath = pathname?.startsWith('/admin/login');
  const isLightPath = pathname === '/light' || pathname?.startsWith('/light/');

  // إذا كانت صفحة تسجيل دخول admin، لا تطبق أي layout
  if (isAdminLoginPath) {
    return (
      <>
        <ThemeApplier />
        {children}
      </>
    );
  }

  if (isAdminPath) {
    return (
      <AdminPureLayout>
        <ThemeApplier />
        {children}
      </AdminPureLayout>
    );
  }

  // في مسار النسخة الخفيفة، دع تخطيط المقطع `app/light/layout.tsx` يتكفّل بالتخطيط
  if (isLightPath) {
    return (
      <>
        <ThemeApplier />
        {children}
      </>
    );
  }

  return (
    <SiteLayout>
      <ThemeApplier />
      {children}
    </SiteLayout>
  );
}
