/**
 * الترويسة الحديثة - Modern Header
 */

'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  Globe,
  LogOut,
  UserCog,
  HelpCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  showMenuButton
}: ModernHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // بيانات وهمية للإشعارات
  const notifications = [
    { id: 1, title: 'مقال جديد تم نشره', time: 'منذ 5 دقائق', unread: true },
    { id: 2, title: 'تعليق جديد في انتظار المراجعة', time: 'منذ 10 دقائق', unread: true },
    { id: 3, title: 'تحديث النظام مكتمل', time: 'منذ ساعة', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
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

          {/* عنوان الصفحة */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pageDescription}
            </p>
          </div>
        </div>

        {/* الجانب الأوسط - البحث */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="البحث في لوحة التحكم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
            />
          </div>
        </div>

        {/* الجانب الأيسر */}
        <div className="flex items-center gap-2">
          {/* زر البحث للهواتف */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
          >
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
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="font-semibold">
                الإشعارات ({unreadCount} غير مقروءة)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm",
                        notification.unread ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"
                      )}>
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
              <DropdownMenuItem className="text-center text-blue-600 dark:text-blue-400">
                عرض جميع الإشعارات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* تبديل المظهر */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* اللغة */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                🇸🇦 العربية
              </DropdownMenuItem>
              <DropdownMenuItem>
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
                <span className="hidden md:inline text-sm font-medium">
                  أبو محمد
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">أبو محمد</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    admin@sabq.ai
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCog className="h-4 w-4 mr-2" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Zap className="h-4 w-4 mr-2" />
                الاختصارات
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="h-4 w-4 mr-2" />
                المساعدة
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
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
