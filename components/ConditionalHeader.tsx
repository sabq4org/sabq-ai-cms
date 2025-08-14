"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";
import MobileHeaderEnhanced from "./mobile/MobileHeader-Enhanced";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  // استخدام MobileHeaderEnhanced للأجهزة المحمولة
  if (isMobile) {
    return <MobileHeaderEnhanced showUserMenu={true} />;
  }

  return <Header />;
}
