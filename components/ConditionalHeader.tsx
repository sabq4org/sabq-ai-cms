"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // تجنب hydration error بعدم الرندر حتى يتم التحميل
  if (!mounted) {
    return null;
  }

  // إظهار الهيدر القديم فقط في صفحة old
  const shouldShowOldHeader = pathname?.startsWith("/old");

  if (!shouldShowOldHeader) {
    return null;
  }

  return <Header />;
}
