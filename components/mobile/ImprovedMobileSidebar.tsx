"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Home,
  Newspaper,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Users,
  Briefcase,
  Globe,
  Heart,
  Activity,
  ChevronRight,
  Sparkles,
  Clock,
  Star,
  Eye,
} from "lucide-react";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import SiteLogo from "../ui/SiteLogo";

interface ImprovedMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string | number;
  isNew?: boolean;
  isTrending?: boolean;
}

export default function ImprovedMobileSidebar({
  isOpen,
  onClose,
}: ImprovedMobileSidebarProps) {
  const pathname = usePathname();
  const { darkMode } = useDarkModeContext();
  const [activeSection, setActiveSection] = useState("main");

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    onClose();
  }, [pathname]);

  // الأقسام الرئيسية
  const mainSections: MenuItem[] = [
    {
      icon: Home,
      label: "الرئيسية",
      href: "/",
    },
    {
      icon: Newspaper,
      label: "الأخبار",
      href: "/news",
      badge: "جديد",
    },
    {
      icon: TrendingUp,
      label: "الأكثر قراءة",
      href: "/trending",
      isTrending: true,
    },
    {
      icon: Clock,
      label: "لحظة بلحظة",
      href: "/moment-by-moment",
      badge: 5,
    },
    {
      icon: BookOpen,
      label: "مقالات الرأي",
      href: "/opinion-articles",
    },
    {
      icon: MessageSquare,
      label: "التحليلات العميقة",
      href: "/deep-analysis",
      isNew: true,
    },
  ];

  // الأقسام الفرعية
  const categorySections: MenuItem[] = [
    {
      icon: Globe,
      label: "محلي",
      href: "/category/local",
    },
    {
      icon: Globe,
      label: "دولي",
      href: "/category/international",
    },
    {
      icon: Briefcase,
      label: "اقتصاد",
      href: "/category/economy",
    },
    {
      icon: Heart,
      label: "رياضة",
      href: "/category/sports",
    },
    {
      icon: Users,
      label: "مجتمع",
      href: "/category/society",
    },
    {
      icon: Sparkles,
      label: "تقنية",
      href: "/category/technology",
    },
    {
      icon: Star,
      label: "ثقافة",
      href: "/category/culture",
    },
    {
      icon: Activity,
      label: "صحة",
      href: "/category/health",
    },
  ];

  // الخدمات الخاصة
  const specialServices: MenuItem[] = [
    {
      icon: Eye,
      label: "مُقترب",
      href: "/muqtarab",
      isNew: true,
    },
    {
      icon: Star,
      label: "سبق بلس",
      href: "/plus",
      badge: "مميز",
    },
  ];

  return (
    <>
      {/* الخلفية الشفافة */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* القائمة الجانبية */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* رأس القائمة */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <SiteLogo />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* محتوى القائمة */}
          <div className="flex-1 overflow-y-auto">
            {/* الأقسام الرئيسية */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                الأقسام الرئيسية
              </h3>
              <nav className="space-y-1">
                {mainSections.map((item) => (
                  <MenuLink key={item.href} item={item} currentPath={pathname} />
                ))}
              </nav>
            </div>

            {/* الأقسام الفرعية */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                الأقسام
              </h3>
              <nav className="grid grid-cols-2 gap-2">
                {categorySections.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* الخدمات الخاصة */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                خدمات خاصة
              </h3>
              <nav className="space-y-1">
                {specialServices.map((item) => (
                  <MenuLink key={item.href} item={item} currentPath={pathname} />
                ))}
              </nav>
            </div>
          </div>

          {/* تذييل القائمة */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>جميع الحقوق محفوظة © 2024</p>
              <p className="mt-1">صحيفة سبق الإلكترونية</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// مكون رابط القائمة
function MenuLink({
  item,
  currentPath,
}: {
  item: MenuItem;
  currentPath: string;
}) {
  const isActive = currentPath === item.href;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{item.label}</span>
      
      {/* الشارات */}
      {item.badge && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            typeof item.badge === "number"
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : item.badge === "جديد"
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : item.badge === "مميز"
              ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {item.badge}
        </span>
      )}
      
      {/* أيقونات خاصة */}
      {item.isNew && !item.badge && (
        <Sparkles className="w-4 h-4 text-green-500" />
      )}
      {item.isTrending && (
        <TrendingUp className="w-4 h-4 text-orange-500" />
      )}
      
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Link>
  );
}
