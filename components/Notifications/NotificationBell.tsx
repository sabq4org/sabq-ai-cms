"use client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NotiItem {
  id: string;
  title: string;
  link: string;
  created_at: string;
}

export default function NotificationBell() {
  const [items, setItems] = useState<NotiItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchFeed = async () => {
    try {
      const r = await fetch("/api/notifications/feed?take=10", { cache: "no-store", credentials: "include" });
      const j = await r.json();
      if (j?.success) setItems(j.items || []);
    } catch {}
  };

  useEffect(() => {
    fetchFeed();
    const id = setInterval(fetchFeed, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <Bell className="w-5 h-5" />
        {items.length > 0 && (
          <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 z-50">
          {items.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">لا توجد تنويهات</div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {items.map((n) => (
                <li key={n.id} className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href={n.link} className="block">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</div>
                    <div className="text-[11px] text-gray-500">{new Date(n.created_at).toLocaleString("ar-SA")}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}


