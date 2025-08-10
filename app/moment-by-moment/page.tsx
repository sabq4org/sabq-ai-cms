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
          <div className={`hidden lg:block absolute top-0 bottom-0 right-3 w-1 bg-gradient-to-b ${timelineColor} rounded-full opacity-70`} />

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
*/
