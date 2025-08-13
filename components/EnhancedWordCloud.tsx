"use client";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Dot, Loader2, AlertCircle, Search } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Link from "next/link";

// Types
export type Trend = "up" | "down" | "flat" | null;

export interface WordItem {
  id: string;        // slug أو uuid
  text: string;      // "غزة", "إسرائيل", ...
  weight: number;    // 1..100 (يُطبّع داخلياً)
  colorKey?: string; // مفتاح لتلوين دلالي (دول/اقتصاد/سياسة...)
  trend?: Trend;     // up/down/flat
  href?: string;     // رابط عند النقر (بحث/وسم)
}

interface EnhancedWordCloudProps {
  words: WordItem[];
  onSelect?: (word: WordItem) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  title?: string;
  showStats?: boolean;
  maxWords?: number;
}

// خريطة الألوان حسب الفئة
const colorMap: Record<string, string> = {
  politics: "#F59E0B",   // amber - سياسة
  conflict: "#EC4899",   // pink - صراعات/حروب
  economy: "#10B981",    // emerald - اقتصاد
  geo: "#60A5FA",        // blue - دول/مدن
  misc: "#A78BFA",       // violet - متفرقات
  tech: "#06B6D4",       // cyan - تقنية
  sports: "#F97316",     // orange - رياضة
  culture: "#8B5CF6",    // purple - ثقافة
};

// دالة تحجيم الخط
const scaleFont = (weight: number, min = 16, max = 64): number => {
  const clamped = Math.max(1, Math.min(100, weight));
  return Math.round(min + ((clamped - 1) * (max - min)) / 99);
};

// دالة تحديد حجم الخط حسب الشاشة
const getResponsiveFontSize = (weight: number): number => {
  if (typeof window === "undefined") return scaleFont(weight, 20, 64);
  
  const width = window.innerWidth;
  if (width < 768) { // موبايل
    return scaleFont(weight, 16, 42);
  } else if (width < 1024) { // تابلت
    return scaleFont(weight, 18, 54);
  } else { // ديسكتوب
    return scaleFont(weight, 20, 64);
  }
};

// دالة ترجمة الترند
const trendLabel = (trend: Trend): string => {
  return trend === "up" ? "صاعد" : trend === "down" ? "هابط" : trend === "flat" ? "ثابت" : "";
};

// مكون Skeleton للتحميل
function CloudSkeleton() {
  return (
    <div className="mx-auto max-w-5xl p-6 bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700">
      <div className="flex flex-wrap gap-3 justify-center">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="h-7 sm:h-9 rounded-md bg-slate-100 dark:bg-gray-700 animate-pulse"
            style={{ width: `${40 + Math.random() * 120}px` }}
          />
        ))}
      </div>
    </div>
  );
}

// مكون الخطأ
function CloudError({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="p-6 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-800">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>تعذّر تحميل الكلمات: {msg}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

// مكون الحالة الفارغة
function EmptyCloud() {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
        <Search className="w-8 h-8 text-slate-400 dark:text-gray-500" />
      </div>
      <p className="text-slate-500 dark:text-gray-400">لا توجد كلمات شائعة حالياً</p>
    </div>
  );
}

// المكون الرئيسي
export default function EnhancedWordCloud({
  words,
  onSelect,
  loading,
  error,
  className = "",
  title = "الكلمات الشائعة",
  showStats = true,
  maxWords = 40
}: EnhancedWordCloudProps) {
  const [isClient, setIsClient] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // يمكن إضافة منطق إعادة المحاولة هنا
  };

  // معالجة وتطبيع الكلمات
  const normalizedWords = useMemo(() => {
    if (!words?.length) return [];
    
    // ترتيب حسب الوزن وأخذ العدد المطلوب
    const sortedWords = [...words]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, maxWords);
    
    return sortedWords.map(word => ({
      ...word,
      fontSize: isClient ? getResponsiveFontSize(word.weight) : scaleFont(word.weight),
      color: colorMap[word.colorKey ?? "misc"] ?? colorMap.misc,
    }));
  }, [words, maxWords, isClient]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    if (!normalizedWords.length) return null;
    
    const upTrend = normalizedWords.filter(w => w.trend === "up").length;
    const downTrend = normalizedWords.filter(w => w.trend === "down").length;
    const totalWeight = normalizedWords.reduce((sum, w) => sum + w.weight, 0);
    
    return {
      total: normalizedWords.length,
      upTrend,
      downTrend,
      avgWeight: Math.round(totalWeight / normalizedWords.length)
    };
  }, [normalizedWords]);

  // معالج النقر على الكلمة
  const handleWordClick = (word: WordItem) => {
    if (word.href) {
      window.location.assign(word.href);
    } else if (onSelect) {
      onSelect(word);
    }
  };

  // عرض حالات مختلفة
  if (loading) return <CloudSkeleton />;
  if (error) return <CloudError msg={error} onRetry={handleRetry} />;
  if (!normalizedWords?.length) return <EmptyCloud />;

  return (
    <div
      dir="rtl"
      className={`enhanced-word-cloud ${className}`}
      aria-label="سحابة الكلمات الشائعة"
    >
      <div className="relative mx-auto max-w-5xl">
        {/* العنوان */}
        {title && (
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              أكثر الكلمات تداولاً في الأخبار
            </p>
          </div>
        )}

        {/* سحابة الكلمات */}
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-3 justify-center" role="list">
            <AnimatePresence mode="sync">
              {normalizedWords.map((word, index) => (
                <Tooltip.Provider key={word.id} delayDuration={300}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <motion.button
                        role="listitem"
                        type="button"
                        onClick={() => handleWordClick(word)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ 
                          delay: index * 0.02, 
                          duration: 0.25,
                          ease: "easeOut"
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md px-2 py-1 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        style={{ 
                          fontSize: `${word.fontSize}px`, 
                          color: word.color, 
                          lineHeight: 1.1 
                        }}
                        aria-label={`${word.text}، وزن ${word.weight}${word.trend ? `، ترند ${trendLabel(word.trend)}` : ""}`}
                      >
                        {/* مؤشر الترند */}
                        {word.trend && word.trend !== "flat" && (
                          <span 
                            className="absolute -top-3 -left-3 text-xs opacity-70 select-none"
                            style={{ color: word.color }}
                          >
                            {word.trend === "up" ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                          </span>
                        )}
                        <span className="font-semibold">{word.text}</span>
                      </motion.button>
                    </Tooltip.Trigger>
                    
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="z-50 overflow-hidden rounded-md bg-gray-900 dark:bg-gray-100 px-3 py-1.5 text-sm text-gray-100 dark:text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                        sideOffset={5}
                      >
                        <p className="font-medium">{word.text}</p>
                        <p className="text-xs opacity-80">
                          الوزن: {word.weight}
                          {word.trend && ` • ${trendLabel(word.trend)}`}
                        </p>
                        <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* الإحصائيات */}
        {showStats && stats && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.total}</span>
              <span>كلمة</span>
            </div>
            {stats.upTrend > 0 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.upTrend} صاعدة</span>
              </div>
            )}
            {stats.downTrend > 0 && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <TrendingDown className="w-4 h-4" />
                <span>{stats.downTrend} هابطة</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Dot className="w-4 h-4" />
              <span>متوسط الوزن: {stats.avgWeight}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
