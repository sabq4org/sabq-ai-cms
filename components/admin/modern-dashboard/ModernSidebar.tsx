/**
 * الشريط الجانبي الحديث - Manus UI Design
 * Modern Sidebar with Two-Color Theme
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
  ChevronDown,
  ChevronUp,
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

// عناصر الشريط الجانبي الأساسية - محفوظة كما هي
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
      {
        id: "smart-stories",
        title: "القصص الذكية",
        icon: Brain,
        href: "/admin/stories",
      },
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
      {
        id: "media-library",
        title: "مكتبة الوسائط",
        icon: Folder,
        href: "/admin/modern/media",
      },
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
    title: "التحليلات والذكاء",
    icon: BarChart3,
    href: "/admin/modern/analytics",
    children: [
      {
        id: "analytics-main",
        title: "التحليلات الرئيسية",
        icon: BarChart3,
        href: "/admin/modern/analytics",
      },
      {
        id: "ai-analytics",
        title: "تحليلات الذكاء الاصطناعي",
        icon: Brain,
        href: "/admin/ai-analytics",
      },
      {
        id: "sentiment-analysis",
        title: "تحليل المشاعر",
        icon: Heart,
        href: "/admin/sentiment-analysis",
      },
      {
        id: "intelligent-search",
        title: "البحث الذكي",
        icon: Search,
        href: "/admin/intelligent-search",
      },
    ],
  },
  {
    id: "users-management",
    title: "إدارة المستخدمين",
    icon: Users,
    href: "/admin/users",
    children: [
      { id: "users", title: "المستخدمون", icon: Users, href: "/admin/users" },
      { id: "team", title: "الفريق", icon: Users, href: "/admin/team" },
      {
        id: "comments",
        title: "التعليقات",
        icon: MessageSquare,
        href: "/admin/comments",
        badge: "جديد",
      },
    ],
  },
  {
    id: "ai-systems",
    title: "الأنظمة الذكية",
    icon: Brain,
    href: "/admin/ai-systems",
    children: [
      {
        id: "smart-entities",
        title: "الكيانات الذكية",
        icon: Network,
        href: "/admin/smart-entities",
      },
      {
        id: "recommendations",
        title: "نظام التوصيات",
        icon: TrendingUp,
        href: "/admin/recommendations",
      },
      {
        id: "smart-editor",
        title: "المحرر الذكي",
        icon: PenTool,
        href: "/admin/ai-editor",
      },
    ],
  },
  {
    id: "settings",
    title: "الإعدادات",
    icon: Settings,
    href: "/admin/settings",
    children: [
      {
        id: "general-settings",
        title: "الإعدادات العامة",
        icon: Settings,
        href: "/admin/settings",
      },
      {
        id: "appearance",
        title: "المظهر",
        icon: Palette,
        href: "/admin/settings/appearance",
      },
      {
        id: "notifications",
        title: "الإشعارات",
        icon: Bell,
        href: "/admin/notifications",
        badge: "7",
      },
    ],
  },
];

interface ModernSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export default function ModernSidebar({
  isCollapsed = false,
  onToggle,
  isMobile = false,
}: ModernSidebarProps) {
  // استخدام نظام التفضيلات الموجود
  const { sidebarPreferences, updateSidebarPreferences } = useSidebarPreferences();
  const pathname = usePathname();
  
  // حالات العناصر المتوسعة
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState('blue');

  // ثيمات الألوان
  const themes = {
    blue: { accent: '212 90% 50%', name: 'الأزرق' },
    green: { accent: '142 71% 45%', name: 'الأخضر' },
    purple: { accent: '262 83% 58%', name: 'البنفسجي' },
    orange: { accent: '25 95% 53%', name: 'البرتقالي' },
    red: { accent: '0 84% 60%', name: 'الأحمر' },
  };

  // تطبيق الثيم
  const applyTheme = (theme: string) => {
    const themeData = themes[theme as keyof typeof themes];
    if (themeData) {
      document.documentElement.style.setProperty('--accent', themeData.accent);
      setCurrentTheme(theme);
    }
  };

  // العناصر المخصصة حسب التفضيلات
  const customizedSidebarItems = useMemo(() => {
    if (!sidebarPreferences?.items) return sidebarItems;
    
    return sidebarPreferences.items
      .filter(pref => !pref.isHidden)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(pref => sidebarItems.find(item => item.id === pref.id))
      .filter(Boolean) as SidebarItem[];
  }, [sidebarPreferences]);

  // تحميل العناصر المتوسعة المحفوظة
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-expanded-items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setExpandedItems(parsed as string[]);
      }
    } catch {}
  }, []);

  // حفظ العناصر المتوسعة
  useEffect(() => {
    localStorage.setItem('sidebar-expanded-items', JSON.stringify(expandedItems));
  }, [expandedItems]);

  // تبديل حالة توسع العنصر
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // مكون العنصر الفردي
  const SidebarItemComponent = ({ 
    item, 
    level = 0 
  }: { 
    item: SidebarItem; 
    level?: number; 
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const indentStyle = { paddingRight: `${level * 16}px` };

    const itemContent = (
      <div style={{
        ...indentStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: isCollapsed ? '12px' : '12px 16px',
        margin: '4px 0',
        borderRadius: '12px',
        border: isActive ? '1px solid hsl(var(--accent))' : '1px solid transparent',
        background: isActive ? 'hsl(var(--accent) / 0.1)' : 'transparent',
        color: isActive ? 'hsl(var(--accent))' : 'hsl(var(--fg))',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: isActive ? '600' : '500'
      }}
      className="interactive"
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'hsl(var(--line) / 0.5)';
          e.currentTarget.style.borderColor = 'hsl(var(--line))';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }
      }}
      onClick={() => hasChildren && toggleExpanded(item.id)}
    >
      <item.icon style={{ width: '20px', height: '20px', minWidth: '20px' }} />
      
      {!isCollapsed && (
        <>
          <span style={{ flex: 1 }}>{item.title}</span>
          
          {item.badge && (
            <span className="chip" style={{
              background: 'hsl(var(--accent))',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              border: 'none'
            }}>
              {item.badge}
            </span>
          )}
          
          {item.isNew && (
            <span className="chip" style={{
              background: '#10b981',
              color: 'white',
              fontSize: '9px',
              padding: '2px 5px',
              borderRadius: '8px',
              border: 'none'
            }}>
              جديد
            </span>
          )}
          
          {hasChildren && (
            <div style={{ 
              transition: 'transform 0.2s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              <ChevronDown style={{ width: '16px', height: '16px' }} />
            </div>
          )}
        </>
      )}
    </div>
    );

    if (isCollapsed && hasChildren) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {itemContent}
            </TooltipTrigger>
            <TooltipContent side="left" className="font-medium">
              {item.title}
              {item.badge && ` (${item.badge})`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div>
        {hasChildren ? (
          itemContent
        ) : (
          <Link href={item.href}>{itemContent}</Link>
        )}

        {hasChildren && isExpanded && !isCollapsed && (
          <div style={{ marginTop: '8px', marginBottom: '8px' }}>
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
    );
  };

  return (
    <>
      {/* تحميل CSS Manus UI */}
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: isCollapsed ? '80px' : '280px',
        background: 'hsl(var(--bg))',
        borderLeft: '1px solid hsl(var(--line))',
        transition: 'width 0.3s ease',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        
        {/* هيدر الشريط الجانبي */}
        <div style={{
          padding: isCollapsed ? '16px 12px' : '20px 16px',
          borderBottom: '1px solid hsl(var(--line))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}>
          {!isCollapsed && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'hsl(var(--accent))',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  س
                </div>
                <h1 className="heading-3" style={{ margin: 0, fontSize: '18px' }}>
                  الإدارة
                </h1>
              </div>
              <p className="text-xs text-muted">Manus UI</p>
            </div>
          )}
          
          {!isMobile && (
            <button
              onClick={onToggle}
              style={{
                width: '24px',
                height: '24px',
                border: '1px solid hsl(var(--line))',
                borderRadius: '6px',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--accent))';
                e.currentTarget.style.color = 'hsl(var(--accent))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'hsl(var(--line))';
                e.currentTarget.style.color = 'hsl(var(--fg))';
              }}
            >
              {isCollapsed ? 
                <ChevronLeft style={{ width: '14px', height: '14px' }} /> : 
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              }
            </button>
          )}
        </div>

        {/* قائمة التنقل */}
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

        {/* قسم تغيير الثيم - فقط إذا لم يكن مطوياً */}
        {!isCollapsed && (
          <div style={{ 
            padding: '16px',
            borderTop: '1px solid hsl(var(--line))'
          }}>
            <h3 className="heading-3" style={{ 
              fontSize: '12px', 
              marginBottom: '12px',
              color: 'hsl(var(--muted))',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🎨 لون الواجهة
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px',
              marginBottom: '12px'
            }}>
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={currentTheme === key ? 'btn-primary' : 'btn'}
                  onClick={() => applyTheme(key)}
                  style={{ 
                    padding: '6px 8px',
                    fontSize: '10px',
                    borderRadius: '8px'
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-muted" style={{ 
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              💡 تغيير فوري لكامل النظام
            </div>
          </div>
        )}

        {/* معلومات بسيطة */}
        <div style={{
          padding: isCollapsed ? '8px' : '12px 16px',
          borderTop: '1px solid hsl(var(--line))',
          textAlign: 'center'
        }}>
          {!isCollapsed ? (
            <div>
              <div className="text-xs text-muted">Manus UI</div>
            </div>
          ) : (
            <div style={{
              width: '20px',
              height: '20px',
              background: 'hsl(var(--accent) / 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '10px',
              color: 'hsl(var(--accent))'
            }}>
              س
            </div>
          )}
        </div>
      </div>
    </>
  );
}