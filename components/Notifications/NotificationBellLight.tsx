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

export default function NotificationBellLight() {
  const [items, setItems] = useState<NotiItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchFeed = async () => {
    try {
      const r = await fetch("/api/notifications/feed?take=5", { cache: "no-store", credentials: "include" });
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
      <button 
        onClick={() => setOpen((v) => !v)} 
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {items.length > 0 && (
          <>
            {/* نقطة حمراء للإشعارات الجديدة */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            {/* عدد الإشعارات */}
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
              {items.length > 9 ? '9+' : items.length}
            </span>
          </>
        )}
      </button>
      
      {open && (
        <>
          {/* خلفية شفافة للإغلاق */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          
          {/* قائمة الإشعارات */}
          <div className="absolute left-0 top-full mt-2 w-72 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
            {/* رأس القائمة */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">الإشعارات</h3>
            </div>
            
            {/* محتوى الإشعارات */}
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <Link 
                      href={n.link} 
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                        {n.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(n.created_at).toLocaleString("ar-SA", { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            
            {/* زر عرض جميع الإشعارات */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href="/notifications" 
                  className="block px-4 py-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  عرض جميع الإشعارات
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
