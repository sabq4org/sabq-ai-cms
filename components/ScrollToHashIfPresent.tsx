"use client";

import { useEffect } from "react";

export default function ScrollToHashIfPresent() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // تأخير بسيط للتأكد من تحميل العناصر
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          // احتساب موقع العنصر مع تعويض الهيدر
          const headerOffset = 80; // يمكن تعديلها حسب ارتفاع الهيدر
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, []);

  return null;
}
