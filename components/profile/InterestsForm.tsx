"use client";

import React, { useEffect, useState } from "react";
import { useUserInterests } from "@/hooks/useUserInterests";
import { Check, Heart, Loader2, RefreshCw, X } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  icon: string;
  color: string;
  color_hex?: string;
}

interface InterestsFormProps {
  categories?: Category[];
  maxSelections?: number;
  minSelections?: number;
  onSave?: (categoryIds: string[]) => void;
  className?: string;
}

export default function InterestsForm({
  categories: propCategories,
  maxSelections = 20,
  minSelections = 1,
  onSave,
  className = "",
}: InterestsFormProps) {
  const {
    categoryIds: savedIds,
    isLoading,
    updateInterests,
    isUpdating,
    refetch,
  } = useUserInterests();

  const [categories, setCategories] = useState<Category[]>(propCategories || []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingCategories, setLoadingCategories] = useState(!propCategories);
  const [isDirty, setIsDirty] = useState(false);

  // جلب التصنيفات إذا لم تمرر كـ prop
  useEffect(() => {
    if (!propCategories) {
      fetchCategories();
    }
  }, [propCategories]);

  // تحديث الاختيارات عند تحميل البيانات المحفوظة
  useEffect(() => {
    if (savedIds && savedIds.length > 0) {
      setSelectedIds(new Set(savedIds));
      setIsDirty(false);
    }
  }, [savedIds]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/categories", { cache: "no-store" });
      const data = await response.json();
      
      if (data.success || data.categories) {
        const cats = data.categories || data.data || [];
        setCategories(cats.filter((c: any) => c.is_active));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newSet = new Set(selectedIds);
    
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      if (newSet.size >= maxSelections) {
        return; // تجاوز الحد الأقصى
      }
      newSet.add(categoryId);
    }
    
    setSelectedIds(newSet);
    setIsDirty(true);
  };

  const handleSave = async () => {
    const ids = Array.from(selectedIds);
    
    if (ids.length < minSelections) {
      return; // أقل من الحد الأدنى
    }

    await updateInterests({ categoryIds: ids });
    setIsDirty(false);
    
    if (onSave) {
      onSave(ids);
    }
  };

  const handleReset = () => {
    setSelectedIds(new Set(savedIds));
    setIsDirty(false);
  };

  const handleClear = () => {
    setSelectedIds(new Set());
    setIsDirty(true);
  };

  if (isLoading || loadingCategories) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedCount = selectedIds.size;
  const canSave = isDirty && selectedCount >= minSelections && selectedCount <= maxSelections;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-600" />
            اهتماماتي
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            اختر من {minSelections} إلى {maxSelections} اهتمام
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          
          {isDirty && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              تراجع
            </button>
          )}
        </div>
      </div>

      {/* Selection Counter */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm font-medium">
          {selectedCount} من {categories.length} مختار
        </span>
        
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-red-600 hover:text-red-700"
            >
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((category) => {
          const isSelected = selectedIds.has(category.id);
          const color = category.color_hex || category.color || "#6B7280";
          
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              disabled={!isSelected && selectedCount >= maxSelections}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md scale-[1.02]"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                }
                ${!isSelected && selectedCount >= maxSelections
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:shadow-sm"
                }
              `}
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: isSelected ? color : "transparent",
              }}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Category Content */}
              <div className="text-center">
                <div className="text-2xl mb-2" style={{ color: isSelected ? color : undefined }}>
                  {category.icon || "📌"}
                </div>
                <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                  {category.name_ar || category.name}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Validation Messages */}
      {selectedCount < minSelections && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            يرجى اختيار {minSelections - selectedCount} اهتمام إضافي على الأقل
          </p>
        </div>
      )}

      {selectedCount >= maxSelections && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            وصلت للحد الأقصى من الاهتمامات ({maxSelections})
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/welcome/preferences"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          صفحة الاهتمامات الكاملة ←
        </Link>
        
        <button
          onClick={handleSave}
          disabled={!canSave || isUpdating}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all
            ${canSave && !isUpdating
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {isUpdating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </span>
          ) : (
            "حفظ الاهتمامات"
          )}
        </button>
      </div>
    </div>
  );
}
