"use client";

import { usePathname } from "next/navigation";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const pathname = usePathname();

  // الصفحات التي لا تحتاج padding-top إطلاقاً (هيدر مخصّص)
  const noPaddingPrefixes = [
    "/dashboard",
    "/admin",
    "/login",
    "/register",
    "/forgot-password",
    "/news", // صفحات الأخبار لها هيدر/تنسيقها
    "/article", // صفحات المقال لها قياس خاص
  ];

  const shouldAddPadding = !noPaddingPrefixes.some((route) =>
    pathname?.startsWith(route)
  );

  return (
    <div
      className={
        shouldAddPadding
          ? "pt-[calc(var(--mobile-header-height,56px))] sm:pt-[calc(var(--header-height,64px))] min-h-[100svh]"
          : ""
      }
    >
      {children}
    </div>
  );
}
