"use client";

import React, { useState } from "react";
import { X, Calendar, User, Tag, FileImage, Shield } from "lucide-react";

interface FiltersState {
  tags: string[];
  ratio: string;
  dateRange: string;
  uploader: string;
  license: string;
}

interface MediaFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onClose: () => void;
}

export default function MediaFilters({
  filters,
  onChange,
  onClose,
}: MediaFiltersProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!filters.tags.includes(tagInput.trim())) {
        onChange({
          ...filters,
          tags: [...filters.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange({
      ...filters,
      tags: filters.tags.filter((t) => t !== tag),
    });
  };

  const handleDateRangeChange = (type: "today" | "week" | "month" | "custom", customRange?: string) => {
    let dateRange = "";
    const now = new Date();
    
    if (type === "today") {
      const today = now.toISOString().split("T")[0];
      dateRange = `${today}-${today}`;
    } else if (type === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateRange = `${weekAgo.toISOString().split("T")[0]}-${now.toISOString().split("T")[0]}`;
    } else if (type === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateRange = `${monthAgo.toISOString().split("T")[0]}-${now.toISOString().split("T")[0]}`;
    } else if (type === "custom" && customRange) {
      dateRange = customRange;
    }
    
    onChange({ ...filters, dateRange });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800">
      {/* رأس الفلاتر */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          الفلاتر المتقدمة
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* محتوى الفلاتر */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* فلتر نسبة العرض/الارتفاع */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <FileImage className="w-4 h-4" />
            نسبة العرض/الارتفاع
          </label>
          <div className="space-y-2">
            {[
              { value: "", label: "جميع النسب" },
              { value: "3:4", label: "3:4 (عمودي)" },
              { value: "4:3", label: "4:3 (أفقي)" },
              { value: "16:9", label: "16:9 (عريض)" },
              { value: "1:1", label: "1:1 (مربع)" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="ratio"
                  value={option.value}
                  checked={filters.ratio === option.value}
                  onChange={(e) =>
                    onChange({ ...filters, ratio: e.target.value })
                  }
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* فلتر التاريخ */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Calendar className="w-4 h-4" />
            تاريخ الرفع
          </label>
          <div className="space-y-2">
            <button
              onClick={() => handleDateRangeChange("today")}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.dateRange.includes(new Date().toISOString().split("T")[0])
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => handleDateRangeChange("week")}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.dateRange.includes("7")
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => handleDateRangeChange("month")}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.dateRange.includes("30")
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              آخر 30 يوم
            </button>
          </div>
        </div>

        {/* فلتر الوسوم */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Tag className="w-4 h-4" />
            الوسوم
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="أضف وسم واضغط Enter"
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-lg"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* فلتر الترخيص */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Shield className="w-4 h-4" />
            نوع الترخيص
          </label>
          <select
            value={filters.license}
            onChange={(e) => onChange({ ...filters, license: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع التراخيص</option>
            <option value="all_rights">جميع الحقوق محفوظة</option>
            <option value="editorial">للاستخدام التحريري</option>
            <option value="royalty_free">بدون حقوق ملكية</option>
            <option value="public_domain">ملك عام</option>
          </select>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={() =>
            onChange({
              tags: [],
              ratio: "",
              dateRange: "",
              uploader: "",
              license: "",
            })
          }
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          إعادة تعيين الفلاتر
        </button>
      </div>
    </div>
  );
}
