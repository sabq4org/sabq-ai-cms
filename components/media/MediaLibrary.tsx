"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Upload,
  Grid3X3,
  List,
  X,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import MediaCard from "./MediaCard";
import MediaEditDrawer from "./MediaEditDrawer";
import MediaFilters from "./MediaFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";

interface MediaItem {
  id: string;
  filename: string;
  title?: string;
  alt?: string;
  description?: string;
  width: number;
  height: number;
  aspectRatio: string;
  sizeBytes: number;
  mimeType: string;
  tags: string[];
  license?: string;
  uploaderId: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  url: string;
  thumbnailUrl?: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

interface MediaLibraryProps {
  onSelect?: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  acceptedTypes?: string[];
  articleContent?: string;
  articleTitle?: string;
}

type ViewMode = "grid" | "list";
type TabType = "all" | "ai";

export default function MediaLibrary({
  onSelect,
  multiple = false,
  acceptedTypes = ["image/"],
  articleContent,
  articleTitle,
}: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: [] as string[],
    ratio: "" as string,
    dateRange: "" as string,
    uploader: "" as string,
    license: "" as string,
  });
  const [pagination, setPagination] = useState({
    cursor: null as string | null,
    hasMore: false,
    total: 0,
  });
  const [pageSize, setPageSize] = useState(24);

  const { toast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 400);

  // جلب الوسائط
  const fetchMedia = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("q", debouncedSearch);
      if (filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append("tags[]", tag));
      }
      if (filters.ratio) params.append("ratio", filters.ratio);
      if (filters.uploader) params.append("uploader", filters.uploader);
      if (filters.license) params.append("license", filters.license);
      if (filters.dateRange) {
        const [from, to] = filters.dateRange.split("-");
        if (from) params.append("from", from);
        if (to) params.append("to", to);
      }
      params.append("limit", pageSize.toString());
      if (!reset && pagination.cursor) {
        params.append("cursor", pagination.cursor);
      }

      const response = await fetch(`/api/media?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("فشل جلب الوسائط");

      const data = await response.json();
      
      if (reset) {
        setItems(data.items);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }
      
      setPagination({
        cursor: data.nextCursor,
        hasMore: data.hasMore,
        total: data.total,
      });
    } catch (error) {
      console.error("خطأ في جلب الوسائط:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الوسائط",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, pageSize, pagination.cursor, toast]);

  // جلب اقتراحات AI
  const fetchAiSuggestions = useCallback(async () => {
    if (!articleContent && !articleTitle) return;
    
    setAiLoading(true);
    try {
      const response = await fetch("/api/media/search-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contentText: `${articleTitle || ""} ${articleContent || ""}`,
          language: "ar",
        }),
      });

      if (!response.ok) throw new Error("فشل جلب الاقتراحات");

      const data = await response.json();
      setAiSuggestions(data.items);
    } catch (error) {
      console.error("خطأ في جلب اقتراحات AI:", error);
    } finally {
      setAiLoading(false);
    }
  }, [articleContent, articleTitle]);

  // تحديث الوسائط عند تغيير الفلاتر
  useEffect(() => {
    fetchMedia(true);
  }, [debouncedSearch, filters, pageSize]);

  // جلب اقتراحات AI عند التحميل
  useEffect(() => {
    if (articleContent || articleTitle) {
      fetchAiSuggestions();
      setActiveTab("ai");
    }
  }, [articleContent, articleTitle]);

  // معالجة التحديد
  const handleSelect = (media: MediaItem) => {
    if (multiple) {
      const newSelection = new Set(selectedItems);
      if (newSelection.has(media.id)) {
        newSelection.delete(media.id);
      } else {
        newSelection.add(media.id);
      }
      setSelectedItems(newSelection);
    } else {
      onSelect?.(media);
    }
  };

  // معالجة التحديد المتعدد
  const handleMultipleSelect = () => {
    const selected = items.filter(item => selectedItems.has(item.id));
    onSelect?.(selected);
  };

  // البيانات المعروضة حسب التبويب
  const displayItems = activeTab === "ai" ? aiSuggestions : items;
  const isLoading = activeTab === "ai" ? aiLoading : loading;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* الهيدر */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="p-4 space-y-4">
          {/* شريط البحث والأدوات */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الوسائط..."
                className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                } transition-colors`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                } transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Upload className="w-5 h-5" />
            </button>
          </div>

          {/* التبويبات */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              جميع الصور ({pagination.total})
            </button>
            {(articleContent || articleTitle) && (
              <button
                onClick={() => setActiveTab("ai")}
                className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "ai"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                اقتراحات AI ({aiSuggestions.length})
              </button>
            )}
          </div>
        </div>

        {/* شريط المعلومات */}
        {selectedItems.size > 0 && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              تم تحديد {selectedItems.size} عنصر
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedItems(new Set())}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                إلغاء التحديد
              </button>
              <button
                onClick={handleMultipleSelect}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                استخدام المحدد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex overflow-hidden">
        {/* الفلاتر الجانبية */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <MediaFilters
                filters={filters}
                onChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* قائمة الوسائط */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">لا توجد وسائط</p>
              {activeTab === "ai" && (
                <p className="text-sm text-gray-400 mt-2">
                  لم يتم العثور على صور مطابقة لمحتوى المقال
                </p>
              )}
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                    : "space-y-4"
                }
              >
                {displayItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    viewMode={viewMode}
                    selected={selectedItems.has(item.id)}
                    onSelect={() => handleSelect(item)}
                    onEdit={() => setEditingMedia(item)}
                  />
                ))}
              </div>

              {/* زر تحميل المزيد */}
              {activeTab === "all" && pagination.hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => fetchMedia(false)}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "تحميل المزيد"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* نافذة تحرير البيانات */}
      {editingMedia && (
        <MediaEditDrawer
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
          onSave={async (updatedMedia) => {
            // تحديث العنصر في القائمة
            setItems(prev =>
              prev.map(item =>
                item.id === updatedMedia.id ? updatedMedia : item
              )
            );
            setAiSuggestions(prev =>
              prev.map(item =>
                item.id === updatedMedia.id ? updatedMedia : item
              )
            );
            setEditingMedia(null);
          }}
        />
      )}
    </div>
  );
}
