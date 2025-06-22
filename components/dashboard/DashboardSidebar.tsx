'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  TrendingUp, 
  Users, 
  Shield, 
  Activity, 
  Calendar, 
  Settings, 
  Bell,
  BarChart,
  Edit3,
  FolderOpen,
  Plus,
  UserPlus,
  Zap,
  Layout,
  Newspaper,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'الرئيسية', href: '/dashboard' },
  { icon: Zap, label: 'لوحة سبق الذكية', href: '/dashboard/console', badge: 'جديد' },
  { icon: Newspaper, label: 'الأخبار', href: '/dashboard/news' },
  { icon: Brain, label: 'التحليل العميق', href: '/dashboard/deep-analysis', badge: 'جديد' },
  { icon: Settings, label: 'الإعدادات', href: '/dashboard/settings' },
  { icon: FileText, label: 'المقالات', href: '/dashboard/articles' },
  { icon: Edit3, label: 'التحرير', href: '/dashboard/editor' },
  { icon: FolderOpen, label: 'التصنيفات', href: '/dashboard/categories' },
  { icon: Layout, label: 'القوالب', href: '/dashboard/templates', badge: 'جديد' },
  { icon: TrendingUp, label: 'التحليلات', href: '/dashboard/analytics' },
  { icon: Users, label: 'إدارة الفريق', href: '/dashboard/team' },
  { icon: Shield, label: 'الأدوار والصلاحيات', href: '/dashboard/roles' },
  { icon: Activity, label: 'سجل النشاطات', href: '/dashboard/activities' },
  { icon: Bell, label: 'الإشعارات', href: '/dashboard/notifications' },
  { icon: BarChart, label: 'التقارير', href: '/dashboard/reports' },
  { icon: Calendar, label: 'جدولة النشر', href: '/dashboard/schedule' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sabq-sidebar w-64 min-h-[calc(100vh-4rem)] p-4">
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
          القائمة الرئيسية
        </h3>
      </div>
      
      <ul className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
          
          return (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={cn(
                  "sabq-sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive && "active"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
          اختصارات
        </h3>
        <ul className="space-y-2">
          <li>
            <Link 
              href="/dashboard/articles/new"
              className="sabq-sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="w-5 h-5" />
              <span>مقال جديد</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/users/invite"
              className="sabq-sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <UserPlus className="w-5 h-5" />
              <span>دعوة مستخدم</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* معلومات المستخدم */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-medium">أ</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                أحمد الشمري
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                رئيس تحرير
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// تصدير المكون Plus
export { Plus as UserPlus } from 'lucide-react'; 