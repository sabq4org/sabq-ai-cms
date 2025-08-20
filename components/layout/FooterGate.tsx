"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

export default function FooterGate({ children }: PropsWithChildren<{}>) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return <>{children}</>;
}


