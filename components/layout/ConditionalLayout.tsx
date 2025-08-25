"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeApplier from "@/components/ThemeApplier";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/contexts/EnhancedAuthContextWithSSR";

// Layouts
import AdminPureLayout from "./AdminPureLayout";
import SiteLayout from "./SiteLayout";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [initialUser, setInitialUser] = useState<any>(null);

  // قراءة بيانات المستخدم المرسلة من الخادم
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_USER__) {
      const serverUser = (window as any).__INITIAL_USER__;
      console.log('🔄 [ConditionalLayout] تم استلام المستخدم من الخادم:', serverUser.email);
      setInitialUser(serverUser);
    }
  }, []);

  // تحديد نوع Layout بناءً على المسار
  const isAdminPath = pathname?.startsWith('/admin');
  const isAdminLoginPath = pathname?.startsWith('/admin/login');
  const isLoginPath = pathname?.startsWith('/login');
  const isLightPath = pathname === '/light' || pathname?.startsWith('/light/');

  // إذا كانت صفحة تسجيل دخول (عادي أو admin)، لا تطبق أي layout
  if (isAdminLoginPath || isLoginPath) {
    return (
      <QueryProvider>
        <AuthProvider initialUser={initialUser}>
          <ThemeApplier />
          {children}
        </AuthProvider>
      </QueryProvider>
    );
  }

  if (isAdminPath) {
    return (
      <QueryProvider>
        <AuthProvider initialUser={initialUser}>
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
        <AuthProvider initialUser={initialUser}>
          <ThemeApplier />
          {children}
        </AuthProvider>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <AuthProvider initialUser={initialUser}>
        <SiteLayout>
          <ThemeApplier />
          {children}
        </SiteLayout>
      </AuthProvider>
    </QueryProvider>
  );
}
