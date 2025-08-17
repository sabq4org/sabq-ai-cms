/**
 * الشريط الجانبي الحديث - Modern Sidebar
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarPreferences } from "@/contexts/SidebarPreferencesContext";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Database,
  FileText,
  Folder,
  Globe,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Network,
  Newspaper,
  Palette,
  PenTool,
  Search,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { readSidebarVisibility } from "@/lib/ui-visibility";

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  isNew?: boolean;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    title: "لوحة التحكم",
    icon: LayoutDashboard,
    href: "/admin/modern",
  },
  {
    id: "news-management",
    title: "إدارة الأخبار",
    icon: Newspaper,
    href: "/admin/news",
    children: [
      { id: "news", title: "الأخبار", icon: Newspaper, href: "/admin/news" },
      {
        id: "articles",
        title: "المقالات",
        icon: FileText,
        href: "/admin/articles",
      },
      {
        id: "categories",
        title: "التصنيفات",
        icon: Folder,
        href: "/admin/categories",
      },
      { id: "tags", title: "العلامات", icon: Star, href: "/admin/tags" },

      // القصص الذكية تحت إدارة الأخبار
      {
        id: "smart-stories",
        title: "القصص الذكية",
        icon: Brain,
        href: "/admin/stories",
      },

      // نقل نظام مُقترب تحت إدارة الأخبار
      {
        id: "muqtarab-module",
        title: "نظام مُقترب",
        icon: PenTool,
        href: "/admin/muqtarib",
        children: [
          {
            id: "muqtarib-dashboard",
            title: "إدارة الزوايا",
            icon: BookOpen,
            href: "/admin/muqtarab",
          },
          {
            id: "muqtarib-angles-new",
            title: "إنشاء زاوية جديدة",
            icon: PenTool,
            href: "/admin/muqtarab/angles/new",
          },
        ],
      },

      // نقل مكتبة الوسائط تحت إدارة الأخبار
      {
        id: "media-library",
        title: "مكتبة الوسائط",
        icon: Folder,
        href: "/admin/modern/media",
      },

      // نقل النظم الصوتية تحت إدارة الأخبار
      {
        id: "audio-systems",
        title: "النظم الصوتية",
        icon: Globe,
        href: "/admin/audio-programs",
        children: [
          {
            id: "audio-programs",
            title: "البرامج الصوتية",
            icon: Globe,
            href: "/admin/audio-programs",
          },
          {
            id: "audio-newsletters",
            title: "النشرات الصوتية",
            icon: Bell,
            href: "/dashboard/audio-enhance",
          },
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "التحليلات المتقدمة",
    icon: BarChart3,
    href: "/admin/modern/analytics",
    children: [
      {
        id: "analytics-dashboard",
        title: "لوحة التحليلات",
        icon: BarChart3,
        href: "/test-analytics",
      },
      {
        id: "analytics-reports",
        title: "التقارير المفصلة",
        icon: FileText,
        href: "/admin/analytics/reports",
      },
      {
        id: "analytics-insights",
        title: "الرؤى الذكية",
        icon: Brain,
        href: "/admin/analytics/insights",
      },
    ],
  },
  {
    id: "ai-systems",
    title: "الأنظمة الذكية",
    icon: Brain,
    href: "/dashboard/smart-blocks",
    children: [
      {
        id: "smart-system-control",
        title: "النظام الذكي المتكامل",
        icon: Settings,
        href: "/admin/smart-system",
        badge: "جديد",
        badgeVariant: "default" as const,
        isNew: true,
      },
      {
        id: "system-status",
        title: "مراقبة الأنظمة",
        icon: Activity,
        href: "/admin/system-status",
        badge: "مراقبة",
        badgeVariant: "secondary" as const,
      },
      {
        id: "live-analytics",
        title: "التحليلات المباشرة",
        icon: BarChart3,
        href: "/admin/analytics/live",
        badge: "مباشر",
        badgeVariant: "default" as const,
      },
      {
        id: "smart-entities",
        title: "الكيانات الذكية",
        icon: Network,
        href: "/admin/smart-entities",
      },
      {
        id: "smart-blocks",
        title: "الكتل الذكية",
        icon: Brain,
        href: "/admin/smart-blocks",
      },
      {
        id: "sentiment-analysis",
        title: "تحليل المشاعر",
        icon: Heart,
        href: "/admin/sentiment-analysis",
      },
      {
        id: "recommendations",
        title: "التوصيات الذكية",
        icon: TrendingUp,
        href: "/admin/recommendations",
      },
      {
        id: "intelligent-search",
        title: "البحث الذكي",
        icon: Search,
        href: "/admin/intelligent-search",
      },
      {
        id: "deep-insights",
        title: "التحليل العميق",
        icon: BarChart3,
        href: "/admin/deep-analysis",
      },
      {
        id: "ai-models",
        title: "نماذج الذكاء الاصطناعي",
        icon: Brain,
        href: "/admin/ai-models",
      },
      {
        id: "ai-editor",
        title: "محرر AI",
        icon: FileText,
        href: "/admin/ai-editor",
      },
      {
        id: "ai-analytics",
        title: "تحليلات AI",
        icon: TrendingUp,
        href: "/admin/ai-analytics",
      },
      {
        id: "ai-settings",
        title: "إعدادات AI",
        icon: Settings,
        href: "/admin/settings/ai-settings",
      },
    ],
  },
  // تمت إزالة قسم إدارة المحتوى حسب الطلب ونقل الأقسام المطلوبة تحت إدارة الأخبار
  {
    id: "loyalty-program",
    title: "برنامج الولاء",
    icon: Heart,
    href: "/admin/loyalty",
    children: [
      {
        id: "loyalty-main",
        title: "نظرة عامة",
        icon: Heart,
        href: "/admin/loyalty",
      },
      {
        id: "loyalty-users",
        title: "المستخدمين",
        icon: Users,
        href: "/admin/loyalty/users",
      },
      {
        id: "loyalty-rewards",
        title: "المكافآت",
        icon: Star,
        href: "/admin/loyalty/rewards",
      },
      {
        id: "loyalty-campaigns",
        title: "الحملات",
        icon: TrendingUp,
        href: "/admin/loyalty/campaigns",
      },
    ],
  },
  {
    id: "notifications",
    title: "إدارة التنبيهات",
    icon: Bell,
    href: "/admin/notifications",
  },
  {
    id: "performance",
    title: "تحسين الأداء",
    icon: Zap,
    href: "/admin/performance-optimization",
  },
  {
    id: "themes",
    title: "السمات التكيفية",
    icon: Palette,
    href: "/admin/modern/adaptive-themes",
  },
  {
    id: "external-data",
    title: "البيانات الخارجية",
    icon: Globe,
    href: "/admin/external-data",
  },
  {
    id: "users",
    title: "المستخدمين",
    icon: Users,
    href: "/admin/users",
    children: [
      { id: "readers", title: "القراء", icon: Users, href: "/admin/users" },
      { id: "team", title: "الفريق", icon: Users, href: "/admin/team" },
      {
        id: "roles",
        title: "الأدوار",
        icon: Shield,
        href: "/admin/users/roles",
      },
    ],
  },
  
  {
    id: "comments",
    title: "التعليقات",
    icon: MessageSquare,
    href: "/admin/modern/comments",
  },
  {
    id: "settings",
    title: "الإعدادات",
    icon: Settings,
    href: "/admin/settings",
    children: [
      { id: "general", title: "عام", icon: Settings, href: "/admin/settings" },
      {
        id: "sidebar-settings",
        title: "تخصيص الشريط الجانبي",
        icon: LayoutDashboard,
        href: "/admin/settings/sidebar",
      },
      {
        id: "logo-manager",
        title: "إدارة اللوجو",
        icon: Palette,
        href: "/admin/logo-manager",
      },
      {
        id: "vercel-analytics",
        title: "تحليلات Vercel",
        icon: BarChart3,
        href: "/admin/analytics/vercel",
      },
      {
        id: "advanced",
        title: "متقدم",
        icon: Database,
        href: "/admin/settings/advanced",
      },
    ],
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
  isMobile = false,
}: ModernSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // حفظ واسترجاع حالة الطيّ محلياً
  const STORAGE_KEY = "adminSidebarExpanded_v1";
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setExpandedItems(parsed as string[]);
      }
    } catch {}
    // افتراضياً: كل العناوين مغلقة
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedItems));
    } catch {}
  }, [expandedItems]);

  // استخدام تفضيلات الشريط الجانبي
  const { preferences, loading } = useSidebarPreferences();

  // ترتيب وفلترة العناصر حسب التفضيلات
  const [globalVisibility, setGlobalVisibility] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    // قراءة الإعداد العالمي من الخادم (يعمل في العميل عبر نداء API داخلي)
    // في بيئة SSR يمكن نقله لمكوّن خادم لاحقاً
    (async () => {
      try {
        const res = await fetch("/api/admin/ui/sidebar-visibility", { headers: { "x-internal": "1" } });
        if (res.ok) {
          const data = await res.json();
          const map = new Map<string, boolean>((data.items ?? []).map((i: any) => [i.key, !!i.visible]));
          const obj: Record<string, boolean> = {};
          sidebarItems.forEach((it) => { obj[it.id] = map.get(it.id) ?? true; });
          setGlobalVisibility(obj);
        } else {
          setGlobalVisibility(null);
        }
      } catch {
        setGlobalVisibility(null);
      }
    })();
  }, []);

  const customizedSidebarItems = useMemo(() => {
    if (loading || preferences.sidebar_order.length === 0) {
      let base = sidebarItems.filter((item) => !preferences.sidebar_hidden.includes(item.id));
      if (globalVisibility) {
        base = base.filter((it) => globalVisibility[it.id] !== false);
      }
      return base;
    }

    // ترتيب العناصر حسب التفضيلات
    const orderedItems = preferences.sidebar_order
      .map((id) => sidebarItems.find((item) => item.id === id))
      .filter(Boolean) as SidebarItem[];

    // إضافة أي عناصر جديدة لم تكن موجودة في الترتيب المحفوظ
    const newItems = sidebarItems.filter(
      (item) => !preferences.sidebar_order.includes(item.id)
    );

    const allItems = [...orderedItems, ...newItems];

    let filtered = allItems.filter((item) => !preferences.sidebar_hidden.includes(item.id));
    if (globalVisibility) {
      filtered = filtered.filter((it) => globalVisibility[it.id] !== false);
    }
    return filtered;
  }, [preferences, loading, globalVisibility]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const SidebarItemComponent = ({
    item,
    level = 0,
  }: {
    item: SidebarItem;
    level?: number;
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);

    const itemContent = (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          marginRight: level > 0 ? '16px' : '0',
          background: active ? 'hsl(var(--accent))' : 'transparent',
          color: active ? 'white' : 'hsl(var(--fg))',
          border: 'none'
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'hsl(var(--accent) / 0.1)';
            e.currentTarget.style.color = 'hsl(var(--accent))';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'hsl(var(--fg))';
          }
        }}
        onClick={() => hasChildren && toggleExpanded(item.id)}
      >
        <item.icon
          style={{
            width: '20px',
            height: '20px',
            transition: 'color 0.2s ease',
            color: 'inherit'
          }}
        />

        {!isCollapsed ? (
          <>
            <span
              style={{
                fontWeight: '500',
                fontSize: '14px',
                transition: 'color 0.2s ease',
                flex: 1,
                color: 'inherit'
              }}
            >
              {item.title}
            </span>

            {item.badge && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'hsl(var(--accent) / 0.2)',
                  color: 'hsl(var(--accent))',
                  fontWeight: '600',
                  animation: item.isNew ? 'pulse 2s infinite' : 'none'
                }}
              >
                {item.badge}
              </span>
            )}

            {hasChildren && (
              isExpanded ? (
                <Minus style={{ width: '16px', height: '16px', color: 'hsl(var(--muted))' }} />
              ) : (
                <Plus style={{ width: '16px', height: '16px', color: 'hsl(var(--muted))' }} />
              )
            )}
          </>
        ) : null}
      </div>
    );

    return (
      <div key={item.id}>
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={item.href}>{itemContent}</Link>
              </TooltipTrigger>
              <TooltipContent 
                side="left" 
                style={{
                  background: 'hsl(var(--bg-card))',
                  color: 'hsl(var(--fg))',

                  fontWeight: '500'
                }}
              >
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
              <Link href={item.href}>{itemContent}</Link>
            )}

            {hasChildren && isExpanded && !isCollapsed && (
              <div style={{ 
                marginTop: '8px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px' 
              }}>
                {item.children?.map((child) => (
                  <SidebarItemComponent
                    key={child.id}
                    item={child}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="manus-sidebar" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '0',
      boxShadow: 'none',
      background: 'hsl(var(--bg))'
    }}>

      {/* شعار مصغر للسايدبار */}
      {isCollapsed && (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'hsl(var(--accent))',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: '700',
            margin: '0 auto'
          }}>
            س
          </div>
        </div>
      )}

      {/* قائمة التنقل بتصميم Manus UI */}
      <nav style={{ 
        flex: 1, 
        padding: isCollapsed ? '16px 8px' : '16px',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {customizedSidebarItems.map((item) => (
            <SidebarItemComponent key={item.id} item={item} />
          ))}
        </div>
      </nav>

      {/* معلومات مصغرة */}
      {!isCollapsed && (
        <div style={{
          padding: '12px 16px',

          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '11px', 
            color: 'hsl(var(--muted))',
            fontWeight: '500'
          }}>
            Manus UI v2.0
          </div>
        </div>
      )}
    </div>
  );
}
