"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeApplier from "@/components/ThemeApplier";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import AdminPureLayout from "./AdminPureLayout";
import SiteLayout from "./SiteLayout";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  

  // تحديد نوع Layout بناءً على المسار
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdminLoginPath = pathname?.startsWith('/admin/login');
  const isLoginPath = pathname?.startsWith('/login');
  const isLightPath = pathname === '/light' || pathname?.startsWith('/light/');

  // إذا كانت صفحة تسجيل دخول (عادي أو admin)، لا تطبق أي layout
  if (isAdminLoginPath || isLoginPath) {
    return (
      <QueryProvider>
        <AuthProvider>
          <ThemeApplier />
          {children}
        </AuthProvider>
      </QueryProvider>
    );
  }

  if (isAdminPath) {
    return (
      <QueryProvider>
        <AuthProvider>
          <AdminPureLayout>
            <ThemeApplier />
            {children}
          </AdminPureLayout>
        </AuthProvider>
      </QueryProvider>
    );
  }

  // في مسار النسخة الخفيفة، دع تخطيط المقطع `app/light/layout.tsx` يتكفّل بالتخطيط
  if (isLightPath) {
    return (
      <QueryProvider>
        <AuthProvider>
          <ThemeApplier />
          {children}
        </AuthProvider>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <SiteLayout>
          <ThemeApplier />
          {children}
        </SiteLayout>
      </AuthProvider>
    </QueryProvider>
  );
}
