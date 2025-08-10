"use client";

import { usePathname } from "next/navigation";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const pathname = usePathname();

  // الصفحات التي لا تحتاج padding-top
  const noPaddingRoutes = [
    "/dashboard",
    "/admin",
    "/login",
    "/register",
    "/forgot-password",
  ];

  const shouldAddPadding = !noPaddingRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  return (
    <div
      className={
        shouldAddPadding
          ? "pt-[var(--mobile-header-height)] sm:pt-[var(--header-height)] min-h-[100svh]"
          : ""
      }
    >
      {children}
    </div>
  );
}
