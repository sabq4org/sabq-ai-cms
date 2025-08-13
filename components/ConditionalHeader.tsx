"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";
import MobileHeader from "./mobile/MobileHeader";
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

  // عرض الهيدر المناسب حسب الجهاز
  if (isMobile) {
    return <MobileHeader showSearch={true} showNotifications={true} showUserMenu={true} />;
  }

  return <Header />;
}
