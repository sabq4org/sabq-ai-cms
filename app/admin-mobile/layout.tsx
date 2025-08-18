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
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                {...swipeHandlers}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: "85%",
                  maxWidth: "320px",
                  height: "100vh",
                  background: "hsl(var(--bg-elevated))",
                  boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.1)",
                  zIndex: 1001,
                  overflowY: "auto"
                }}
              >
                {/* رأس القائمة */}
                <div style={{
                  padding: "20px",
                  borderBottom: "1px solid hsl(var(--line))",
                  background: "hsl(var(--bg-card))"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>القائمة الرئيسية</h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="btn-mobile btn-sm"
                      style={{ background: "transparent", padding: "4px" }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* معلومات المستخدم */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    background: "hsl(var(--bg))",
                    borderRadius: "8px"
                  }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "hsl(var(--accent))",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white"
                    }}>
                      <User size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{user?.name || "المسؤول"}</div>
                      <div style={{ fontSize: "12px", color: "hsl(var(--muted))" }}>{user?.email || "admin@sabq.org"}</div>
                    </div>
                  </div>
                </div>

                {/* عناصر التنقل */}
                <nav style={{ padding: "12px" }}>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px",
                        marginBottom: "4px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        color: isActive(item.path) ? "white" : "hsl(var(--fg))",
                        background: isActive(item.path) ? item.color : "transparent",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <item.icon size={20} />
                      <span style={{ fontSize: "15px", fontWeight: isActive(item.path) ? "600" : "400" }}>
                        {item.label}
                      </span>
                      {isActive(item.path) && (
                        <ChevronLeft size={16} style={{ marginLeft: "auto" }} />
                      )}
                    </Link>
                  ))}
                  
                  {/* زر إنشاء جديد */}
                  <Link
                    href="/admin/news/unified"
                    onClick={() => setSidebarOpen(false)}
                    className="btn-mobile"
                    style={{
                      background: "hsl(var(--accent))",
                      color: "white",
                      width: "100%",
                      marginTop: "16px",
                      justifyContent: "center"
                    }}
                  >
                    <Plus size={20} />
                    <span>إنشاء خبر جديد</span>
                  </Link>
                </nav>

                {/* الإحصائيات السريعة */}
                <div style={{ padding: "20px", borderTop: "1px solid hsl(var(--line))" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "hsl(var(--muted))" }}>
                    إحصائيات سريعة
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div className="stat-card-mini">
                      <Zap size={16} color="#3B82F6" />
                      <div>
                        <div style={{ fontSize: "18px", fontWeight: "600" }}>234</div>
                        <div style={{ fontSize: "11px", color: "hsl(var(--muted))" }}>خبر اليوم</div>
                      </div>
                    </div>
                    <div className="stat-card-mini">
                      <TrendingUp size={16} color="#10B981" />
                      <div>
                        <div style={{ fontSize: "18px", fontWeight: "600" }}>89%</div>
                        <div style={{ fontSize: "11px", color: "hsl(var(--muted))" }}>نسبة النشر</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* تسجيل الخروج */}
                <div style={{ padding: "20px", marginTop: "auto" }}>
                  <button
                    onClick={handleLogout}
                    className="btn-mobile"
                    style={{
                      background: "hsl(var(--danger) / 0.1)",
                      color: "hsl(var(--danger))",
                      width: "100%",
                      justifyContent: "center"
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
