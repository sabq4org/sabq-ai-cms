"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ScrollToTopOnNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // تعطيل استرجاع التمرير الافتراضي لـ Next.js
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // إذا لا يوجد hash، ابدأ من أعلى الصفحة
    if (!window.location.hash) {
      // تأخير بسيط للتأكد من اكتمال التحميل
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    }
  }, [pathname, searchParams]);

  return null;
}
