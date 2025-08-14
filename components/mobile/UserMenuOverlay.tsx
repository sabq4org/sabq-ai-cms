"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { User, BookOpen, Bookmark, Settings, LogOut } from "lucide-react";

interface UserMenuOverlayProps {
  trigger: React.ReactNode;
}

export default function UserMenuOverlay({ trigger }: UserMenuOverlayProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const menu = useMemo(
    () => [
      { href: "/profile", label: "الملف الشخصي", icon: User },
      { href: "/my-journey", label: "رحلتك المعرفية", icon: BookOpen },
      { href: "/bookmarks", label: "المحفوظات", icon: Bookmark },
      { href: "/settings", label: "الإعدادات", icon: Settings },
    ],
    []
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    window.location.href = "/";
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-[60]"
        />

        {/* Panel */}
        <Dialog.Content
          dir="rtl"
          aria-label="قائمة العضوية"
          className="fixed right-3 z-[70] w-[80vw] max-w-[420px]"
          style={{ top: "calc(var(--header-height, 56px) + 8px)" }}
        >
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="rounded-lg shadow-lg p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
          >
            <nav className="flex flex-col">
              {menu.map(({ href, label, icon: Icon }) => {
                const active = pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-[#111] dark:text-gray-100 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] ${
                      active ? "text-[#3B82F6] dark:text-[#60A5FA]" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="h-px my-3 bg-gray-200 dark:bg-gray-800" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">تسجيل الخروج</span>
            </button>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


