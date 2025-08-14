"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  BookOpen,
  LogOut,
  ChevronRight,
  Award,
  Star,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDarkModeContext } from "@/contexts/DarkModeContext";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export default function UserDropdown({ isOpen, onClose, anchorRef }: UserDropdownProps) {
  const { user, logout, isLoggedIn } = useAuth();
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // بيانات مستخدم تجريبية إذا لم يكن هناك مستخدم
  const displayUser = user || {
    name: "أبو محمد",
    email: "user@sabq.ai",
    points: 1250,
    badges: ["قارئ نشط", "محلل متميز"]
  };

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/");
  };

  const menuItems = [
    {
      icon: User,
      label: "الملف الشخصي",
      href: "/profile",
      description: "عرض وتعديل معلوماتك",
    },
    {
      icon: BookOpen,
      label: "رحلتك المعرفية",
      href: "/journey",
      description: "تتبع تقدمك ونقاطك",
      badge: displayUser.points || 0,
    },
    {
      icon: Settings,
      label: "الإعدادات",
      href: "/settings",
      description: "تخصيص تجربتك",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* خلفية شفافة للموبايل */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="user-dropdown-backdrop md:hidden fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* القائمة المنسدلة */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              user-dropdown absolute top-full left-2 mt-2 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden
              ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
              border backdrop-blur-sm
            `}
          >
            {/* رأس القائمة - معلومات المستخدم */}
            <div className={`p-4 border-b ${darkMode ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                  ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"}
                `}>
                  {displayUser.name?.charAt(0) || "م"}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {displayUser.name || "مستخدم"}
                  </p>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {displayUser.email || "user@example.com"}
                  </p>
                </div>
              </div>

              {/* شارات المستخدم */}
              {displayUser.badges && displayUser.badges.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {displayUser.badges.slice(0, 3).map((badge, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    >
                      <Award className="w-3 h-3" />
                      <span className="text-xs">{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* عناصر القائمة */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3 transition-all duration-200
                      ${darkMode 
                        ? "hover:bg-gray-700/50 text-gray-300 hover:text-white" 
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      {item.description && (
                        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.badge !== undefined && (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Star className="w-3 h-3" />
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
                  </Link>
                );
              })}
            </div>

            {/* زر تسجيل الخروج */}
            <div className={`p-2 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <button
                onClick={handleLogout}
                className={`
                  logout-button w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                  font-medium text-sm transition-all duration-200
                  bg-red-500 hover:bg-red-600 text-white
                  transform hover:scale-[1.02] active:scale-[0.98]
                `}
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
