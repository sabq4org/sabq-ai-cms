"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, LayoutGrid, FileText, Compass, Brain, X } from "lucide-react";

interface LightSidebarV2Props {
  isOpen: boolean;
  onClose: () => void;
}

const NAV = [
  { href: "/", label: "الرئيسية", Icon: Home },
  { href: "/news", label: "الأخبار", Icon: Newspaper },
  { href: "/categories", label: "الأقسام", Icon: LayoutGrid },
  { href: "/articles", label: "المقالات", Icon: FileText },
  { href: "/muqtarab", label: "مُقترب", Icon: Compass },
  { href: "/deep", label: "عمق", Icon: Brain },
];

export default function LightSidebarV2({ isOpen, onClose }: LightSidebarV2Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname() || "";

  // إغلاق بالضغط خارج اللوحة و ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal
            aria-label="القائمة الجانبية"
            className="fixed top-0 right-0 h-full z-50 w-[80%] max-w-[320px] bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
          >
            {/* رأس */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">القائمة</h2>
              <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                <span className="sr-only">إغلاق</span>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* عناصر */}
            <nav className="flex-1 px-3 py-4 space-y-1" aria-label="القائمة الأساسية">
              {NAV.map(({ href, label, Icon }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`group flex flex-row-reverse items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-blue-400/50 ${
                      active
                        ? "bg-gradient-to-l from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-200/60 dark:ring-blue-700/40"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <span className="flex-1 text-right leading-snug tracking-tight">{label}</span>
                    <span className="opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden>
                      <Icon className="w-5 h-5" />
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* تذييل */}
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-500 tracking-tight leading-snug">
              <p className="mb-1">© {new Date().getFullYear()} سبق الذكية</p>
              <p className="opacity-80">إصدار النسخة الخفيفة V2</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


