"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserMenuDrawerProps {
  trigger: React.ReactNode;
}

export default function UserMenuDrawer({ trigger }: UserMenuDrawerProps) {
  const [open, setOpen] = useState(false);

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

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        {/* الخلفية */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />

        {/* اللوحة (RTL: من اليمين) */}
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-[70] w-[92vw] max-w-[420px] bg-white dark:bg-gray-900 shadow-2xl outline-none will-change-transform data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right p-4 pt-[max(theme(spacing.4),env(safe-area-inset-top))] pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]"
          aria-label="قائمة العضوية"
          dir="rtl"
        >
          {/* رأس القائمة */}
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">قائمة العضوية</h2>
            <Dialog.Close className="rounded p-2 focus:outline-none focus:ring focus:ring-blue-500/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              إغلاق
            </Dialog.Close>
          </header>

          {/* روابط القائمة */}
          <nav className="space-y-1">
            <Link onClick={() => setOpen(false)} href="/profile" className="block rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200">
              الملف الشخصي
            </Link>
            <Link onClick={() => setOpen(false)} href="/my-journey" className="block rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200">
              رحلتك المعرفية
            </Link>
            <Link onClick={() => setOpen(false)} href="/bookmarks" className="block rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200">
              المحفوظات
            </Link>
            <Link onClick={() => setOpen(false)} href="/settings" className="block rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200">
              الإعدادات
            </Link>
            <button onClick={handleLogout} className="block w-full text-right rounded-md px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              تسجيل الخروج
            </button>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


