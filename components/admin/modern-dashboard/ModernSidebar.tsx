/**
 * الشريط الجانبي الحديث - Modern Sidebar
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Brain,
  Bell,
  Settings,
  Users,
  Folder,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  TrendingUp,
  MessageSquare,
  Shield,
  Database,
  Palette,
  Search,
  Zap,
  Globe,
  Heart,
  Star,
  Network
} from 'lucide-react';

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  isNew?: boolean;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    title: 'لوحة التحكم',
    icon: LayoutDashboard,
    href: '/admin/modern',
  },
  {
    id: 'news-management',
    title: 'إدارة الأخبار',
    icon: Newspaper,
    href: '/admin/news',
    badge: '24',
    children: [
      { id: 'news', title: 'الأخبار', icon: Newspaper, href: '/admin/news' },
      { id: 'articles', title: 'المقالات', icon: FileText, href: '/admin/articles' },
      { id: 'categories', title: 'التصنيفات', icon: Folder, href: '/admin/categories' },
      { id: 'tags', title: 'العلامات', icon: Star, href: '/admin/tags' },
    ]
  },
  {
    id: 'analytics',
    title: 'التحليلات المتقدمة',
    icon: BarChart3,
    href: '/admin/modern/analytics',
    badge: 'AI',
    badgeVariant: 'secondary',
    isNew: true,
  },
  {
    id: 'ai-systems',
    title: 'الأنظمة الذكية',
    icon: Brain,
    href: '/dashboard/smart-blocks',
    badge: '10',
    badgeVariant: 'secondary',
    children: [
      { id: 'smart-entities', title: 'الكيانات الذكية', icon: Network, href: '/admin/smart-entities', badge: 'جديد', badgeVariant: 'secondary' as const },
      { id: 'smart-blocks', title: 'الكتل الذكية', icon: Brain, href: '/admin/smart-blocks' },
      { id: 'sentiment-analysis', title: 'تحليل المشاعر', icon: Heart, href: '/admin/sentiment-analysis' },
      { id: 'recommendations', title: 'التوصيات الذكية', icon: TrendingUp, href: '/admin/recommendations' },
      { id: 'intelligent-search', title: 'البحث الذكي', icon: Search, href: '/admin/intelligent-search' },
      { id: 'deep-insights', title: 'التحليل العميق', icon: BarChart3, href: '/admin/deep-analysis' },
      { id: 'ai-models', title: 'نماذج الذكاء الاصطناعي', icon: Brain, href: '/admin/ai-models' },
      { id: 'ai-editor', title: 'محرر AI', icon: FileText, href: '/admin/ai-editor' },
      { id: 'ai-analytics', title: 'تحليلات AI', icon: TrendingUp, href: '/admin/ai-analytics' },
      { id: 'ai-settings', title: 'إعدادات AI', icon: Settings, href: '/admin/settings/ai-settings' },
    ]
  },
  {
    id: 'content-management',
    title: 'إدارة المحتوى',
    icon: Newspaper,
    href: '/admin/news',
    badge: '45',
    children: [
      { id: 'news-advanced', title: 'إدارة الأخبار المتقدمة', icon: Newspaper, href: '/dashboard/news' },
      { id: 'articles', title: 'إدارة المقالات', icon: FileText, href: '/admin/articles' },
      { id: 'reporters', title: 'إدارة المراسلين', icon: Users, href: '/admin/reporters', badge: 'جديد', badgeVariant: 'secondary' as const },
      { id: 'news-unified', title: 'الأخبار الموحد', icon: Newspaper, href: '/dashboard/news/unified' },
      { id: 'news-mobile', title: 'أخبار الموبايل', icon: Newspaper, href: '/dashboard/news/mobile' },
      { id: 'was-news', title: 'أخبار واس', icon: Globe, href: '/admin/was-news' },
      { id: 'opinions', title: 'مقالات الرأي', icon: MessageSquare, href: '/admin/opinions' },
      { id: 'daily-doses', title: 'الجرعات اليومية', icon: Star, href: '/admin/daily-doses' },
    ]
  },
  {
    id: 'audio-systems',
    title: 'النظم الصوتية',
    icon: Globe,
    href: '/admin/audio-programs',
    badge: 'مميز',
    badgeVariant: 'secondary',
    children: [
      { id: 'audio-programs', title: 'البرامج الصوتية', icon: Globe, href: '/admin/audio-programs' },
      { id: 'audio-newsletters', title: 'النشرات الصوتية', icon: Bell, href: '/dashboard/audio-enhance' },
    ]
  },
  {
    id: 'loyalty-program',
    title: 'برنامج الولاء',
    icon: Heart,
    href: '/admin/loyalty',
    badge: 'جديد',
    badgeVariant: 'outline',
    children: [
      { id: 'loyalty-main', title: 'نظرة عامة', icon: Heart, href: '/admin/loyalty' },
      { id: 'loyalty-users', title: 'المستخدمين', icon: Users, href: '/admin/loyalty/users' },
      { id: 'loyalty-rewards', title: 'المكافآت', icon: Star, href: '/admin/loyalty/rewards' },
      { id: 'loyalty-campaigns', title: 'الحملات', icon: TrendingUp, href: '/admin/loyalty/campaigns' },
    ]
  },
  {
    id: 'notifications',
    title: 'إدارة التنبيهات',
    icon: Bell,
    href: '/admin/notifications',
    badge: '5',
    badgeVariant: 'destructive',
  },
  {
    id: 'performance',
    title: 'تحسين الأداء',
    icon: Zap,
    href: '/admin/performance-optimization',
    badge: 'NEW',
    badgeVariant: 'outline',
    isNew: true,
  },
  {
    id: 'themes',
    title: 'السمات التكيفية',
    icon: Palette,
    href: '/admin/modern/adaptive-themes',
    badge: 'جديد',
    badgeVariant: 'secondary',
    isNew: true,
  },
  {
    id: 'external-data',
    title: 'البيانات الخارجية',
    icon: Globe,
    href: '/admin/external-data',
  },
  {
    id: 'users',
    title: 'المحررين',
    icon: Users,
    href: '/admin/modern/users',
    children: [
      { id: 'editors', title: 'المحررين', icon: Users, href: '/admin/modern/users' },
      { id: 'roles', title: 'الأدوار', icon: Shield, href: '/admin/users/roles' },
    ]
  },
  {
    id: 'media',
    title: 'مكتبة الوسائط',
    icon: Folder,
    href: '/admin/modern/media',
  },
  {
    id: 'comments',
    title: 'التعليقات',
    icon: MessageSquare,
    href: '/admin/modern/comments',
    badge: '12',
  },
  {
    id: 'settings',
    title: 'الإعدادات',
    icon: Settings,
    href: '/admin/settings',
    children: [
      { id: 'general', title: 'عام', icon: Settings, href: '/admin/settings' },
      { id: 'logo-manager', title: 'إدارة اللوجو', icon: Image, href: '/admin/logo-manager', badge: 'جديد', badgeVariant: 'secondary' as const },
      { id: 'vercel-analytics', title: 'تحليلات Vercel', icon: BarChart3, href: '/admin/analytics/vercel', badge: 'جديد', badgeVariant: 'secondary' as const },
      { id: 'advanced', title: 'متقدم', icon: Database, href: '/admin/settings/advanced' },
    ]
  },
];

interface ModernSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export default function ModernSidebar({ 
  isCollapsed, 
  onToggle, 
  isMobile = false 
}: ModernSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['ai-systems']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const SidebarItemComponent = ({ item, level = 0 }: { item: SidebarItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);

    const itemContent = (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
          "hover:bg-blue-50 dark:hover:bg-blue-900/20 group",
          "cursor-pointer select-none",
          level > 0 && "mr-4",
          active && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
          active && "shadow-sm border border-blue-200 dark:border-blue-700"
        )}
        onClick={() => hasChildren && toggleExpanded(item.id)}
      >
        <item.icon className={cn(
          "h-5 w-5 transition-colors",
          active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
          "group-hover:text-blue-600 dark:group-hover:text-blue-400"
        )} />
        
        {!isCollapsed && (
          <>
            <span className={cn(
              "font-medium text-sm transition-colors flex-1",
              active ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
            )}>
              {item.title}
            </span>
            
            {item.badge && (
              <Badge 
                variant={item.badgeVariant || 'default'} 
                className={cn(
                  "text-xs px-2 py-0.5",
                  item.isNew && "animate-pulse"
                )}
              >
                {item.badge}
              </Badge>
            )}
            
            {hasChildren && (
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform text-gray-400",
                isExpanded && "rotate-90"
              )} />
            )}
          </>
        )}
      </div>
    );

    return (
      <div key={item.id}>
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  {itemContent}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-medium">
                {item.title}
                {item.badge && ` (${item.badge})`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div>
            {hasChildren ? (
              itemContent
            ) : (
              <Link href={item.href}>
                {itemContent}
              </Link>
            )}
            
            {hasChildren && isExpanded && !isCollapsed && (
              <div className="mt-1 space-y-1">
                {item.children?.map(child => (
                  <SidebarItemComponent key={child.id} item={child} level={level + 1} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* الترويسة */}
      <div className={cn(
        "p-4 border-b border-gray-200 dark:border-gray-700",
        "flex items-center justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">س</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">سبق الذكية</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">لوحة التحكم</p>
            </div>
          </div>
        )}
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* قائمة التنقل */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(item => (
          <SidebarItemComponent key={item.id} item={item} />
        ))}
      </nav>

      {/* تذييل الشريط الجانبي */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            سبق الذكية v2.0
          </div>
        </div>
      )}
    </div>
  );
}
