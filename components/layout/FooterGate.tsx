"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

export default function FooterGate({ children }: PropsWithChildren<{}>) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null;
  }
  return <>{children}</>;
}


