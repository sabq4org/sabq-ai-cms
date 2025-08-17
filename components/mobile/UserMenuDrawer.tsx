"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  User,
  BookOpen,
  Bookmark,
  Settings as SettingsIcon,
  LogOut,
  X,
  ChevronLeft,
} from "lucide-react";

interface UserMenuDrawerProps {
  trigger: React.ReactNode;
}

export default function UserMenuDrawer({ trigger }: UserMenuDrawerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // منع تمرير الخلفية أثناء الفتح وإعادته عند الإغلاق
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      return () => {
        const y = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, y ? parseInt(y || "0") * -1 : 0);
      };
    }
  }, [open]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    window.location.href = "/";
  };

  const navItems = useMemo(
    () => [
      { href: "/profile", label: "الملف الشخصي", icon: User },
      { href: "/my-journey", label: "رحلتك المعرفية", icon: BookOpen },
      { href: "/bookmarks", label: "المحفوظات", icon: Bookmark },
      { href: "/settings", label: "الإعدادات", icon: SettingsIcon },
    ],
    []
  );

  // دعم السحب للإغلاق
  const dragRef = useRef<HTMLDivElement | null>(null);
  const [dragX, setDragX] = useState(0);

  const onDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info?.offset?.x && info.offset.x > 100) setOpen(false);
    setDragX(0);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        {/* الخلفية */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out" />

        {/* الحاوية الثابتة */}
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-[80] w-full max-w-[420px] pointer-events-none"
          aria-label="قائمة العضوية"
          dir="rtl"
        >
          {/* اللوحة المتحركة */}
          <motion.div
            ref={dragRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            dragElastic={0.04}
            onDragEnd={onDragEnd}
            onDrag={(_, info) => setDragX(info.offset.x || 0)}
            className="pointer-events-auto h-full w-[92vw] max-w-[420px] bg-white dark:bg-gray-900 shadow-2xl outline-none will-change-transform p-0 rounded-l-2xl overflow-hidden"
            style={{ touchAction: "pan-y" }}
          >
            {/* رأس أنيق */}
            <div className="relative p-4 pt-[max(theme(spacing.4),env(safe-area-inset-top))] bg-gradient-to-b from-blue-600 to-blue-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm/5 opacity-90">مرحباً بك</div>
                    <div className="text-base font-semibold">حسابك</div>
                  </div>
                </div>
                <Dialog.Close
                  className="rounded-full p-2 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
            </div>

            {/* محتوى الروابط */}
            <nav className="p-3 space-y-1 bg-white dark:bg-gray-900">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-3 transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "bg-transparent text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${active ? "text-blue-600 dark:text-blue-300" : "text-gray-400"}`} />
                      <span className="text-sm font-medium">{label}</span>
                    </span>
                    <ChevronLeft className={`w-4 h-4 ${active ? "text-blue-500" : "text-gray-400"}`} />
                  </Link>
                );
              })}
            </nav>

            {/* فاصل */}
            <div className="h-px mx-4 bg-gray-200 dark:bg-gray-800" />

            {/* تذييل مع زر الخروج */}
            <div className="p-3 pb-[max(theme(spacing.4),env(safe-area-inset-bottom))] bg-white dark:bg-gray-900">
              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">تسجيل الخروج</span>
              </button>

              <div className="mt-3 text-center text-[11px] text-gray-500 dark:text-gray-400">
                نسخة التطبيق 1.0 • Sabq الذكية
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


