"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useSidebarPreferences } from "@/contexts/SidebarPreferencesContext";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  Bell,
  Brain,
  Eye,
  EyeOff,
  Folder,
  Globe,
  GripVertical,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Palette,
  RotateCcw,
  Save,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// تعريف أيقونات العناصر
const iconMap = {
  dashboard: LayoutDashboard,
  "news-management": Newspaper,
  analytics: BarChart3,
  "ai-systems": Brain,
  "content-management": Newspaper,
  "muqtarab-module": Zap,
  "audio-systems": Globe,
  "loyalty-program": Heart,
  notifications: Bell,
  performance: Zap,
  themes: Palette,
  "external-data": Globe,
  users: Users,
  media: Folder,
  comments: MessageSquare,
  settings: Settings,
};

// تعريف عناصر الشريط الجانبي
const defaultSidebarItems = [
  { id: "dashboard", title: "لوحة التحكم", icon: "dashboard" },
  { id: "news-management", title: "إدارة الأخبار", icon: "news-management" },
  { id: "analytics", title: "التحليلات المتقدمة", icon: "analytics" },
  { id: "ai-systems", title: "الأنظمة الذكية", icon: "ai-systems" },
  {
    id: "content-management",
    title: "إدارة المحتوى",
    icon: "content-management",
  },
  { id: "muqtarab-module", title: "وحدة مُقترَب", icon: "muqtarab-module" },
  { id: "audio-systems", title: "النظم الصوتية", icon: "audio-systems" },
  { id: "loyalty-program", title: "برنامج الولاء", icon: "loyalty-program" },
  { id: "notifications", title: "إدارة التنبيهات", icon: "notifications" },
  { id: "performance", title: "تحسين الأداء", icon: "performance" },
  { id: "themes", title: "السمات التكيفية", icon: "themes" },
  { id: "external-data", title: "البيانات الخارجية", icon: "external-data" },
  { id: "users", title: "المستخدمين", icon: "users" },
  { id: "media", title: "مكتبة الوسائط", icon: "media" },
  { id: "comments", title: "التعليقات", icon: "comments" },
  { id: "settings", title: "الإعدادات", icon: "settings" },
];

interface SortableItemProps {
  id: string;
  title: string;
  icon: string;
  isHidden: boolean;
  onToggleVisibility: (id: string) => void;
  darkMode: boolean;
}

function SortableItem({
  id,
  title,
  icon,
  isHidden,
  onToggleVisibility,
  darkMode,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = iconMap[icon as keyof typeof iconMap] || Settings;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
        darkMode
          ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
          : "bg-white border-gray-200 hover:bg-gray-50"
      } ${isHidden ? "opacity-50" : ""}`}
    >
      {/* مقبض السحب */}
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* الأيقونة */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          darkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </div>

      {/* العنوان */}
      <div className="flex-1">
        <h3
          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h3>
      </div>

      {/* حالة الرؤية */}
      <div className="flex items-center gap-2">
        {isHidden ? (
          <Badge variant="secondary" className="text-xs">
            <EyeOff className="w-3 h-3 ml-1" />
            مخفي
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            <Eye className="w-3 h-3 ml-1" />
            ظاهر
          </Badge>
        )}

        {/* مفتاح التبديل بنمط iOS - مطابق لصفحة الأخبار */}
        <div
          onClick={() => onToggleVisibility(id)}
          style={{
            position: 'relative',
            width: '38px',
            height: '22px',
            background: !isHidden ? 'hsl(var(--accent))' : '#E5E5EA',
            borderRadius: '11px',
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            display: 'inline-block'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: !isHidden ? '18px' : '2px',
              width: '18px',
              height: '18px',
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'left 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SidebarCustomizer() {
  const { darkMode } = useDarkModeContext();
  const { toast } = useToast();
  const { preferences, loading, updatePreferences, resetPreferences } =
    useSidebarPreferences();
  const [items, setItems] = useState(defaultSidebarItems);
  const [hiddenItems, setHiddenItems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const toggleItemVisibility = useCallback((itemId: string) => {
    setHiddenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const savePreferences = useCallback(async () => {
    if (!mounted) {
      console.warn("Component not mounted yet, skipping save");
      return;
    }

    setSaving(true);
    try {
      await updatePreferences({
        sidebar_order: items.map((item) => item.id),
        sidebar_hidden: hiddenItems,
      });

      toast({
        title: "نجح الحفظ",
        description: "تم حفظ تفضيلات الشريط الجانبي بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حفظ التفضيلات:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ التفضيلات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [mounted, items, hiddenItems, updatePreferences, toast]);

  const resetToDefault = useCallback(async () => {
    try {
      await resetPreferences();
      setItems(defaultSidebarItems);
      setHiddenItems([]);
      toast({
        title: "تم إعادة التعيين",
        description: "تم إعادة تعيين الشريط الجانبي للوضع الافتراضي",
      });
    } catch (error) {
      console.error("خطأ في إعادة التعيين:", error);
      toast({
        title: "خطأ",
        description: "فشل في إعادة التعيين",
        variant: "destructive",
      });
    }
  }, [resetPreferences, toast]);

  // تحميل التفضيلات عند بدء التشغيل
  useEffect(() => {
    setMounted(true);
  }, []);

  // تحديث العناصر المحلية عند تغيير التفضيلات
  useEffect(() => {
    if (!loading && preferences) {
      // ترتيب العناصر حسب التفضيلات المحفوظة
      if (preferences.sidebar_order && preferences.sidebar_order.length > 0) {
        const orderedItems = preferences.sidebar_order
          .map((id: string) =>
            defaultSidebarItems.find((item) => item.id === id)
          )
          .filter(Boolean);

        // إضافة أي عناصر جديدة لم تكن موجودة في الترتيب المحفوظ
        const newItems = defaultSidebarItems.filter(
          (item) => !preferences.sidebar_order.includes(item.id)
        );

        setItems([...orderedItems, ...newItems]);
      }

      setHiddenItems(preferences.sidebar_hidden || []);
    }
  }, [preferences, loading]);

  // منع عرض المكون في الخادم لتجنب مشاكل SSR مع @dnd-kit
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="mr-3 text-gray-600 dark:text-gray-300">
          جاري التحميل...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            تخصيص الشريط الجانبي
          </h1>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            قم بترتيب وإخفاء عناصر الشريط الجانبي حسب تفضيلك
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={resetToDefault}
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button>

          <button
            onClick={() => {
              if (mounted && !saving) {
                savePreferences().catch((error) => {
                  console.error("Save preferences failed:", error);
                });
              }
            }}
            disabled={saving || !mounted}
            className={`btn flex items-center gap-2 ${saving || !mounted ? "opacity-50" : ""}`}
            style={{ 
              backgroundColor: 'hsl(var(--accent))',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              if (!saving && mounted) e.currentTarget.style.backgroundColor = 'hsl(var(--accent-hover))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
            }}
          >
            <Save className="w-4 h-4" />
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      <Separator />

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent) / 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--accent))'
            }}>
              <LayoutDashboard style={{ width: '24px', height: '24px' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>إجمالي العناصر</div>
              <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                {items.length}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent) / 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--accent))'
            }}>
              <Eye style={{ width: '24px', height: '24px' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>العناصر الظاهرة</div>
              <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                {items.length - hiddenItems.length}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent) / 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--accent))'
            }}>
              <EyeOff style={{ width: '24px', height: '24px' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>العناصر المخفية</div>
              <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                {hiddenItems.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة العناصر القابلة للترتيب */}
      <div className="card">
        <div className="card-header">
          <div className="card-title flex items-center gap-2">
            <GripVertical className="w-5 h-5" />
            ترتيب عناصر الشريط الجانبي
          </div>
          <p 
            className="text-sm mt-2"
            style={{ color: 'hsl(var(--text-muted))' }}
          >
            اسحب العناصر لإعادة ترتيبها واستخدم المفتاح لإظهار أو إخفاء العناصر
          </p>
        </div>
        <div 
          className="p-6"
          style={{ 
            backgroundColor: 'hsl(var(--card-bg))',
            borderTop: '1px solid hsl(var(--border))'
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    icon={item.icon}
                    isHidden={hiddenItems.includes(item.id)}
                    onToggleVisibility={toggleItemVisibility}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
