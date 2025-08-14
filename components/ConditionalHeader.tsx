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

  // إخفاء الهيدر في لوحة التحكم والأدمن
  const shouldHideHeader =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    false;

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}
