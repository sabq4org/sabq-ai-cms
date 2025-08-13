"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";
import ImprovedMobileLayout from "./mobile/ImprovedMobileLayout";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // كشف الموبايل
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
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

  // استخدام التصميم المحسن للموبايل
  if (isMobile) {
    return null; // سيتم استخدام ImprovedMobileHeader من خلال ImprovedMobileLayout
  }

  return <Header />;
}
