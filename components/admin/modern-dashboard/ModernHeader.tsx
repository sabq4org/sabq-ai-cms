/**
 * الترويسة الحديثة - Modern Header
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Search,
  Settings,
  Sun,
  UserCog,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ModernHeaderProps {
  pageTitle: string;
  pageDescription: string;
  onMenuClick: () => void;
  showMenuButton: boolean;
}

export default function ModernHeader({
  pageTitle,
  pageDescription,
  onMenuClick,
  showMenuButton,
}: ModernHeaderProps) {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useAuth();
  const router = useRouter();

  const notifications = [
    { id: 1, title: "مقال جديد تم نشره", time: "منذ 5 دقائق", unread: true },
    {
      id: 2,
      title: "تعليق جديد في انتظار المراجعة",
      time: "منذ 10 دقائق",
      unread: true,
    },
    { id: 3, title: "تحديث النظام مكتمل", time: "منذ ساعة", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="h-5 w-5" />;

    if (theme === "system") {
      return <Monitor className="h-5 w-5" />;
    }
    return resolvedTheme === "dark" ? (
      <Sun className="h-5 w-5" />
    ) : (
      <Moon className="h-5 w-5" />
    );
  };

  const getThemeName = () => {
    if (theme === "system") return "النظام";
    if (theme === "dark") return "ليلي";
    return "نهاري";
  };

  const showDescription = Boolean(
    pageDescription && pageDescription.trim() !== pageTitle?.trim()
  );

  const handleLogout = async () => {
    try {
      await logout();
      // سيقوم AuthContext بإعادة التوجيه إلى "/"، وإن أردنا صفحة دخول الإدارة:
      // router.replace("/admin/login");
    } catch (e) {
      // لا شيء؛ سجل فقط في وحدة التحكم
      console.error("Logout failed", e);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 h-[var(--dashboard-header-height)] transition-colors duration-300">
      <div className="px-4 lg:px-6 h-full flex items-center justify-between py-2">
        {/* الجانب الأيمن */}
        <div className="flex items-center gap-4">
          {/* زر القائمة للهواتف */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* عنوان الصفحة + شارة علامة تجارية مبسطة */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shadow-sm">
              <span className="text-[13px] font-extrabold">س</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {pageTitle}
              </h1>
              {showDescription && (
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                  {pageDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* الجانب الأوسط - البحث */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="ابحث بسرعة (⌘/Ctrl + K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors duration-200"
            />
          </div>
        </div>

        {/* الجانب الأيسر */}
        <div className="flex items-center gap-2">
          {/* زر البحث للهواتف */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* الإشعارات */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <DropdownMenuLabel className="font-semibold">
                الإشعارات ({unreadCount} غير مقروءة)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm",
                          notification.unread
                            ? "font-medium text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-300"
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                عرض جميع الإشعارات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* تبديل المظهر */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="تبديل المظهر">
                {getThemeIcon()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <DropdownMenuItem
                onClick={() => handleThemeChange("light")}
                className={cn(
                  "gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                  theme === "light" && "bg-blue-50 dark:bg-blue-900/30"
                )}
              >
                <Sun className="h-4 w-4" />
                <span>نهاري</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleThemeChange("dark")}
                className={cn(
                  "gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                  theme === "dark" && "bg-blue-50 dark:bg-blue-900/30"
                )}
              >
                <Moon className="h-4 w-4" />
                <span>ليلي</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleThemeChange("system")}
                className={cn(
                  "gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                  theme === "system" && "bg-blue-50 dark:bg-blue-900/30"
                )}
              >
                <Monitor className="h-4 w-4" />
                <span>حسب النظام</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* اللغة */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                🇸🇦 العربية
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                🇺🇸 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* الملف الشخصي */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">أ</span>
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                  أبو محمد
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text:white">
                    أبو محمد
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    admin@sabq.ai
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <UserCog className="h-4 w-4 mr-2" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <Settings className="h-4 w-4 mr-2" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <Zap className="h-4 w-4 mr-2" />
                الاختصارات
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <HelpCircle className="h-4 w-4 mr-2" />
                المساعدة
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
