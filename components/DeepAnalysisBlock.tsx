"use client";

// Theme removed for performance
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
  const darkMode = false; // Theme removed for performance
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

  // تاريخ ميلادي موحّد dd/MM/yyyy مثل بطاقات الأخبار
  const formatGregorianDate = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    try {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
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
      className={`py-10 md:py-12 relative overflow-hidden bg-transparent ${className}`}
    >
      {/* العنوان والوصف - محصور في container */}
      {showTitle && (
        <div className="max-w-6xl mx-auto relative z-10 mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  background: 'hsl(var(--accent) / 0.08)',
                  borderRadius: '10px',
                  color: 'hsl(var(--accent))',
                  fontSize: '18px',
                  border: '1px solid hsl(var(--accent) / 0.25)'
                }}
              >
                <Brain className="w-5 h-5" />
              </div>
              <h2
                className={`text-2xl md:text-4xl font-bold deep-analysis-title`}
                style={{ wordSpacing: 'normal', letterSpacing: 'normal', color: 'hsl(var(--fg))' }}
              >
                التحليل العميق من سبق
              </h2>
            </div>
            <p
              className="mt-1 font-semibold text-[12px] md:text-[16px]"
              style={{ color: 'hsl(var(--accent))', wordSpacing: 'normal', letterSpacing: 'normal' }}
            >
              رؤى استراتيجية ودراسات معمقة بالذكاء الاصطناعي
            </p>
          </div>
        </div>
      )}

      {/* البطاقات - محدودة العرض مثل باقي المحتوى */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* البطاقات - فصل بين الموبايل والديسكتوب */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {displayInsights.slice(0, maxItems).map((item) => {
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
              const displayDate = item.analyzed_at || item.updated_at || item.publishedAt || item.createdAt || item.article?.published_at;

              return (
                <Link
                  key={item.id}
                  href={url}
                  onClick={() => markAsRead(item.id)}
                  className={`block h-full bg-white border rounded-2xl overflow-hidden`}
                  style={{ borderColor: '#f0f0ef' }}
                >
                  <div className="relative p-4 h-full flex flex-col">
                    {/* رأس البطاقة - مضغوط جداً */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* نوع التحليل مدمج */}
                        <div
                          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                            darkMode
                              ? "bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-300 border border-purple-700/50"
                              : "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          <Brain className="w-4 h-4 shrink-0" />
                          <span className="font-semibold">
                            {analysisType.label}
                          </span>
                        </div>

                        {isNew && (
                          <div
                            className="old-style-news-new-badge"
                            style={{
                              minWidth: 78,
                              height: 24,
                              lineHeight: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              borderRadius: 12,
                              padding: '0 8px',
                            }}
                          >
                            <span className="old-style-fire-emoji" aria-hidden>🔥</span>
                            <span>جديد</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {displayDate && (
                          <span className="old-style-news-date">{formatGregorianDate(displayDate)}</span>
                        )}
                        {isUnread && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" aria-hidden></div>
                        )}
                      </div>
                    </div>

                    {/* الصورة والمحتوى */}
                    <div className="flex gap-4 mb-3 items-start">
                      {/* الصورة المصغرة إن وجدت */}
                      {(item.featuredImage ||
                        item.metadata?.featuredImage) && (
                        <div className="flex-shrink-0">
                          <div
                            className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden ${
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
                        {/* العنوان */}
                        <h3
                          className={`text-base md:text-lg font-bold leading-snug line-clamp-2 mb-1 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {title}
                        </h3>

                        {/* التصنيف أسفل العنوان بنمط موحّد مع الأخبار */}
                        <div className="mt-1 mb-1">
                          <span className="category-pill">{categoryName}</span>
                        </div>

                        {/* الملخص */}
                        <p
                          className={`text-xs leading-relaxed line-clamp-2 ${
                            darkMode ? "text-gray-200" : "text-gray-700"
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

                    {/* معلومات سفلية - نمط بطاقات الأخبار (مشاهدات + وقت القراءة) */}
                    <div className="mt-auto">
                      <div className="old-style-news-bottom-bar">
                        <div className="old-style-news-meta-item">
                          <Eye className="old-style-icon" />
                          <span>{(views || 0).toLocaleString()} مشاهدة</span>
                        </div>
                        {readTime && (
                          <div className="old-style-news-meta-item">
                            <Clock3 className="old-style-icon" />
                            <span>{readTime} د قراءة</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>

      {/* زر عرض جميع التحليلات */}
      <div className="text-center mt-8">
        <Link
          href="/insights/deep"
          className={`inline-flex items-center gap-3 px-8 py-4 font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105 group ${
            darkMode
              ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              : "bg-[#f8f8f7] hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>عرض جميع التحليلات العميقة</span>
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

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
