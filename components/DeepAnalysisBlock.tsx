"use client";

import { useTheme } from "@/contexts/ThemeContext";
import {
  Award,
  BookOpen,
  Bot,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import MobileDeepAnalysisCard from "./mobile/MobileDeepAnalysisCard";

interface DeepInsight {
  id: string;
  article_id?: string;
  ai_summary?: string;
  key_topics?: string[];
  tags: string[];
  sentiment?: string;
  readability_score?: number;
  engagement_score?: number;
  analyzed_at: string;
  updated_at?: string;
  // خصائص من API الجديد
  title?: string;
  summary?: string;
  slug?: string;
  featuredImage?: string;
  status?: string;
  sourceType?: string;
  qualityScore?: number;
  categories?: string[];
  authorName?: string;
  analysisType?: string;
  readingTime?: number;
  views?: number;
  likes?: number;
  createdAt?: string;
  publishedAt?: string;
  metadata?: {
    title?: string;
    summary?: string;
    authorName?: string;
    categories?: string[];
    readingTime?: number;
    views?: number;
    featuredImage?: string;
  };
  article?: {
    id: string;
    title: string;
    summary: string;
    slug: string;
    featured_image_url?: string;
    published_at: string;
    read_time?: number;
    views_count: number;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      color?: string;
    }>;
    category?: {
      name: string;
      color: string;
    };
  };
}

interface DeepAnalysisBlockProps {
  insights?: DeepInsight[];
  className?: string;
  showTitle?: boolean;
  maxItems?: number;
}

export default function DeepAnalysisBlock({
  insights = [],
  className = "",
  showTitle = true,
  maxItems = 3,
}: DeepAnalysisBlockProps) {
  const [readItems, setReadItems] = useState<string[]>([]);
  const { resolvedTheme, mounted } = useTheme();
  const darkMode = resolvedTheme === "dark";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllTags, setShowAllTags] = useState<{ [key: string]: boolean }>(
    {}
  );
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [realAnalyses, setRealAnalyses] = useState<DeepInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحديد نوع الجهاز
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // جلب البيانات الحقيقية فقط إذا لم يتم تمريرها كـ props
  useEffect(() => {
    const fetchAnalyses = async () => {
      // وإلا، جلب البيانات من API
      setLoading(true);
      try {
        // إضافة timeout لتجنب مشاكل انتهاء المهلة
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني

        try {
          const response = await fetch(
            `/api/deep-analyses?limit=${maxItems}&sortBy=analyzed_at&sortOrder=desc`,
            {
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            console.log("📊 Deep Analysis API Response:", data); // للتشخيص

            // التحقق من نجاح العملية
            if (data.success === false) {
              // في حالة خطأ من API
              console.error("❌ API returned error:", data.error);
              throw new Error(
                data.errorMessage || data.error || "حدث خطأ في جلب التحليلات"
              );
            }

            // إصلاح قراءة البيانات من API
            const analyses = data.analyses || data.data || [];
            setRealAnalyses(analyses);

            if (analyses.length === 0) {
              console.warn("⚠️ لا توجد تحليلات عميقة في قاعدة البيانات");
            } else {
              console.log(`✅ تم جلب ${analyses.length} تحليل عميق بنجاح`);
              console.log(
                "📋 البيانات المجلوبة:",
                analyses.map((a: any) => ({
                  id: a.id,
                  title: a.title || a.metadata?.title || a.article?.title,
                  hasArticle: !!a.article,
                  hasMetadata: !!a.metadata,
                  summary: a.summary?.substring(0, 50) + "...",
                  views: a.views,
                  featuredImage: a.featuredImage,
                }))
              );
              console.log("🔍 مثال كامل للتحليل الأول:", analyses[0]);
            }
          } else {
            // في حالة خطأ HTTP
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
              const errorData = await response.json();
              errorMessage =
                errorData.errorMessage || errorData.error || errorMessage;
            } catch {
              // إذا فشل parsing الخطأ، نستخدم الرسالة الافتراضية
            }
            throw new Error(errorMessage);
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === "AbortError") {
            throw new Error(
              "انتهت مهلة تحميل التحليلات العميقة. يرجى المحاولة مرة أخرى."
            );
          }
          throw fetchError;
        }
      } catch (error) {
        console.error("❌ خطأ في جلب التحليلات العميقة:", error);
        // عرض رسالة خطأ للمستخدم
        setError(
          error instanceof Error ? error.message : "حدث خطأ في تحميل التحليلات"
        );
      } finally {
        setLoading(false);
      }
    };

    // فقط جلب البيانات إذا لم تكن متوفرة من props
    if (!insights || insights.length === 0) {
      fetchAnalyses();
    } else {
      setRealAnalyses(insights);
      setLoading(false);
    }
  }, []);

  // useEffect منفصل لتحديث البيانات عند تغيير maxItems
  useEffect(() => {
    if (insights && insights.length > 0) {
      // استخدم البيانات من props مع تطبيق maxItems
      setRealAnalyses(insights.slice(0, maxItems));
    }
  }, [insights, maxItems]);

  // استخدام البيانات الحقيقية أو فارغة
  const displayInsights = realAnalyses.length > 0 ? realAnalyses : [];

  useEffect(() => {
    // قراءة العناصر المقروءة من localStorage
    const read = localStorage.getItem("readAnalysis");
    if (read) {
      setReadItems(JSON.parse(read));
    }
  }, []);

  const handleShare = (item: DeepInsight) => {
    const url = `/insights/deep/${item.id}`;
    const title = item.article?.title || "تحليل عميق";
    const summary = item.ai_summary || item.article?.summary;

    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: summary,
          url: window.location.origin + url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + url);
      toast.success("تم نسخ الرابط");
    }
  };

  const markAsRead = (id: string) => {
    const newReadItems = [...readItems, id];
    setReadItems(newReadItems);
    localStorage.setItem("readAnalysis", JSON.stringify(newReadItems));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ${hours === 1 ? "ساعة" : "ساعات"}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} ${days === 1 ? "يوم" : "أيام"}`;
    }
  };

  // تحديد ما إذا كان التحليل جديد (خلال آخر 24 ساعة)
  const isNewInsight = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    return diffInHours < 24;
  };

  // التعامل مع التمرير
  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // عرض البطاقة + المسافة
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // تتبع التمرير الحالي
  useEffect(() => {
    const handleScrollUpdate = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const cardWidth = 340; // عرض البطاقة + المسافة
        const index = Math.round(scrollLeft / cardWidth);
        setCurrentIndex(index);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScrollUpdate);
      return () =>
        scrollContainer.removeEventListener("scroll", handleScrollUpdate);
    }
  }, []);

  return (
    <div
      id="deep-analysis-highlight"
      className={`py-8 relative overflow-hidden ${className}`}
    >
      {/* العنوان والوصف - محصور في container */}
      {showTitle && (
        <div className="max-w-7xl mx-auto px-4 relative z-10 mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl ring-2 ring-white/30">
                <Brain className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg card-title"
                style={{ wordSpacing: "normal", letterSpacing: "normal" }}
              >
                التحليل العميق من سبق
              </h2>
            </div>
            <p
              className="text-base sm:text-lg mt-2 text-white/90 drop-shadow card-description"
              style={{ wordSpacing: "normal", letterSpacing: "normal" }}
            >
              رؤى استراتيجية ودراسات معمقة بالذكاء الاصطناعي
            </p>
          </div>
        </div>
      )}

      {/* البطاقات - محدودة العرض مثل باقي المحتوى */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* البطاقات - فصل بين الموبايل والديسكتوب */}
        {isMobile ? (
          // عرض الموبايل - البطاقات المبسطة الجديدة
          <div className="grid grid-cols-1 gap-4 mb-6">
            {displayInsights.slice(0, maxItems).map((item) => (
              <MobileDeepAnalysisCard
                key={item.id}
                insight={{
                  ...item,
                  article_id: item.article_id || "",
                  ai_summary: item.ai_summary || item.summary || "",
                  key_topics: item.key_topics || [],
                  sentiment: item.sentiment || "neutral",
                  readability_score: item.readability_score || 0,
                  engagement_score: item.engagement_score || 0,
                  updated_at: item.updated_at || item.analyzed_at,
                }}
                darkMode={darkMode}
              />
            ))}
          </div>
        ) : (
          // عرض الديسكتوب - البطاقات الكاملة الأصلية
          <div className="relative mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {loading ? (
                // عرض skeleton loader أثناء التحميل
                Array.from({ length: maxItems }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className={`${
                      darkMode
                        ? "bg-gray-800/90 backdrop-blur-sm border-gray-700"
                        : "bg-white/95 backdrop-blur-sm border-white/20"
                    } rounded-2xl shadow-lg overflow-hidden border animate-pulse`}
                  >
                    <div className="relative p-4">
                      {/* Header skeleton */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`h-5 w-20 rounded-full ${
                              darkMode ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          ></div>
                          <div
                            className={`h-5 w-12 rounded ${
                              darkMode ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          ></div>
                        </div>
                        <div
                          className={`h-2 w-2 rounded-full ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        ></div>
                      </div>
                      {/* Category skeleton */}
                      <div
                        className={`h-4 w-16 rounded mb-2 ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      ></div>
                      {/* Title skeleton */}
                      <div className="space-y-1 mb-2">
                        <div
                          className={`h-4 w-full rounded ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        ></div>
                        <div
                          className={`h-4 w-3/4 rounded ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        ></div>
                      </div>
                      {/* Summary skeleton */}
                      <div
                        className={`h-3 w-full rounded mb-3 ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      ></div>
                      {/* Tags skeleton */}
                      <div className="flex gap-1 mb-3">
                        <div
                          className={`h-4 w-12 rounded ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        ></div>
                        <div
                          className={`h-4 w-16 rounded ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        ></div>
                      </div>
                      {/* Footer skeleton */}
                      <div className="pt-2 border-t border-gray-200/30 dark:border-gray-700/30">
                        <div className="flex justify-between">
                          <div className="flex gap-2">
                            <div
                              className={`h-3 w-8 rounded ${
                                darkMode ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            ></div>
                            <div
                              className={`h-3 w-8 rounded ${
                                darkMode ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            ></div>
                            <div
                              className={`h-3 w-10 rounded ${
                                darkMode ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            ></div>
                          </div>
                          <div
                            className={`h-3.5 w-3.5 rounded ${
                              darkMode ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : displayInsights.length === 0 ? (
                // عرض حالة عدم وجود بيانات أو خطأ
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <Brain className="w-16 h-16 text-gray-400 mb-4" />
                  {error ? (
                    <>
                      <h3
                        className={`text-xl font-bold mb-2 ${
                          darkMode ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        حدث خطأ في تحميل التحليلات
                      </h3>
                      <p
                        className={`text-center mb-6 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {error}
                      </p>
                      <button
                        onClick={() => {
                          setError(null);
                          window.location.reload();
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        إعادة المحاولة
                      </button>
                    </>
                  ) : (
                    <>
                      <h3
                        className={`text-xl font-bold mb-2 ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        سيتم تحديث التحليلات العميقة قريباً
                      </h3>
                      <p
                        className={`text-center mb-6 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        نحن نعمل على إعداد تحليلات عميقة بالذكاء الاصطناعي لأحدث
                        الأخبار
                      </p>
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          قيد المعالجة بواسطة الذكاء الاصطناعي
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                displayInsights.slice(0, maxItems).map((item, index) => {
                  const isUnread = !readItems.includes(item.id);
                  const hasAI = item.ai_summary || item.summary;
                  const isNew = isNewInsight(item.analyzed_at);
                  const tags = item.tags || [];
                  const visibleTags = showAllTags[item.id]
                    ? tags
                    : tags.slice(0, 2);
                  const remainingTags = tags.length - 2;
                  const title =
                    item.title ||
                    item.metadata?.title ||
                    item.article?.title ||
                    "تحليل عميق";
                  const summary =
                    item.summary ||
                    item.ai_summary ||
                    item.metadata?.summary ||
                    item.article?.summary ||
                    "سيتم تحديث الملخص قريباً بواسطة الذكاء الاصطناعي";
                  const authorName =
                    item.authorName ||
                    item.metadata?.authorName ||
                    item.article?.author?.name ||
                    "مجهول";
                  const categoryName =
                    item.categories?.[0] ||
                    item.metadata?.categories?.[0] ||
                    item.article?.categories?.[0]?.name ||
                    "عام";
                  const url = `/insights/deep/${item.id}`;
                  const readTime =
                    item.readingTime ||
                    item.metadata?.readingTime ||
                    item.article?.read_time ||
                    10;
                  const views =
                    item.views ||
                    item.metadata?.views ||
                    item.article?.views_count ||
                    0;
                  const analysisScore =
                    item.qualityScore || item.readability_score
                      ? Math.round(
                          Number(item.qualityScore || item.readability_score)
                        )
                      : null;

                  // تحديد نوع التحليل العميق
                  const getAnalysisType = () => {
                    // جميع التحليلات في هذا البلوك تعتبر "تحليل عميق"
                    return { type: "deep", label: "تحليل عميق", icon: "brain" };
                  };

                  const analysisType = getAnalysisType();

                  return (
                    <Link
                      key={item.id}
                      href={url}
                      onClick={() => markAsRead(item.id)}
                      className={`group block h-full ${
                        darkMode
                          ? "bg-gray-800/90 backdrop-blur-sm hover:bg-gray-800/95 border-gray-700 hover:border-gray-600"
                          : "bg-white/95 backdrop-blur-sm hover:bg-white border-white/20 hover:border-white/40"
                      } rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border transition-all duration-300 transform hover:scale-[1.01] hover:translate-y-[-2px]`}
                    >
                      <div className="relative p-4 h-full flex flex-col">
                        {/* رأس البطاقة - مضغوط جداً */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            {/* نوع التحليل مدمج */}
                            <div
                              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                                darkMode
                                  ? "bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-300 border border-purple-700/50"
                                  : "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200"
                              }`}
                            >
                              <Brain className="w-3.5 h-3.5" />
                              <span className="font-semibold">
                                {analysisType.label}
                              </span>
                            </div>

                            {isNew && (
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                                جديد
                              </span>
                            )}
                          </div>

                          {/* نقطة القراءة */}
                          {isUnread && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          )}
                        </div>

                        {/* الصورة والمحتوى */}
                        <div className="flex gap-3 mb-3">
                          {/* الصورة المصغرة إن وجدت */}
                          {(item.featuredImage ||
                            item.metadata?.featuredImage) && (
                            <div className="flex-shrink-0">
                              <div
                                className={`relative w-16 h-16 rounded-lg overflow-hidden ${
                                  darkMode ? "bg-gray-700" : "bg-gray-200"
                                }`}
                              >
                                <img
                                  src={
                                    item.featuredImage ||
                                    item.metadata?.featuredImage
                                  }
                                  alt={title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            {/* التصنيف */}
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                  darkMode
                                    ? "text-blue-300 bg-blue-900/20 border border-blue-700/30"
                                    : "text-blue-700 bg-blue-50 border border-blue-200"
                                }`}
                              >
                                {categoryName}
                              </span>
                              {/* نقاط الجودة */}
                              {analysisScore && analysisScore > 85 && (
                                <span
                                  className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                    darkMode
                                      ? "text-green-300 bg-green-900/20"
                                      : "text-green-700 bg-green-50"
                                  }`}
                                >
                                  <Award className="w-3 h-3" />
                                  {analysisScore}%
                                </span>
                              )}
                            </div>

                            {/* العنوان */}
                            <h3
                              className={`text-sm font-bold mb-1.5 leading-tight line-clamp-2 ${
                                darkMode ? "text-white" : "text-gray-900"
                              } group-hover:text-purple-600 transition-colors`}
                            >
                              {title}
                            </h3>

                            {/* الملخص */}
                            <p
                              className={`text-xs leading-relaxed line-clamp-2 ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {summary}
                            </p>
                          </div>
                        </div>

                        {/* الوسوم */}
                        {tags.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  darkMode
                                    ? "bg-gray-700/50 text-gray-400 border border-gray-600/30"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  darkMode
                                    ? "bg-purple-900/20 text-purple-400"
                                    : "bg-purple-50 text-purple-600"
                                }`}
                              >
                                +{tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* معلومات سفلية - محسنة */}
                        <div
                          className={`flex items-center justify-between pt-2 mt-auto border-t ${
                            darkMode
                              ? "border-gray-700/30"
                              : "border-gray-200/30"
                          }`}
                        >
                          <div className="flex items-center gap-3 text-[11px]">
                            {/* الكاتب */}
                            <div
                              className={`flex items-center gap-1 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              <User className="w-3 h-3" />
                              <span className="font-medium">{authorName}</span>
                            </div>

                            {/* وقت القراءة */}
                            <div className="flex items-center gap-0.5">
                              <Clock3
                                className={`w-3 h-3 ${
                                  darkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              />
                              <span
                                className={
                                  darkMode ? "text-gray-500" : "text-gray-400"
                                }
                              >
                                {readTime}د
                              </span>
                            </div>

                            {/* المشاهدات */}
                            <span className="flex items-center gap-0.5 text-blue-600">
                              <Eye className="w-3 h-3" />
                              <span className="font-medium">{views}</span>
                            </span>
                          </div>

                          <ChevronRight
                            className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                              darkMode ? "text-gray-400" : "text-gray-400"
                            }`}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* زر عرض جميع التحليلات */}
        <div className="text-center mt-8">
          <Link
            href="/insights/deep"
            className={`inline-flex items-center gap-3 px-8 py-4 font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group ${
              darkMode
                ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                : "bg-white/90 hover:bg-white text-gray-800 border border-white/30"
            } backdrop-blur-sm`}
          >
            <BookOpen className="w-5 h-5" />
            <span>عرض جميع التحليلات العميقة</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      {/* إغلاق div البطاقات الممتدة */}

      <style jsx>{`
        /* إخفاء شريط التمرير */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
