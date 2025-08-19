"use client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface NotiItem {
  id: string;
  title: string;
  message?: string;
  metadata?: any;
  link: string;
  created_at: string;
}

export default function NotificationBell() {
  const [items, setItems] = useState<NotiItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const markAll = async () => {
    try {
      const r = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAll: true })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      
      // تحديث الحالة المحلية فوراً
      setUnread(0);
      
      // إعادة جلب الإشعارات للتأكد من التحديث
      await fetchNotifications();
    } catch (error) {
      console.error('فشل في تحديد جميع الإشعارات كمقروءة:', error);
    }
  };

  const markSingle = async (notificationId: string) => {
    try {
      const r = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      
      // إعادة جلب الإشعارات للتأكد من التحديث
      await fetchNotifications();
    } catch (error) {
      console.error('فشل في تحديد الإشعار كمقروء:', error);
    }
  };

  const mapLink = (n: any): string => {
    const data = n.data || {};
    // استخدام الرابط المباشر إذا كان موجود
    if (data.link) return data.link;
    // Fallback للطرق القديمة
    if (data.articleId) return `/news/${data.articleId}`;
    if (data.entityType === 'article' && data.entityId) return `/news/${data.entityId}`;
    return "/profile/notifications";
  };

  const fetchNotifications = async () => {
    try {
      const r = await fetch("/api/notifications?limit=10", { cache: "no-store", credentials: "include" });
      const j = await r.json();
      if (r.status === 401) {
        setItems([]);
        setUnread(0);
        return;
      }
      if (j?.success && j.data) {
        const list: NotiItem[] = (j.data.notifications || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          metadata: n.metadata || n.data,
          link: n.link || mapLink(n),
          created_at: n.created_at,
        }));
        setItems(list);
        setUnread(j.data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const id = setInterval(fetchNotifications, 5000);
      return () => clearInterval(id);
    } else {
      // المستخدم غير مسجل، امسح جميع الإشعارات
      setItems([]);
      setUnread(0);
      setOpen(false);
    }
  }, [user]);

  // لا تعرض الإشعارات للمستخدمين غير المسجلين
  if (!user) {
    return null;
  }

  return (
    <div className="relative rtl:text-right">
      <button onClick={() => setOpen((v) => !v)} className="notification-bell-button relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Bell className="w-5 h-5" />
        {(unread || items.length) > 0 && (
          <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unread > 0 ? unread : items.length}
          </span>
        )}
      </button>
      {open && (
        <>
          {/* طبقة شفافة للنقر خارج البوكس */}
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={() => setOpen(false)}
          />
          <div className="fixed md:absolute md:left-auto md:right-0 left-2 right-2 md:w-80 w-[calc(100vw-1rem)] mt-2 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 z-50 rtl:text-right">
          {items.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">لا توجد إشعارات</div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              <li className="px-2 py-1 text-xs text-gray-500 flex items-center justify-between">
                <span>{unread > 0 ? `${unread} غير مقروءة` : 'لا يوجد غير مقروء'}</span>
                <button onClick={markAll} className="text-blue-600 hover:text-blue-800">تحديد الكل كمقروء</button>
              </li>
              {items
                .slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((n) => (
                <li key={n.id} className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-right rtl:text-right">
                  <Link 
                    href={n.link} 
                    className="block" 
                    onClick={async () => {
                      // تحديد الإشعار كمقروء عند النقر عليه
                      await markSingle(n.id);
                      setOpen(false);
                    }}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{n.title}</div>
                    {n.metadata?.categoryIntro && (
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">{n.metadata.categoryIntro}</div>
                    )}
                    {n.message && (
                      <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">{n.message}</div>
                    )}
                    <div className="text-[11px] text-gray-500 mt-1">{new Date(n.created_at).toLocaleString("ar-SA")}</div>
                  </Link>
                </li>
              ))}
              <li className="px-2 py-2 text-center">
                <button onClick={markAll} className="text-sm text-blue-600 hover:text-blue-800">تحديد الكل كمقروء</button>
              </li>
            </ul>
          )}
          </div>
        </>
      )}
    </div>
  );
}


