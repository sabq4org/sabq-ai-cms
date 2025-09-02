"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import DarkModeOverlayFix from "@/components/debug/DarkModeOverlayFix";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthMonitor from "@/components/debug/AuthMonitor";

// Layouts
import AdminPureLayout from "./AdminPureLayout";
import SiteLayout from "./SiteLayout";

import { ServerUser } from "@/lib/getServerUser";

export default function ConditionalLayout({
  children,
  initialUser: serverInitialUser,
}: {
  children: React.ReactNode;
  initialUser?: ServerUser | null;
}) {
  const pathname = usePathname();
  const [initialUser, setInitialUser] = useState<any>(serverInitialUser);

  // قراءة بيانات المستخدم المرسلة من الخادم
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_USER__) {
      const serverUser = (window as any).__INITIAL_USER__;
      console.log('🔄 [ConditionalLayout] تم استلام المستخدم من الخادم:', serverUser.email);
      setInitialUser(serverUser);
    }
  }, []);

  // تحديد نوع Layout بناءً على المسار
  const isAdminLoginPath = pathname?.startsWith('/admin/login') || pathname?.startsWith('/admin-login');
  const isLoginPath = pathname?.startsWith('/login');
  const isAdminPath = (pathname?.startsWith('/admin') || pathname?.startsWith('/admin-') || pathname?.startsWith('/sabq-admin')) && !isAdminLoginPath;
  const isLightPath = pathname === '/light' || pathname?.startsWith('/light/');

  // إذا كانت صفحة تسجيل دخول (عادي أو admin)، لا تطبق أي layout
  if (isAdminLoginPath || isLoginPath) {
    return (
      <QueryProvider>
        <AuthProvider initialUser={initialUser}>
          <DarkModeOverlayFix />
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
            <DarkModeOverlayFix />
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
          <DarkModeOverlayFix />
          {children}
        </AuthProvider>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <AuthProvider initialUser={initialUser}>
        {process.env.NODE_ENV === 'development' && <AuthMonitor />}
        <SiteLayout>
          <DarkModeOverlayFix />
          {children}
        </SiteLayout>
      </AuthProvider>
    </QueryProvider>
  );
}
