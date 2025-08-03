"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useSidebarPreferences } from "@/contexts/SidebarPreferencesContext";
import { useToast } from "@/hooks/use-toast";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
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

        {/* مفتاح التبديل */}
        <Switch
          checked={!isHidden}
          onCheckedChange={() => onToggleVisibility(id)}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
    </div>
  );
}

export default function SidebarCustomizer() {
  const { darkMode } = useDarkModeContext();
  const { toast } = useToast();
  const { preferences, loading, updatePreferences, resetPreferences } = useSidebarPreferences();
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
          .map((id: string) => defaultSidebarItems.find(item => item.id === id))
          .filter(Boolean);
        
        // إضافة أي عناصر جديدة لم تكن موجودة في الترتيب المحفوظ
        const newItems = defaultSidebarItems.filter(
          item => !preferences.sidebar_order.includes(item.id)
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
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </Button>

          <Button
            onClick={() => {
              if (mounted && !saving) {
                savePreferences().catch((error) => {
                  console.error("Save preferences failed:", error);
                });
              }
            }}
            disabled={saving || !mounted}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {items.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  إجمالي العناصر
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {items.length - hiddenItems.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  العناصر الظاهرة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {hiddenItems.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  العناصر المخفية
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة العناصر القابلة للترتيب */}
      <Card
        className={
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <GripVertical className="w-5 h-5" />
            ترتيب عناصر الشريط الجانبي
          </CardTitle>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            اسحب العناصر لإعادة ترتيبها واستخدم المفتاح لإظهار أو إخفاء العناصر
          </p>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
