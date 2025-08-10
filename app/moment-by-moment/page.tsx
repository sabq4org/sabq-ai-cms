"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { BadgeCheck, Flame, Newspaper, PenLine, Brain, Target, Clock } from "lucide-react";

type TimelineItem = {
  id: string;
  type: "news" | "article" | "angle-article" | "category" | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  breaking?: boolean;
  category?: { id: string; name: string; slug: string; color?: string | null } | null;
  angle?: { title?: string | null; slug?: string | null; themeColor?: string | null; icon?: string | null } | null;
  timestamp: string | Date;
  tag?: string | null;
  label?: string | null;
  color?: string | null;
};

const TYPE_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; emoji: string }
> = {
  news: {
    label: "أخبار",
    color: "#2563EB",
    icon: <Newspaper className="w-4 h-4" />,
    emoji: "📰",
  },
  article: {
    label: "مقال",
    color: "#8B5CF6",
    icon: <PenLine className="w-4 h-4" />,
    emoji: "✍",
  },
  analysis: {
    label: "تحليل",
    color: "#10B981",
    icon: <Brain className="w-4 h-4" />,
    emoji: "🧠",
  },
  "angle-article": {
    label: "مُقترب",
    color: "#8B5CF6",
    icon: <Target className="w-4 h-4" />,
    emoji: "🎯",
  },
  category: {
    label: "تحديث",
    color: "#64748B",
    icon: <BadgeCheck className="w-4 h-4" />,
    emoji: "✔",
  },
};

function formatRelative(ts: string | Date) {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec} ثوانٍ`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ساعة`;
  const day = Math.floor(hr / 24);
  return `${day} يوم`;
}

export default function MomentByMomentPage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { ref: loadMoreRef, inView } = useInView({ rootMargin: "400px" });

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/moment-by-moment/count", { cache: "no-store" });
        const json = await res.json();
        if (typeof json?.count === "number") setCount(json.count);
      } catch {}
    };
    fetchCount();
  }, []);

  const fetchPage = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timeline?page=${p}&limit=20`, { cache: "no-store" });
      const json = await res.json();
      if (json?.success) {
        const nextItems: TimelineItem[] = (json.items || []).map((it: any) => ({
          ...it,
          timestamp: it.timestamp,
        }));
        setItems((prev) => (p === 1 ? nextItems : [...prev, ...nextItems]));
        setHasMore(Boolean(json?.pagination?.hasMore));
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const next = page + 1;
      setPage(next);
      fetchPage(next);
    }
  }, [inView]);

  const timelineColor = useMemo(() => "from-blue-500 via-indigo-500 to-purple-500", []);

  const renderLabel = (item: TimelineItem) => {
    const meta = TYPE_META[item.type] || TYPE_META["article"];
    const bg = item.color || meta.color;
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-white"
        style={{ backgroundColor: bg }}
      >
        {meta.icon}
        <span>{item.label || meta.label}</span>
      </span>
    );
  };

  const renderIcon = (item: TimelineItem) => {
    const meta = TYPE_META[item.type] || TYPE_META["article"];
    if (item.breaking) return <Flame className="w-4 h-4 text-red-500" />;
    return <span className="text-lg" aria-hidden>{meta.emoji}</span>;
  };

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-20 pb-16">
      <DesignComponents.ContentContainer size="fluid" className="">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">لحظة بلحظة</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">تدفق زمني للأحداث والمحتوى عبر أقسام المنصة</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            {count !== null ? <span>آخر ساعة: {count} حدث</span> : <span>جاري التحديث...</span>}
          </div>
        </div>

        {/* غلاف التايم لاين: سطر عمودي ثابت على يمين الصفوف */}
        <div className="relative">
          <div className={`hidden lg:block absolute top-0 bottom-0 right-3 w-1 bg-gradient-to-b ${timelineColor} rounded-full opacity-70"`} />

          <div className="space-y-6">
            {items.map((item, idx) => {
              const active = activeId === item.id;
              return (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* عمود البطاقات (2/3) */}
                  <div className="lg:col-span-9">
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.35, delay: Math.min(idx * 0.02, 0.2) }}
                      onMouseEnter={() => setActiveId(item.id)}
                      onMouseLeave={() => setActiveId((prev) => (prev === item.id ? null : prev))}
                      className="relative"
                    >
                      {/* خط توصيل من يمين البطاقة إلى العقدة */}
                      <span
                        className={`hidden lg:block absolute -right-10 top-8 h-px w-10 transition-colors ${
                          active ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                        aria-hidden
                      />

                      <DesignComponents.StandardCard
                        className={`p-4 md:p-5 hover:shadow-lg transition-all ${
                          active ? "ring-2 ring-blue-500/40" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* صورة/أيقونة */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <div className="relative w-20 h-20 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                {renderIcon(item)}
                              </div>
                            )}
                          </div>

                          {/* محتوى */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {renderLabel(item)}
                              {item.breaking && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                                  <Flame className="w-3 h-3" /> عاجل
                                </span>
                              )}
                            </div>

                            <Link href={resolveItemHref(item)} className="block group">
                              <h3 className="text-lg font-bold group-hover:text-blue-600 line-clamp-2">
                                {item.title}
                              </h3>
                            </Link>
                            {item.excerpt && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                {item.excerpt}
                              </p>
                            )}

                            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                              {item.category?.name && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border"
                                  style={{
                                    borderColor: item.category?.color || "#CBD5E1",
                                    color: item.category?.color || undefined,
                                  }}
                                >
                                  {item.category?.name}
                                </span>
                              )}
                              <span>{formatRelative(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </DesignComponents.StandardCard>
                    </motion.div>
                  </div>

                  {/* عمود الخط الزمني (1/3) - يمين */}
                  <div className="lg:col-span-3 relative">
                    {/* خط عمودي خاص بالصف على الشاشات الصغيرة */}
                    <div className={`lg:hidden absolute top-0 bottom-0 right-3 w-1 bg-gradient-to-b ${timelineColor} rounded-full opacity-70`} />

                    {/* عقدة التايم لاين */}
                    <div className="relative h-full">
                      <div className="absolute top-8 right-3 -translate-y-1/2">
                        {/* الدائرة */}
                        <button
                          onMouseEnter={() => setActiveId(item.id)}
                          onMouseLeave={() => setActiveId((prev) => (prev === item.id ? null : prev))}
                          className={`w-4 h-4 rounded-full ring-4 transition-all ${
                            active
                              ? "bg-blue-600 ring-blue-200"
                              : "bg-white dark:bg-gray-900 ring-gray-200 dark:ring-gray-700"
                          }`}
                          aria-label="timeline-node"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* محمل لا نهائي */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 text-center text-sm text-gray-500">
                {loading ? "...جارٍ التحميل" : "تحميل المزيد"}
              </div>
            )}
          </div>
        </div>
      </DesignComponents.ContentContainer>
    </main>
  );
}

function resolveItemHref(item: TimelineItem) {
  if (item.type === "news" || item.type === "article") {
    return `/news/${item.slug}`;
  }
  if (item.type === "angle-article") {
    // صفحة مقالة مقترب إن توفرت، وإلا صفحة الزاوية
    return item.angle?.slug ? `/muqtarab/${item.angle.slug}` : "/muqtarab";
  }
  if (item.type === "category" && item.category?.slug) {
    return `/category/${item.category.slug}`;
  }
  return "#";
}

// إزالة توجيه use client المكرر ونقل الواردات الإضافية إلى الأعلى إن لزم
/*
import Footer from "@/components/Footer";
import { getArticleLink } from "@/lib/utils";
import "@/styles/moment-by-moment.css";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Eye,
  FileText,
  FolderOpen,
  Grid3X3,
  Hash,
  List,
  Loader2,
  Newspaper,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TimelineItem {
  id: string;
  type: "news" | "article" | "category" | "angle-article";
  title: string;
  slug?: string;
  excerpt?: string | null;
  image?: string | null;
  is_breaking?: boolean;
  breaking?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  angle?: {
    title: string;
    slug: string;
    themeColor?: string;
    icon?: string;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
  timestamp: string;
  tag: string;
  label: string;
  color: string;
  categoryData?: {
    color: string | null;
    icon: string | null;
  };
}

export default function MomentByMomentPage() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "news" | "articles" | "categories" | "breaking" | "angles"
  >("all");

  const ITEMS_PER_PAGE = 20;

  // Ensure component is mounted before showing dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch timeline items
  const fetchTimeline = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      const response = await fetch(`/api/timeline?${params}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "فشل في جلب البيانات");
      }

      const data = await response.json();

      // التحقق من نجاح الاستجابة
      if (!data.success) {
        throw new Error(data.error || "فشل في جلب بيانات الخط الزمني");
      }

      if (reset) {
        setTimelineItems(data.items || []);
        setPage(1);
      } else {
        setTimelineItems((prev) => [...prev, ...(data.items || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل الخط الزمني"
      );

      // في حالة الخطأ، تعيين بيانات فارغة
      if (reset) {
        setTimelineItems([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline(true);
  }, []);

  // Auto-refresh for live updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        fetchTimeline(true);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchTimeline(false);
    }
  };

  // Filter timeline items
  const filteredItems = timelineItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "news") return item.type === "news";
    if (filter === "articles") return item.type === "article";
    if (filter === "categories") return item.type === "category";
    if (filter === "angles") return item.type === "angle-article";
    if (filter === "breaking") return item.is_breaking || item.breaking;
    return true;
  });

  // Get icon for timeline item
  const getItemIcon = (type: string) => {
    switch (type) {
      case "news":
        return <Newspaper className="w-5 h-5" />;
      case "article":
        return <FileText className="w-5 h-5" />;
      case "category":
        return <FolderOpen className="w-5 h-5" />;
      case "angle-article":
        return <Eye className="w-5 h-5" />;
      default:
        return <Hash className="w-5 h-5" />;
    }
  };

  // Get color classes for timeline item - تحديث الألوان حسب نوع المحتوى
  const getItemColorClasses = (color: string, isBreaking?: boolean) => {
    // إذا كان الخبر عاجل، استخدم اللون الأحمر دائماً
    if (isBreaking) {
      return {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-500",
        text: "text-red-700 dark:text-red-300",
        badge: "bg-red-500",
      };
    }

    // ألوان عادية حسب نوع المحتوى - ألوان مخففة لراحة العين
    switch (color) {
      case "green": // خبر جديد (أزرق مخفف)
        return {
          bg: "bg-blue-25 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30",
          border: "border-blue-500",
          text: "text-blue-700 dark:text-blue-300",
          badge: "bg-blue-500",
        };
      case "orange":
        return {
          bg: "bg-orange-25 dark:bg-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/30",
          border: "border-orange-500",
          text: "text-orange-700 dark:text-orange-300",
          badge: "bg-orange-500",
        };
      case "blue": // تصنيف جديد (أخضر مخفف)
        return {
          bg: "bg-green-25 dark:bg-green-900/20 hover:bg-green-50 dark:hover:bg-green-900/30",
          border: "border-green-500",
          text: "text-green-700 dark:text-green-300",
          badge: "bg-green-500",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700",
          border: "border-gray-400",
          text: "text-gray-700 dark:text-gray-300",
          badge: "bg-gray-500",
        };
    }
  };

  return (
    <>
      <div
        className="moment-by-moment-container min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-x-hidden pull-to-refresh"
        suppressHydrationWarning
      >
        {/* Hero Section */}
        <section className="moment-hero-section relative py-12 md:py-16 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-red-200/30 dark:bg-red-900/20" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-orange-200/30 dark:bg-orange-900/20" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-2xl animate-pulse">
                <Radio className="w-10 h-10 text-white" />
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
                suppressHydrationWarning
              >
                لحظة بلحظة
              </h1>

              <p
                className="text-xl text-gray-600 dark:text-gray-300 mb-2"
                suppressHydrationWarning
              >
                تابع جميع الأحداث والتحديثات في مكان واحد
              </p>

              {mounted && !loading && filteredItems.length > 0 && (
                <p
                  className="text-sm text-gray-500 dark:text-gray-400"
                  suppressHydrationWarning
                >
                  {filteredItems.length} حدث
                </p>
              )}

              {/* Live Indicator */}
              {mounted && (
                <div className="mt-4 inline-flex items-center gap-2 live-indicator">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    متابعة مباشرة
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Controls Bar */}
        <div
          className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 touch-pan-y"
          suppressHydrationWarning
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
              <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
                {/* Live Toggle */}
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isLive
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isLive
                      ? "التحديث التلقائي مفعّل"
                      : "التحديث التلقائي معطّل"}
                  </span>
                  <span className="sm:hidden">
                    {isLive ? "مفعّل" : "معطّل"}
                  </span>
                </button>

                {/* Filter Buttons */}
                <div className="filters-mobile flex items-center gap-1 md:gap-2 overflow-x-auto">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-2 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === "all"
                        ? "bg-gray-800 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilter("news")}
                    className={`px-2 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === "news"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    أخبار
                  </button>
                  <button
                    onClick={() => setFilter("articles")}
                    className={`px-2 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === "articles"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    مقالات
                  </button>
                  <button
                    onClick={() => setFilter("categories")}
                    className={`px-2 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === "categories"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    تصنيفات
                  </button>
                  <button
                    onClick={() => setFilter("angles")}
                    className={`px-2 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === "angles"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    مُقترب
                  </button>
                  <button
                    onClick={() => setFilter("breaking")}
                    className={`px-2 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === "breaking"
                        ? "bg-red-600 text-white shadow-md animate-pulse"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    🔴 عاجل
                  </button>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "timeline"
                      ? "bg-gray-800 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                  title="عرض خط زمني"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-gray-800 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                  title="عرض شبكي"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && page === 1 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-red-600 dark:text-red-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                جاري تحميل الخط الزمني...
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            // Empty State
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Radio className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                لا توجد أحداث
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {error
                  ? "حدث خطأ في تحميل البيانات"
                  : "لا توجد أحداث مطابقة للفلتر المحدد"}
              </p>
              {error && (
                <button
                  onClick={() => fetchTimeline(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  إعادة المحاولة
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Timeline/Grid View */}
              {viewMode === "timeline" ? (
                // Timeline View
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block" />

                  <div className="space-y-6">
                    {filteredItems.map((item, index) => {
                      const isBreaking =
                        item.is_breaking || item.breaking || false;
                      const colors = getItemColorClasses(
                        item.color,
                        isBreaking
                      );
                      const timeAgo = formatDistanceToNow(
                        new Date(item.timestamp),
                        {
                          locale: ar,
                          addSuffix: true,
                        }
                      );

                      return (
                        <div
                          key={item.id}
                          className="relative flex items-start gap-4"
                        >
                          {/* Timeline Dot */}
                          <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 z-10">
                            <div
                              className={`w-6 h-6 rounded-full ${
                                colors.badge
                              } ${isBreaking ? "animate-pulse" : ""}`}
                            />
                          </div>

                          {/* Content Card */}
                          <div className="flex-1 bg-white shadow-sm hover:shadow-md transition-all rounded-xl p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                            {/* Header: التصنيف والوقت */}
                            <div className="flex items-center justify-between mb-3">
                              {/* التصنيف الملون + النص المرافق */}
                              <div className="flex items-center gap-2">
                                {isBreaking ? (
                                  <span className="text-sm font-medium px-2 py-1 rounded bg-red-600 text-white">
                                    عاجل
                                  </span>
                                ) : (
                                  (() => {
                                    const isOpinion =
                                      item.type === "article" &&
                                      ((item.category?.slug || "").includes(
                                        "opinion"
                                      ) ||
                                        (item.category?.name || "").includes(
                                          "رأي"
                                        ));
                                    const pillText =
                                      item.type === "angle-article"
                                        ? item.angle?.title ||
                                          item.label ||
                                          "مُقترب"
                                        : item.category?.name || item.label;
                                    const pillColor =
                                      item.type === "angle-article"
                                        ? item.angle?.themeColor ||
                                          item.color ||
                                          undefined
                                        : item.category?.color ||
                                          item.color ||
                                          undefined;
                                    let extra: string | null = null;
                                    if (item.type === "news") extra = "خبر";
                                    else if (item.type === "angle-article")
                                      extra = "مقترب";
                                    else if (isOpinion) extra = "رأي";

                                    // شارة خفيفة ومعتمدة أسلوبياً
                                    return (
                                      <>
                                        <span
                                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border"
                                          style={{
                                            backgroundColor: pillColor
                                              ? `color-mix(in oklab, ${pillColor} 14%, transparent)`
                                              : "rgba(59, 130, 246, 0.08)",
                                            color: pillColor
                                              ? `color-mix(in oklab, ${pillColor} 75%, currentColor)`
                                              : "rgba(59, 130, 246, 0.75)",
                                            borderColor: pillColor
                                              ? `color-mix(in oklab, ${pillColor} 28%, transparent)`
                                              : "rgba(59, 130, 246, 0.25)",
                                          }}
                                        >
                                          {pillText}
                                        </span>
                                        {extra && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {extra}
                                          </span>
                                        )}
                                      </>
                                    );
                                  })()
                                )}
                              </div>

                              {/* الوقت في اليمين */}
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {timeAgo}
                              </span>
                            </div>

                            {/* العنوان */}
                            {(item.type === "news" ||
                              item.type === "article") &&
                            item.slug ? (
                              <Link href={getArticleLink(item)}>
                                <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mb-3 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors line-clamp-2">
                                  {item.title}
                                </h3>
                              </Link>
                            ) : item.type === "angle-article" &&
                              item.angle &&
                              item.slug ? (
                              <Link href={`/muqtarab/${item.slug}`}>
                                <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors line-clamp-2">
                                  {item.title}
                                </h3>
                              </Link>
                            ) : item.type === "category" && item.slug ? (
                              <Link href={`/categories/${item.slug}`}>
                                <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mb-3 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors line-clamp-2">
                                  {item.title}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                {item.title}
                              </h3>
                            )}

                            {/* الملخص */}
                            {item.excerpt && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-4 line-clamp-3">
                                {item.excerpt}
                              </p>
                            )}

                            {/* زر اقرأ المزيد */}
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                {item.author && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.author.name}
                                  </span>
                                )}
                              </div>

                              {(item.type === "news" ||
                                item.type === "article") &&
                                item.slug && (
                                  <Link href={getArticleLink(item)}>
                                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ml-auto">
                                      اقرأ المزيد →
                                    </button>
                                  </Link>
                                )}

                              {item.type === "angle-article" &&
                                item.angle &&
                                item.slug && (
                                  <Link href={`/muqtarab/${item.slug}`}>
                                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium px-3 py-1 rounded-lg transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ml-auto">
                                      قراءة في مُقترب →
                                    </button>
                                  </Link>
                                )}

                              {item.type === "category" && item.slug && (
                                <Link href={`/categories/${item.slug}`}>
                                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ml-auto">
                                    استكشف التصنيف →
                                  </button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => {
                    const isBreaking =
                      item.is_breaking || item.breaking || false;
                    const timeAgo = formatDistanceToNow(
                      new Date(item.timestamp),
                      {
                        locale: ar,
                        addSuffix: true,
                      }
                    );

                    return (
                      <div
                        key={item.id}
                        className="bg-white shadow-sm hover:shadow-md transition-all rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                      >
                        {/* Header: التصنيف والوقت */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {isBreaking ? (
                              <span className="text-sm font-medium px-2 py-1 rounded bg-red-600 text-white">
                                عاجل
                              </span>
                            ) : (
                              (() => {
                                const isOpinion =
                                  item.type === "article" &&
                                  ((item.category?.slug || "").includes(
                                    "opinion"
                                  ) ||
                                    (item.category?.name || "").includes(
                                      "رأي"
                                    ));
                                const pillText =
                                  item.type === "angle-article"
                                    ? item.angle?.title ||
                                      item.label ||
                                      "مُقترب"
                                    : item.category?.name || item.label;
                                const pillColor =
                                  item.type === "angle-article"
                                    ? item.angle?.themeColor ||
                                      item.color ||
                                      undefined
                                    : item.category?.color ||
                                      item.color ||
                                      undefined;
                                let extra: string | null = null;
                                if (item.type === "news") extra = "خبر";
                                else if (item.type === "angle-article")
                                  extra = "مقترب";
                                else if (isOpinion) extra = "رأي";

                                return (
                                  <>
                                    <span
                                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border"
                                      style={{
                                        backgroundColor: pillColor
                                          ? `color-mix(in oklab, ${pillColor} 14%, transparent)`
                                          : "rgba(59, 130, 246, 0.08)",
                                        color: pillColor
                                          ? `color-mix(in oklab, ${pillColor} 75%, currentColor)`
                                          : "rgba(59, 130, 246, 0.75)",
                                        borderColor: pillColor
                                          ? `color-mix(in oklab, ${pillColor} 28%, transparent)`
                                          : "rgba(59, 130, 246, 0.25)",
                                      }}
                                    >
                                      {pillText}
                                    </span>
                                    {extra && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {extra}
                                      </span>
                                    )}
                                  </>
                                );
                              })()
                            )}
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {timeAgo}
                          </span>
                        </div>

                        {/* العنوان */}
                        {(item.type === "news" || item.type === "article") &&
                        item.slug ? (
                          <Link href={getArticleLink(item)}>
                            <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mb-3 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </Link>
                        ) : item.type === "angle-article" &&
                          item.angle &&
                          item.slug ? (
                          <Link href={`/muqtarab/${item.slug}`}>
                            <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </Link>
                        ) : item.type === "category" && item.slug ? (
                          <Link href={`/categories/${item.slug}`}>
                            <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mb-3 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </Link>
                        ) : (
                          <h3 className="text-md md:text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                            {item.title}
                          </h3>
                        )}

                        {/* الملخص */}
                        {item.excerpt && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                            {item.excerpt}
                          </p>
                        )}

                        {/* زر اقرأ المزيد */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {item.author && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.author.name}
                              </span>
                            )}
                          </div>

                          {(item.type === "news" || item.type === "article") &&
                            item.slug && (
                              <Link href={getArticleLink(item)}>
                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ml-auto">
                                  اقرأ المزيد →
                                </button>
                              </Link>
                            )}

                          {item.type === "angle-article" &&
                            item.angle &&
                            item.slug && (
                              <Link href={`/muqtarab/${item.slug}`}>
                                <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium px-3 py-1 rounded-lg transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ml-auto">
                                  قراءة في مُقترب →
                                </button>
                              </Link>
                            )}

                          {item.type === "category" && item.slug && (
                            <Link href={`/categories/${item.slug}`}>
                              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-3 py-1 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ml-auto">
                                استكشف التصنيف →
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="load-more-button inline-flex items-center gap-2 px-6 md:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري التحميل...</span>
                      </>
                    ) : (
                      <>
                        <span>عرض المزيد</span>
                        <ArrowLeft className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
*/
