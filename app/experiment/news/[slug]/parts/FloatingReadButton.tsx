"use client";
import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

export default function FloatingReadButton({ targetId }: { targetId: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const target = document.querySelector(targetId) as HTMLElement | null;
      if (!target) return setVisible(false);
      const rect = target.getBoundingClientRect();
      // إذا كانت بداية المقال خارج الشاشة للأعلى، أظهر الزر
      setVisible(rect.top < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [targetId]);

  if (!visible) return null;

  return (
    <button
      onClick={() => {
        const el = document.querySelector(targetId);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="fixed bottom-4 inset-x-4 sm:inset-auto sm:left-6 sm:bottom-6 rtl:sm:right-6 rtl:sm:left-auto z-40 rounded-full bg-primary-600 text-white shadow-lg px-4 py-3 text-sm font-semibold flex items-center gap-2"
      aria-label="اقرأ الخبر"
    >
      <ArrowDown className="w-4 h-4" />
      اقرأ الخبر
    </button>
  );
}


