"use client";

import CategoryEditModal from "@/components/CategoryEditModal";
import { Button } from "@/components/ui/button";
import { TabItem, TabsEnhanced } from "@/components/ui/tabs-enhanced";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { Category } from "@/types/category";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  Hash,
  Info,
  MoreHorizontal,
  Palette,
  PlusCircle,
  RefreshCw,
  Tag,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import "./categories-dashboard.css";

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState("list");
  const { darkMode } = useDarkModeContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setNotification(null);
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        const categoriesData = data.categories || data.data || [];
        setCategories(categoriesData);
      } else {
        // setTimeout(fetchCategories, 3000); // This causes an infinite loop
        setNotification({
          type: "error",
          message: data.error || "فشل في جلب التصنيفات",
        });
      }
    } catch (error) {
      console.error("خطأ في جلب التصنيفات:", error);
      setNotification({
        type: "error",
        message: "حدث خطأ في تحميل التصنيفات",
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSaveCategory = async (formData: any) => {
    try {
      setLoading(true);
      const categoryData = {
        name_ar: formData.name_ar.trim(),
        name_en: formData.name_en.trim() || undefined,
        description: formData.description.trim() || undefined,
        slug: formData.slug.trim(),
        color_hex: formData.color_hex,
        icon: formData.icon,
        parent_id: formData.parent_id,
        position: formData.position,
        is_active: formData.is_active,
        meta_title: formData.meta_title.trim() || undefined,
        meta_description: formData.meta_description.trim() || undefined,
        og_image_url: formData.og_image_url.trim() || undefined,
        canonical_url: formData.canonical_url.trim() || undefined,
        noindex: formData.noindex,
        og_type: formData.og_type.trim() || "website",
        cover_image: formData.cover_image || undefined,
      };
      let response;
      if (showEditModal && selectedCategory) {
        const updateData = { id: selectedCategory.id, ...categoryData };
        response = await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
      } else {
        response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في حفظ التصنيف");
      }
      const result = await response.json();
      if (result.success) {
        const successMessage = showEditModal
          ? "تم تحديث التصنيف بنجاح"
          : "تم إضافة التصنيف بنجاح";
        toast.success(successMessage);
        await fetchCategories();
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedCategory(null);
      } else {
        throw new Error(result.error || "فشل في حفظ التصنيف");
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
      });
      setTimeout(() => setNotification(null), 5000);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      // TODO: إضافة API call لتغيير حالة التصنيف
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, is_active: !cat.is_active }
            : {
                ...cat,
                children: cat.children?.map((child) =>
                  child.id === categoryId
                    ? { ...child, is_active: !child.is_active }
                    : child
                ),
              }
        )
      );
      setNotification({
        type: "success",
        message: "تم تحديث حالة التصنيف بنجاح",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: "error",
        message: "حدث خطأ في تحديث التصنيف",
      });
    }
  };
  const handleDeleteCategory = async (categoryId: string) => {
    const category =
      categories.find((cat) => cat.id === categoryId) ||
      categories.find((cat) =>
        cat.children?.some((child) => child.id === categoryId)
      );
    const articleCount =
      category?.articles_count || category?.article_count || 0;

    // منع حذف التصنيفات التي تحتوي على مقالات
    if (category && articleCount > 0) {
      setNotification({
        type: "warning",
        message: `لا يمكن حذف تصنيف "${
          category.name_ar || category.name
        }" لأنه يحتوي على ${articleCount} مقال. يرجى نقل المقالات أولاً.`,
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // تأكيد الحذف
    const confirmMessage = `هل أنت متأكد من حذف التصنيف "${
      category?.name_ar || category?.name
    }"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);

      // إرسال طلب الحذف إلى API
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // إزالة التصنيف من القائمة المحلية
        setCategories((prev) =>
          prev
            .filter((cat) => cat.id !== categoryId)
            .map((cat) => ({
              ...cat,
              children: cat.children?.filter(
                (child) => child.id !== categoryId
              ),
            }))
        );

        setNotification({
          type: "success",
          message: `تم حذف التصنيف "${
            category?.name_ar || category?.name
          }" بنجاح`,
        });
        setTimeout(() => setNotification(null), 3000);

        // إعادة جلب البيانات لضمان التحديث
        await fetchCategories();
      } else {
        throw new Error(result.error || "فشل في حذف التصنيف");
      }
    } catch (error) {
      console.error("خطأ في حذف التصنيف:", error);
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "حدث خطأ في حذف التصنيف",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // دالة جديدة لحذف التصنيفات الفارغة
  const handleDeleteEmptyCategories = async () => {
    // العثور على التصنيفات الفارغة
    const emptyCategories = categories.filter(
      (cat) => (cat.articles_count || cat.article_count || 0) === 0
    );

    if (emptyCategories.length === 0) {
      setNotification({
        type: "info",
        message: "لا توجد تصنيفات فارغة للحذف",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const confirmMessage = `تم العثور على ${
      emptyCategories.length
    } تصنيف فارغ:\n\n${emptyCategories
      .map((cat) => `• ${cat.name_ar || cat.name}`)
      .join(
        "\n"
      )}\n\nهل تريد حذف جميع التصنيفات الفارغة؟\n\nهذا الإجراء لا يمكن التراجع عنه.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      let deletedCount = 0;
      let failedCount = 0;
      const failedCategories: string[] = [];

      // حذف التصنيفات الفارغة واحداً تلو الآخر
      for (const category of emptyCategories) {
        try {
          const response = await fetch(`/api/categories/${category.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const result = await response.json();

          if (response.ok && result.success) {
            deletedCount++;
          } else {
            failedCount++;
            failedCategories.push(
              category.name_ar || category.name || category.id
            );
          }
        } catch (error) {
          failedCount++;
          failedCategories.push(
            category.name_ar || category.name || category.id
          );
          console.error(
            `فشل في حذف التصنيف ${category.name_ar || category.name}:`,
            error
          );
        }
      }

      // عرض النتائج
      if (deletedCount > 0 && failedCount === 0) {
        setNotification({
          type: "success",
          message: `تم حذف ${deletedCount} تصنيف فارغ بنجاح`,
        });
      } else if (deletedCount > 0 && failedCount > 0) {
        setNotification({
          type: "warning",
          message: `تم حذف ${deletedCount} تصنيف، فشل في حذف ${failedCount} تصنيف: ${failedCategories.join(
            ", "
          )}`,
        });
      } else {
        setNotification({
          type: "error",
          message: `فشل في حذف جميع التصنيفات: ${failedCategories.join(", ")}`,
        });
      }

      setTimeout(() => setNotification(null), 5000);

      // إعادة جلب البيانات لضمان التحديث
      await fetchCategories();
    } catch (error) {
      console.error("خطأ في حذف التصنيفات الفارغة:", error);
      setNotification({
        type: "error",
        message: "حدث خطأ عام في حذف التصنيفات الفارغة",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = [
    { name: "أزرق سماوي", value: "#E5F1FA", textColor: "#1E40AF" },
    { name: "أخضر ناعم", value: "#E3FCEF", textColor: "#065F46" },
    { name: "برتقالي دافئ", value: "#FFF5E5", textColor: "#C2410C" },
    { name: "وردي خفيف", value: "#FDE7F3", textColor: "#BE185D" },
    { name: "بنفسجي فاتح", value: "#F2F6FF", textColor: "#6366F1" },
    { name: "أصفر ذهبي", value: "#FEF3C7", textColor: "#D97706" },
    { name: "أخضر زمردي", value: "#F0FDF4", textColor: "#047857" },
    { name: "أزرق غامق", value: "#EFF6FF", textColor: "#1D4ED8" },
    { name: "بنفسجي وردي", value: "#FAF5FF", textColor: "#7C3AED" },
    { name: "برتقالي فاتح", value: "#FFF7ED", textColor: "#EA580C" },
    { name: "رمادي هادئ", value: "#F9FAFB", textColor: "#374151" },
    { name: "تركوازي ناعم", value: "#F0FDFA", textColor: "#0F766E" },
  ];
  const categoryIcons = [
    "📰",
    "🏛️",
    "💼",
    "⚽",
    "🎭",
    "🎨",
    "🌍",
    "📱",
    "🏥",
    "🚗",
    "✈️",
    "🏠",
    "🎓",
    "💰",
    "⚖️",
    "🔬",
    "🎨",
    "🎵",
    "📺",
    "🍽️",
    "👗",
    "💊",
    "🌱",
    "🔥",
    "💎",
    "⭐",
    "🎯",
    "🚀",
    "🏆",
    "🎪",
    "🌈",
  ];

  const CircularStatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    bgColor,
    iconColor,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
  }) => (
    <div
      className={`stat-card rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p
            className={`text-sm mb-1 transition-colors duration-300 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {value}
            </span>
            <span
              className={`text-sm transition-colors duration-300 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {subtitle}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs: TabItem[] = [
    {
      id: "list",
      name: "قائمة التصنيفات",
      icon: Folder,
      count: categories.filter((cat) => !cat.parent_id).length,
    },
    {
      id: "hierarchy",
      name: "التسلسل الهرمي",
      icon: FolderOpen,
      count: categories.length,
    },
    { id: "analytics", name: "إحصائيات الاستخدام", icon: Tag },
    { id: "settings", name: "إعدادات التصنيفات", icon: Palette },
  ];

  const safeParseDescription = (description: unknown) => {
    if (!description || typeof description !== "string") return "لا يوجد وصف";
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === "object" && parsed.blocks) {
        const textBlock = parsed.blocks.find(
          (block: any) => block.type === "paragraph"
        );
        return textBlock
          ? textBlock.data.text.substring(0, 100) + "..."
          : "وصف غير نصي";
      }
    } catch (e) {
      // Not a JSON, return as is
    }
    return String(description).substring(0, 100) + "...";
  };

  const CategoryTree = ({
    categories,
    level = 0,
  }: {
    categories: Category[];
    level?: number;
  }) => (
    <div className={level > 0 ? "mr-6" : ""}>
      {categories.map((category) => (
        <div key={category.id} className="mb-2">
          <div
            className={`p-4 rounded-xl border transition-colors duration-200 min-w-[600px] ${
              darkMode
                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {category.children && category.children.length > 0 && (
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedCategories);
                      if (expandedCategories.has(category.id)) {
                        newExpanded.delete(category.id);
                      } else {
                        newExpanded.add(category.id);
                      }
                      setExpandedCategories(newExpanded);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* صورة التصنيف إن وجدت */}
                {category.cover_image && category.cover_image.trim() !== "" && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={category.cover_image}
                      alt={category.name_ar || category.name || "صورة التصنيف"}
                      fill
                      className="object-cover"
                      sizes="48px"
                      onError={(e) => {
                        // إخفاء الصورة إذا فشل تحميلها
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: category.color_hex,
                    color:
                      categoryColors.find((c) => c.value === category.color_hex)
                        ?.textColor || "#000",
                  }}
                >
                  {category.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-semibold transition-colors duration-300 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {category.name_ar}
                    </h3>
                    {category.name_en && (
                      <span
                        className={`text-sm transition-colors duration-300 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        ({category.name_en})
                      </span>
                    )}
                    {!category.is_active && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        مخفي
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {safeParseDescription(category.description)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>/{category.slug}</span>
                    <span>
                      {category.articles_count || category.article_count || 0}{" "}
                      مقال
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    router.push(`/dashboard/categories/${category.id}`)
                  }
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    darkMode
                      ? "text-green-400 hover:bg-green-900/20"
                      : "text-green-600 hover:bg-green-50"
                  }`}
                  title="عرض التفاصيل"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("Edit button clicked for category:", category);
                    // التوجيه إلى صفحة التعديل المستقلة
                    router.push(`/dashboard/categories/edit/${category.id}`);
                  }}
                  className={`p-2 rounded-lg transition-colors duration-200 relative z-10 ${
                    darkMode
                      ? "text-blue-400 hover:bg-blue-900/20"
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
                  title="تعديل التصنيف"
                  type="button"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(category.id)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    category.is_active
                      ? darkMode
                        ? "text-yellow-400 hover:bg-yellow-900/20"
                        : "text-yellow-600 hover:bg-yellow-50"
                      : darkMode
                      ? "text-green-400 hover:bg-green-900/20"
                      : "text-green-600 hover:bg-green-50"
                  }`}
                  title={category.is_active ? "إخفاء التصنيف" : "إظهار التصنيف"}
                >
                  {category.is_active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={
                    (category.articles_count || category.article_count || 0) >
                      0 && !category.can_delete
                  }
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    (category.articles_count || category.article_count || 0) >
                      0 && !category.can_delete
                      ? darkMode
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-400 cursor-not-allowed"
                      : darkMode
                      ? "text-red-400 hover:bg-red-900/20"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                  title={
                    (category.articles_count || category.article_count || 0) >
                      0 && !category.can_delete
                      ? "لا يمكن حذف تصنيف يحتوي على مقالات"
                      : "حذف التصنيف"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    darkMode
                      ? "text-gray-400 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* التصنيفات الفرعية */}
          {category.children &&
            category.children.length > 0 &&
            expandedCategories.has(category.id) && (
              <div className="mt-2">
                <CategoryTree
                  categories={category.children}
                  level={level + 1}
                />
              </div>
            )}
        </div>
      ))}
    </div>
  );

  const NotificationComponent = () => {
    if (!notification) return null;
    const getNotificationIcon = () => {
      switch (notification.type) {
        case "success":
          return <CheckCircle className="w-5 h-5" />;
        case "error":
          return <XCircle className="w-5 h-5" />;
        case "warning":
          return <AlertTriangle className="w-5 h-5" />;
        case "info":
          return <Info className="w-5 h-5" />;
        default:
          return <Info className="w-5 h-5" />;
      }
    };
    const getNotificationColor = () => {
      switch (notification.type) {
        case "success":
          return "bg-green-100 text-green-800 border-green-200";
        case "error":
          return "bg-red-100 text-red-800 border-red-200";
        case "warning":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "info":
          return "bg-blue-100 text-blue-800 border-blue-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };
    return (
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${getNotificationColor()}`}
        >
          {getNotificationIcon()}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };
  const handleExport = () => {
    window.location.href = "/api/categories/export";
  };
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/categories/import", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(
          `${result.message} (الجديدة: ${result.created}, المحدثة: ${result.updated})`
        );
        // إعادة تحميل البيانات
        await fetchCategories();
      } else {
        toast.error(`فشل الاستيراد: ${result.error}`);
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع أثناء استيراد الملف.");
    }
  };
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">جارٍ تحميل التصنيفات...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dashboard-categories-container transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : ""
      }`}
    >
      {/* عنوان وتعريف الصفحة */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            إدارة التصنيفات
          </h1>
          <p
            className={`transition-colors duration-300 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            تنظيم وإدارة تصنيفات الأخبار بنظام هرمي ذكي مع دعم SEO متقدم
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="ml-2 h-4 w-4" />
            استيراد
          </Button>
          <Button
            onClick={handleDeleteEmptyCategories}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف التصنيفات الفارغة
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImport}
            accept=".json"
          />
          <Button onClick={() => setShowAddModal(true)}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة تصنيف جديد
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <CircularStatsCard
          title="إجمالي التصنيفات"
          value={categories.length.toString()}
          subtitle="تصنيف"
          icon={Tag}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <CircularStatsCard
          title="التصنيفات النشطة"
          value={categories.filter((cat) => cat.is_active).length.toString()}
          subtitle="نشط"
          icon={FolderOpen}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <CircularStatsCard
          title="التصنيفات الفرعية"
          value={categories.filter((cat) => cat.parent_id).length.toString()}
          subtitle="فرعي"
          icon={Folder}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <CircularStatsCard
          title="إجمالي المقالات"
          value={categories
            .reduce(
              (sum, cat) =>
                sum + (cat.articles_count || cat.article_count || 0),
              0
            )
            .toString()}
          subtitle="مقال"
          icon={Hash}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      <div className="tabs-container">
        <TabsEnhanced
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div
        className={`categories-table rounded-2xl shadow-sm border overflow-x-auto transition-colors duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
      >
        {activeTab === "list" && (
          <div className="p-6">
            <h3
              className={`text-lg font-bold mb-6 transition-colors duration-300 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              🗂️ قائمة التصنيفات
            </h3>
            <CategoryTree categories={categories} />
          </div>
        )}
        {/* ... other tabs */}
      </div>

      {(showAddModal || showEditModal) && (
        <CategoryEditModal
          isOpen={showAddModal || showEditModal}
          initialData={showEditModal ? selectedCategory : null}
          darkMode={darkMode}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSave={handleSaveCategory}
          loading={loading}
        />
      )}

      <NotificationComponent />
    </div>
  );
}
