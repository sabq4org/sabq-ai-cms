"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Newspaper, 
  FileText, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Plus,
  Bell,
  Search,
  User,
  LogOut,
  ChevronLeft,
  Zap,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(5); // عدد الإشعارات

  // تحميل CSS الخاص بالموبايل
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/admin-mobile-first.css';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // إعدادات السحب للقائمة الجانبية
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setSidebarOpen(false),
    onSwipedRight: () => setSidebarOpen(true),
    trackMouse: false
  });

  // قائمة التنقل
  const navigationItems = [
    { path: "/admin-mobile", icon: Home, label: "الرئيسية", color: "hsl(var(--accent))" },
    { path: "/admin-mobile/news", icon: Newspaper, label: "الأخبار", color: "#3B82F6" },
    { path: "/admin-mobile/articles", icon: FileText, label: "المقالات", color: "#10B981" },
    { path: "/admin-mobile/analytics", icon: BarChart3, label: "التحليلات", color: "#8B5CF6" },
    { path: "/admin-mobile/settings", icon: Settings, label: "الإعدادات", color: "#6B7280" },
  ];

  // التنقل السفلي (الأكثر استخداماً)
  const bottomNavItems = navigationItems.slice(0, 5);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div className="admin-mobile-container" style={{ minHeight: "100vh", background: "hsl(var(--bg))" }}>
        {/* الهيدر الثابت */}
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            {/* القائمة والشعار */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button 
                className="hamburger-menu touchable"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="فتح القائمة"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
              
              <Link href="/admin-mobile" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "700",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  س
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "hsl(var(--fg))" }}>
                    لوحة التحكم
                  </h1>
                </div>
              </Link>
            </div>

            {/* الأدوات */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                className="btn-mobile btn-sm"
                style={{ background: "transparent", padding: "8px", position: "relative" }}
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search size={20} />
              </button>
              
              <button 
                className="btn-mobile btn-sm"
                style={{ background: "transparent", padding: "8px", position: "relative" }}
              >
                <Bell size={20} />
                {notifications > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "#EF4444",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "600"
                  }}>
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* شريط البحث المخفي */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "hsl(var(--bg-elevated))",
                  borderBottom: "1px solid hsl(var(--line))",
                  padding: "12px"
                }}
              >
                <input
                  type="search"
                  placeholder="البحث في لوحة التحكم..."
                  className="form-input"
                  style={{ fontSize: "16px" }}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* القائمة الجانبية */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="mobile-sidebar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.aside
                className="mobile-sidebar"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                {...swipeHandlers}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: "85%",
                  maxWidth: "280px",
                  height: "100vh",
                  background: "hsl(var(--bg-elevated))",
                  boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.1)",
                  zIndex: 1001,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* رأس القائمة المبسط */}
                <div style={{
                  padding: "16px",
                  borderBottom: "1px solid hsl(var(--line))"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        background: "hsl(var(--accent))",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "bold"
                      }}>
                        {(user?.name || "م")[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "600" }}>{user?.name || "المسؤول"}</div>
                        <div style={{ fontSize: "11px", color: "hsl(var(--muted))" }}>لوحة التحكم</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: "8px",
                        cursor: "pointer",
                        color: "hsl(var(--muted))"
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* عناصر التنقل المبسطة */}
                <nav style={{ flex: 1, padding: "8px" }}>
                  {[
                    { path: "/admin-mobile", label: "الرئيسية", icon: Home },
                    { path: "/admin-mobile/news", label: "الأخبار", icon: Newspaper },
                    { path: "/admin/articles", label: "المقالات", icon: FileText },
                    { path: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
                    { path: "/admin/settings", label: "الإعدادات", icon: Settings }
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          marginBottom: "2px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: active ? "hsl(var(--accent))" : "hsl(var(--fg))",
                          background: active ? "hsl(var(--accent) / 0.1)" : "transparent",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <Icon size={20} />
                        <span style={{ fontSize: "14px", fontWeight: active ? "600" : "400" }}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>



                {/* تسجيل الخروج */}
                <div style={{ padding: "16px", borderTop: "1px solid hsl(var(--line))" }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      borderRadius: "8px",
                      color: "hsl(var(--danger))",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "hsl(var(--danger) / 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <LogOut size={20} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* المحتوى الرئيسي */}
        <main style={{
          paddingTop: "calc(var(--header-height-mobile) + 8px)",
          paddingBottom: "calc(var(--bottom-nav-height) + 8px)",
          minHeight: "100vh"
        }}>
          {children}
        </main>

        {/* زر عائم لإنشاء خبر جديد */}
        <Link
          href="/admin/news/unified"
          style={{
            position: "fixed",
            bottom: "80px",
            left: "20px",
            width: "56px",
            height: "56px",
            background: "hsl(var(--accent))",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 999,
            textDecoration: "none",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          }}
        >
          <Plus size={24} />
        </Link>

        {/* التنقل السفلي */}
        <nav className="bottom-navigation safe-area-bottom">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`bottom-nav-item ${isActive(item.path) ? "active" : ""}`}
            >
              <item.icon size={20} className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* زر عائم للإضافة السريعة */}
        <Link
          href="/admin/news/unified"
          className="fab"
          style={{
            background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
          }}
        >
          <Plus size={24} />
        </Link>
      </div>

      <style jsx>{`
        .stat-card-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: hsl(var(--bg-card));
          border: 1px solid hsl(var(--line));
          border-radius: 8px;
        }
        
        .btn-sm {
          min-width: 36px;
          min-height: 36px;
          padding: 6px;
        }
        
        @media (min-width: 768px) {
          .admin-mobile-container {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
