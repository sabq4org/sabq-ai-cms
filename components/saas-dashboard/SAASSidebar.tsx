"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  FileText,
  Home,
  MessageSquare,
  PenTool,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

interface SidebarItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isActive?: boolean;
}

interface SAASSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function SAASSidebar({
  isCollapsed = false,
  onToggle,
}: SAASSidebarProps) {
  const { darkMode } = useDarkMode();
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      name: "لوحة التحكم",
      href: "/admin/modern",
      icon: Home,
      isActive: pathname === "/admin/modern",
    },
    {
      id: "analytics",
      name: "التحليلات الذكية",
      href: "/admin/modern/analytics",
      icon: BarChart3,
      badge: 3,
      isActive: pathname.startsWith("/admin/modern/analytics"),
    },
    {
      id: "articles",
      name: "إدارة المقالات",
      href: "/admin/news",
      icon: FileText,
      badge: 12,
      isActive: pathname === "/admin/news",
    },
    {
      id: "opinions",
      name: "مقالات الرأي",
      href: "/opinion-articles",
      icon: PenTool,
      badge: 5,
      isActive: pathname === "/opinion-articles",
    },
    {
      id: "deep-analysis",
      name: "التحليل العميق",
      href: "/admin/deep-analysis",
      icon: TrendingUp,
      isActive: pathname.startsWith("/admin/deep-analysis"),
    },
    {
      id: "smart-content",
      name: "المحتوى الذكي",
      href: "/admin/smart-content",
      icon: Zap,
      badge: 8,
      isActive: pathname.startsWith("/admin/smart-content"),
    },
    {
      id: "readers",
      name: "إدارة القراء",
      href: "/admin/users",
      icon: Users,
      isActive: pathname === "/admin/users",
    },
    {
      id: "comments",
      name: "التعليقات",
      href: "/admin/comments",
      icon: MessageSquare,
      badge: 24,
      isActive: pathname === "/admin/comments",
    },
    {
      id: "knowledge",
      name: "قاعدة المعرفة",
      href: "/admin/knowledge-base",
      icon: BookOpen,
      isActive: pathname.startsWith("/admin/knowledge-base"),
    },
    {
      id: "notifications",
      name: "الإشعارات",
      href: "/admin/notifications",
      icon: Bell,
      badge: 7,
      isActive: pathname === "/admin/notifications",
    },
    {
      id: "settings",
      name: "الإعدادات",
      href: "/admin/settings",
      icon: Settings,
      isActive: pathname === "/admin/settings",
    },
  ];

  return (
    <div
      className={`
        saas-sidebar fixed top-0 right-0 h-full z-40 transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-64"}
        ${darkMode ? "shadow-xl" : "shadow-lg"}
      `}
      style={{
        backgroundColor: "#1A1E24",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-xl font-bold text-white">سبق الذكية</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-gray-900" />
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.isActive;
            const isHovered = hoveredItem === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  saas-sidebar-item group relative flex items-center justify-between
                  ${
                    isCollapsed ? "px-2" : "px-3"
                  } py-2.5 text-sm font-medium rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-yellow-400 text-gray-900 shadow-lg"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }
                `}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center">
                  <IconComponent
                    className={`
                      ${isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"}
                      transition-colors duration-200
                      ${
                        isActive
                          ? "text-gray-900"
                          : "text-gray-400 group-hover:text-white"
                      }
                    `}
                  />
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </div>

                {/* Badge */}
                {item.badge && !isCollapsed && (
                  <span
                    className={`
                      inline-flex items-center justify-center px-2 py-1 text-xs font-bold
                      rounded-full min-w-[1.25rem] h-5
                      ${
                        isActive
                          ? "bg-gray-900 text-yellow-400"
                          : "bg-red-500 text-white"
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && isHovered && (
                  <div
                    className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm
                               rounded-lg shadow-lg z-50 whitespace-nowrap"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                  >
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <div
          className={`
            p-3 rounded-lg border border-gray-700 bg-gray-800/50
            ${isCollapsed ? "text-center" : ""}
          `}
        >
          {!isCollapsed ? (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">
                إصدار النظام
              </p>
              <p className="text-sm font-semibold text-white">v2.1.0</p>
              <p className="text-xs text-gray-500 mt-1">آخر تحديث: اليوم</p>
            </div>
          ) : (
            <div className="w-2 h-2 bg-green-400 rounded-full mx-auto"></div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -left-3 top-16 w-6 h-6 bg-gray-800 border border-gray-600
                     rounded-full flex items-center justify-center text-gray-400
                     hover:text-white hover:bg-gray-700 transition-colors duration-200"
        >
          <div
            className={`w-2 h-2 bg-current rounded-full transition-transform duration-200 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          ></div>
        </button>
      )}
    </div>
  );
}
