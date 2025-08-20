/**
 * QuickAccessHeader - شريط وصول سريع أعلى صفحة لوحة التحكم
 * لا يستبدل ترويسة النظام العامة، بل يضيف طبقة أدوات مخصصة لهذه الصفحة فقط
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Menu,
  Plus,
  Settings,
  BarChart3,
  Newspaper,
  FileText,
  Bot,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import SabqLogo from "@/components/SabqLogo";

interface QuickAccessHeaderProps {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  fullReplace?: boolean; // إذا true يعمل كهيدر أساسي ثابت
}

export default function QuickAccessHeader({
  showMenuButton,
  onMenuClick,
  fullReplace,
}: QuickAccessHeaderProps) {
  const router = useRouter();
  const [notifications] = useState(3);
  const searchRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const isAdmin = !!(user && (user.is_admin || ['admin','super_admin','system_admin'].includes(user.role)));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (fullReplace) {
    return (
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-[var(--dashboard-header-height)] transition-colors duration-300"
        dir="rtl"
      >
        <div className="px-4 lg:px-6 h-full flex items-center justify-between py-2">
          {/* اليمين: زر القائمة + الشعار + اسم المشروع */}
          <div className="flex items-center gap-3">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="lg:hidden"
                aria-label="فتح القائمة الجانبية"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center">
              <SabqLogo className="hidden sm:block" width={84} height={24} />
              <SabqLogo className="sm:hidden" width={64} height={20} />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm text-gray-500 dark:text-gray-300 leading-tight">مشروع</div>
              <div className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">سبق الذكية</div>
            </div>
          </div>

          {/* الوسط: بحث عالمي */}
          <div className="flex-1 hidden md:flex max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchRef}
                placeholder="ابحث عالمياً (Ctrl + K)"
                className="pr-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
              />
            </div>
          </div>

          {/* اليسار: وصلات سريعة + إجراءات (قابلة للتمرير على الجوال) */}
          <div className="admin-header flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <Link href="/admin/news">
              <Button variant="ghost" size="sm" className="gap-1" disabled={!isAdmin} title={!isAdmin ? 'يتطلب صلاحيات إدارية' : undefined}>
                <Newspaper className="h-5 w-5" />
                <span className="hidden lg:inline text-sm">الأخبار</span>
              </Button>
            </Link>
            <Link href="/admin/modern/articles">
              <Button variant="ghost" size="sm" className="gap-1" disabled={!isAdmin} title={!isAdmin ? 'يتطلب صلاحيات إدارية' : undefined}>
                <FileText className="h-5 w-5" />
                <span className="hidden lg:inline text-sm">المقالات</span>
              </Button>
            </Link>
            <Link href="/admin/modern/analytics">
              <Button variant="ghost" size="sm" className="gap-1" disabled={!isAdmin} title={!isAdmin ? 'يتطلب صلاحيات إدارية' : undefined}>
                <BarChart3 className="h-5 w-5" />
                <span className="hidden lg:inline text-sm">التحليلات</span>
              </Button>
            </Link>
            <Link href="/admin/stories">
              <Button variant="ghost" size="sm" className="gap-1" disabled={!isAdmin} title={!isAdmin ? 'يتطلب صلاحيات إدارية' : undefined}>
                <Bot className="h-5 w-5" />
                <span className="hidden lg:inline text-sm">القصص الذكية</span>
              </Button>
            </Link>
            <Link href="/admin/modern/settings">
              <Button variant="ghost" size="sm" className="gap-1" disabled={!isAdmin} title={!isAdmin ? 'يتطلب صلاحيات إدارية' : undefined}>
                <Settings className="h-5 w-5" />
                <span className="hidden lg:inline text-sm">الإعدادات</span>
              </Button>
            </Link>
            <Link href="/admin/ai-editor">
              <Button variant="ghost" size="sm" className="gap-1" disabled={!isAdmin} title={!isAdmin ? 'يتطلب صلاحيات إدارية' : undefined}>
                <Bot className="h-5 w-5" />
                <span className="hidden xl:inline text-sm">أنظمة AI</span>
              </Button>
            </Link>

            <div className="mx-1 hidden md:block h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* إنشاء جديد */}
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/admin/news/create-new")}
              aria-label="إنشاء محتوى جديد"
            >
              <Plus className="h-5 w-5" />
            </Button>

            {/* الإشعارات */}
            <Button variant="ghost" size="sm" className="relative" aria-label="الإشعارات">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* الملف الشخصي */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" aria-label="الملف الشخصي">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline text-sm">{user?.name || "حسابي"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-0">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.name || "مدير النظام"}</span>
                    <span className="text-xs text-gray-500">{user?.email || "account"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/modern/settings")}>
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/modern/settings")}>الإعدادات</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await logout();
                    } finally {
                      window.location.href = "/admin/login";
                    }
                  }}
                  className="text-red-600"
                >
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }

  // الوضع الافتراضي: كبطاقة داخل الصفحة
  return (
    <div className="w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-3 md:p-4" dir="rtl">
      <div className="flex items-center gap-3 md:gap-6 justify-between">
        {/* اليسار: الشعار + اسم المشروع */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <SabqLogo className="hidden sm:block" width={84} height={24} />
            <SabqLogo className="sm:hidden" width={64} height={20} />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm text-gray-500 dark:text-gray-300 leading-tight">مشروع</div>
            <div className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">سبق الذكية</div>
          </div>
        </div>

        {/* الوسط: بحث عالمي */}
        <div className="flex-1 hidden md:flex max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchRef}
              placeholder="ابحث عالمياً (Ctrl + K)"
              className="pr-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
            />
          </div>
        </div>

        {/* اليمين: وصلات سريعة + إجراءات (قابلة للتمرير على الجوال) */}
        <div className="admin-header flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <Link href="/admin/news">
            <Button variant="ghost" size="sm" className="gap-1">
              <Newspaper className="h-5 w-5" />
              <span className="hidden lg:inline text-sm">الأخبار</span>
            </Button>
          </Link>
          <Link href="/admin/modern/articles">
            <Button variant="ghost" size="sm" className="gap-1">
              <FileText className="h-5 w-5" />
              <span className="hidden lg:inline text-sm">المقالات</span>
            </Button>
          </Link>
          <Link href="/admin/modern/analytics">
            <Button variant="ghost" size="sm" className="gap-1">
              <BarChart3 className="h-5 w-5" />
              <span className="hidden lg:inline text-sm">التحليلات</span>
            </Button>
          </Link>
          <Link href="/admin/stories">
            <Button variant="ghost" size="sm" className="gap-1">
              <Bot className="h-5 w-5" />
              <span className="hidden lg:inline text-sm">القصص الذكية</span>
            </Button>
          </Link>
          <Link href="/admin/modern/settings">
            <Button variant="ghost" size="sm" className="gap-1">
              <Settings className="h-5 w-5" />
              <span className="hidden lg:inline text-sm">الإعدادات</span>
            </Button>
          </Link>
          <Link href="/admin/ai-editor">
            <Button variant="ghost" size="sm" className="gap-1">
              <Bot className="h-5 w-5" />
              <span className="hidden xl:inline text-sm">أنظمة AI</span>
            </Button>
          </Link>

          <div className="mx-1 hidden md:block h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* إنشاء جديد */}
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push("/admin/news/create-new")}
            aria-label="إنشاء محتوى جديد"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {/* الإشعارات */}
          <Button variant="ghost" size="sm" className="relative" aria-label="الإشعارات">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* الملف الشخصي */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2" aria-label="الملف الشخصي">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden md:inline text-sm">{user?.name || "حسابي"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-0">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name || "مدير النظام"}</span>
                  <span className="text-xs text-gray-500">{user?.email || "account"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/admin/modern/settings")}>
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/modern/settings")}>الإعدادات</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await logout();
                  } finally {
                    window.location.href = "/admin/login";
                  }
                }}
                className="text-red-600"
              >
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


