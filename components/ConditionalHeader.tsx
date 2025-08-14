"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";
import MobileHeaderEnhanced from "@/components/mobile/MobileHeader-Enhanced";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    const detect = () => {
      try {
        setIsMobile(window.innerWidth <= 768);
      } catch {
        setIsMobile(false);
      }
    };
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
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

  // إذا كان موبايل استخدم الهيدر المحسّن للنسخة الخفيفة
  if (isMobile) {
    return <MobileHeaderEnhanced />;
  }

  return <Header />;
}
