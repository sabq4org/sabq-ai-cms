"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  if (isAdminPath) {
    return <AdminPureLayout>{children}</AdminPureLayout>;
  }

  return <SiteLayout>{children}</SiteLayout>;
}
