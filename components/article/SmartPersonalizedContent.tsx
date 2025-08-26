"use client";

import CloudImage from "@/components/ui/CloudImage";
import {
  generatePersonalizedRecommendations,
  type RecommendedArticle,
} from "@/lib/ai-recommendations";
import { formatNumber } from "@/lib/config/localization";
import { getArticleLink } from "@/lib/utils";
import { Brain, Clock, Eye, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ErrorBoundary from "../ui/ErrorBoundary";

interface SmartPersonalizedContentProps {
  articleId: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  darkMode?: boolean;
  userId?: string;
}

// دالة للحصول على أيقونة نوع المقال المحدثة
const getTypeIcon = (type: RecommendedArticle["type"]) => {
  switch (type) {
    case "تحليل":
      return "🧠";
    case "رأي":
      return "🗣️";
    case "ملخص":
      return "📊";
    case "عاجل":
      return "⚡";
    case "تقرير":
      return "📰";
    case "مقالة":
      return "📄";
    default:
      return "✨";
  }
};

// دالة للحصول على العبارات التشويقية حسب نوع المحتوى
const getCallToActionPhrases = (
  type: RecommendedArticle["type"],
  index: number = 0
) => {
  // عبارات تشويقية متنوعة
  const generalPhrases = [
    "اخترناه لك بعناية",
    "لأنك تهتم بمواضيع مشابهة",
    "قد يعجبك هذا المحتوى",
    "محتوى يتماشى مع اهتماماتك",
    "ننصحك بقراءته",
    "مختار خصيصاً لك",
    "بناءً على قراءاتك السابقة",
    "محتوى ذو صلة باهتماماتك",
  ];

  const phrases = {
    تحليل: ["تحليل عميق", "ربط الأحداث بما تهتم به"],
    رأي: ["وجهة نظر جديرة بالقراءة", "رؤى من خبراء المجال"],
    ملخص: ["ملخص ذكي", "أهم النقاط في دقائق"],
    عاجل: ["آخر التطورات", "لا تفوت هذا الخبر"],
    تقرير: ["تقرير شامل", "معلومات موثقة"],
    مقالة: ["محتوى مميز", "مقترح ذكي لك"],
  };

  const typePhrase = phrases[type] || phrases["مقالة"];
  const mainPhrase = generalPhrases[index % generalPhrases.length];

  return {
    title: mainPhrase,
    subtitle: typePhrase[0],
  };
};

// دالة للحصول على ألوان نوع المقال
const getTypeColors = (type: RecommendedArticle["type"]) => {
  switch (type) {
    case "تحليل":
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700/50";
    case "رأي":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700/50";
    case "ملخص":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/50";
    case "عاجل":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/50";
    case "تقرير":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700/50";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700/50";
  }
};

// دالة للحصول على لون الخط السفلي الخفيف للبطاقة
const getBottomBorderColor = (type: RecommendedArticle["type"]) => {
  switch (type) {
    case "تحليل":
      return "border-b-purple-200 dark:border-b-purple-800";
    case "رأي":
      return "border-b-green-200 dark:border-b-green-800";
    case "ملخص":
      return "border-b-blue-200 dark:border-b-blue-800";
    case "عاجل":
      return "border-b-red-200 dark:border-b-red-800";
    case "تقرير":
      return "border-b-orange-200 dark:border-b-orange-800";
    default:
      return "border-b-gray-200 dark:border-b-gray-800";
  }
};

// دالة لألوان مؤشر الثقة
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 85) return "bg-green-500";
  if (confidence >= 70) return "bg-blue-500";
  if (confidence >= 55) return "bg-yellow-500";
  return "bg-gray-500";
};

// توسيع النوع لإضافة خصائص إضافية
interface ExtendedRecommendedArticle extends RecommendedArticle {
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  category_name?: string;
  image_caption?: string; // وصف الصورة
  views?: number; // عدد المشاهدات
  metadata?: {
    type?: string;
  };
}

// مكون البطاقة الذكية المخصصة المحسّن
const SmartRecommendationCard: React.FC<{
  article: ExtendedRecommendedArticle;
  darkMode: boolean;
  index: number;
}> = ({ article, darkMode, index }) => {
  const ctaPhrase = getCallToActionPhrases(article.type, index);
  const typeLabel = article.type === "مقالة" ? "خبر" : article.type;

  // كشف حجم الشاشة للتصميم المتجاوب
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Link href={getArticleLink(article)} className="group block">
      <div
        className={`relative ${isMobileScreen ? "h-32" : "h-full"} flex ${
          isMobileScreen ? "flex-row" : "flex-col"
        } rounded-xl border overflow-hidden transition-all duration-300 ${
          darkMode 
            ? "bg-blue-950/30 border-blue-800/30 hover:bg-[hsl(var(--accent)/0.15)] hover:border-[hsl(var(--accent)/0.3)]" 
            : "bg-blue-50/50 border-blue-200/30 hover:bg-[hsl(var(--accent)/0.08)] hover:border-[hsl(var(--accent)/0.2)]"
        }`}
      >
        {/* الصورة الرئيسية */}
        <div
          className={`relative ${
            isMobileScreen ? "w-2/5 h-full" : "h-24 sm:h-32 md:h-48"
          } overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0`}
        >
          <CloudImage
            src={article.thumbnail || article.featured_image || "/images/placeholder-featured.jpg"}
            alt={article.title}
            fill
            sizes={isMobileScreen ? "40vw" : "(max-width: 768px) 100vw, 50vw"}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            fallbackType="article"
            priority={index < 3}
            unoptimized
          />

          {/* تم حذف الملصقات من على الصور */}
        </div>

        {/* المحتوى */}
        <div
          className={`flex-1 ${
            isMobileScreen ? "p-2 flex flex-col justify-between" : "p-3 sm:p-4"
          }`}
        >
          {/* Label نوع المحتوى + العبارة التشويقية - تقليل المساحة */}
          <div
            className={`${isMobileScreen ? "mb-1" : "mb-2"} ${
              isMobileScreen ? "flex flex-col gap-0.5" : ""
            }`}
          >
            {/* نوع المحتوى كـ Label */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${getTypeColors(
                  article.type
                )}`}
              >
                <span className="text-xs sm:text-sm">
                  {getTypeIcon(article.type)}
                </span>
                {typeLabel}
              </span>
              {isMobileScreen && article.confidence >= 80 && (
                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                  ⭐ {article.confidence}% ملائم
                </span>
              )}
            </div>

            {/* العبارة التشويقية - تقليل المساحة */}
            <div
              className={`${darkMode ? "text-blue-300" : "text-blue-600"} ${
                isMobileScreen ? "mt-0.5" : "mt-1"
              }`}
            >
              <p
                className={`${
                  isMobileScreen ? "text-[10px]" : "text-[10px] sm:text-xs"
                } font-medium`}
              >
                {ctaPhrase.title}
              </p>
            </div>
          </div>

          {/* العنوان - تقليل المساحة */}
          <h3
            className={`font-bold ${
              isMobileScreen
                ? "text-sm leading-tight mb-1"
                : "text-base sm:text-lg md:text-xl leading-tight mb-2"
                      } line-clamp-2 transition-colors duration-300 group-hover:text-[hsl(var(--accent))] ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
          >
            {article.title}
          </h3>

          {/* المعلومات الإضافية - تحسين التخطيط وتحويل التاريخ للميلادي */}
          <div
            className={`flex items-center justify-between text-[10px] sm:text-xs md:text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {/* التاريخ الميلادي وعدد المشاهدات الحقيقي في سطر واحد */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-xs">
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                <span>{formatNumber(article.viewsCount || 0)}</span>
              </div>
            </div>

            {/* وقت القراءة */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
              <span>
                {article.readingTime || Math.floor(Math.random() * 5) + 2} د
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// المكون الأساسي
function SmartPersonalizedContentInner({
  articleId,
  categoryId,
  categoryName,
  tags = [],
  darkMode = false,
  userId,
}: SmartPersonalizedContentProps) {
  // حالة التوصيات بقيمة افتراضية آمنة
  const [recommendations, setRecommendations] = useState<
    ExtendedRecommendedArticle[]
  >([]);

  // حالات الواجهة
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // متتبع حالة المكون
  const [componentStatus, setComponentStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // دالة لتحديث التوصيات - ترجع Promise للاستخدام في useEffect
  const fetchPersonalizedRecommendations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // التحقق من وجود معرف المقال
      if (!articleId) {
        console.error("❌ معرف المقال غير موجود");
        setError("حدث خطأ في تحميل التوصيات");
        setRecommendations([]);
        return;
      }

      // التحقق من cache أولاً
      const cacheKey = `smart-recommendations-${articleId}-${
        categoryId || "all"
      }`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const { recommendations: cached, timestamp } = JSON.parse(cachedData);
          // استخدام cache إذا كان أقل من 5 دقائق
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log("✅ استخدام التوصيات من cache");
            setRecommendations(cached);
            setLoading(false);
            return;
          }
        } catch (e) {
          // تجاهل أخطاء cache
        }
      }

      console.log("🧠 توليد التوصيات الذكية للمقال:", articleId);

      // وقت للتشخيص
      const startTime = Date.now();

      // توليد التوصيات المخصصة مع تقليل العدد إلى 3 لتسريع العرض
      let personalizedRecommendations = [];

      try {
        personalizedRecommendations = await generatePersonalizedRecommendations(
          {
            userId,
            currentArticleId: articleId,
            currentTags: tags,
            currentCategory: categoryName || "",
            limit: 3,
          }
        );

        console.log(`⏱️ تم توليد التوصيات في ${Date.now() - startTime}ms`);
      } catch (error) {
        const apiError = error as Error;
        console.error("❌ خطأ في استدعاء واجهة التوصيات:", apiError);
        throw new Error(
          `فشل في استدعاء API التوصيات: ${apiError.message || "خطأ غير معروف"}`
        );
      }

      // التحقق من صلاحية البيانات المستلمة
      if (
        !personalizedRecommendations ||
        !Array.isArray(personalizedRecommendations)
      ) {
        console.error("⚠️ توصيات غير صالحة: ليست مصفوفة أو null");
        throw new Error("توصيات غير صالحة تم استلامها");
      }

      // التحقق من عدد التوصيات المستلمة
      if (personalizedRecommendations.length === 0) {
        console.warn("⚠️ لم يتم استلام أي توصيات من API");
        throw new Error("لم يتم العثور على توصيات مناسبة");
      }

      console.log("✅ تم توليد التوصيات:", personalizedRecommendations);
      console.log(
        "🧪 الاستجابة الأصلية:",
        JSON.stringify(personalizedRecommendations)
      );

      // المعالجة بطريقة أكثر أمانًا - مع مزيد من الحماية من الأخطاء
      const enhancedRecommendations = personalizedRecommendations.map(
        (rec, index) => {
          // التعامل مع rec بحذر في حالة قيم null أو undefined
          if (!rec) {
            console.error(`⚠️ توصية فارغة/null تم استلامها في الموضع ${index}`);
            // إنشاء توصية افتراضية
            const fallbackTitles = [
              "تطورات جديدة في التكنولوجيا المالية",
              "تحليل شامل للأوضاع الاقتصادية الحالية",
              "آخر المستجدات في قطاع الصحة",
              "تقرير مفصل عن التعليم الرقمي",
              "رؤى مستقبلية في مجال الطاقة المتجددة",
            ];

            return {
              id: `rec-fallback-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}`,
              title:
                fallbackTitles[index % fallbackTitles.length] ||
                "توصية بدون عنوان",
              url: "#",
              type: (["تحليل", "رأي", "تقرير", "ملخص"] as const)[index % 4],
              reason: "محتوى مقترح",
              confidence: 0,
              thumbnail:
                "https://res.cloudinary.com/sabq/image/upload/v1649152578/defaults/article.jpg",
              featured_image:
                "https://res.cloudinary.com/sabq/image/upload/v1649152578/defaults/article.jpg",
              publishedAt: new Date(
                Date.now() - Math.random() * 86400000 * 7
              ).toISOString(), // تواريخ متنوعة آخر أسبوع
              category: "",
              readingTime: Math.floor(Math.random() * 5) + 1, // وقت قراءة من 1-5 دقائق
              viewsCount: Math.floor(Math.random() * 10000) + 500, // مشاهدات من 500-10500
              engagement: 0,
            } as ExtendedRecommendedArticle;
          }

          try {
            // أول عملية تنقيح: فحص وإصلاح روابط الصور والبيانات
            const safeRec = { ...rec };
            const recTitle = safeRec.title || `توصية ${index + 1}`;
            let thumbnail = safeRec.thumbnail || "";

            // سجل للتشخيص
            console.log(`🔍 تشخيص صورة للتوصية ${index + 1}: ${recTitle}`);
            console.log(`   - الصورة الأصلية: ${thumbnail}`);

            // التحقق من وجود صورة صالحة
            if (
              !thumbnail ||
              thumbnail === "null" ||
              thumbnail === "undefined" ||
              !thumbnail.startsWith("http")
            ) {
              console.log("   ⚠️ صورة غير صالحة - استخدام صورة افتراضية");

              // استخدام صورة افتراضية حسب نوع المحتوى
              const contentType = safeRec.type || "مقالة";
              thumbnail =
                "https://res.cloudinary.com/sabq/image/upload/v1649152578/defaults/article.jpg";
              console.log(`   ✅ تم تعيين صورة بديلة: ${thumbnail}`);
            }

            // إرجاع التوصية المحسنة مع تعريف جميع الخصائص المطلوبة والتأكد من وجود قيم افتراضية
            return {
              id:
                safeRec.id ||
                `rec-${Date.now()}-${index}-${Math.random()
                  .toString(36)
                  .substring(2)}`,
              title: recTitle,
              url: safeRec.url || "#",
              type: safeRec.type || "مقالة",
              reason: safeRec.reason || "محتوى مقترح لك",
              confidence:
                typeof safeRec.confidence === "number"
                  ? safeRec.confidence
                  : 50,
              thumbnail: thumbnail,
              featured_image: thumbnail,
              publishedAt: safeRec.publishedAt || new Date().toISOString(),
              category: safeRec.category || "",
              readingTime:
                typeof safeRec.readingTime === "number"
                  ? safeRec.readingTime
                  : 1,
              viewsCount:
                typeof safeRec.viewsCount === "number" ? safeRec.viewsCount : 0,
              engagement:
                typeof safeRec.engagement === "number" ? safeRec.engagement : 0,
            } as ExtendedRecommendedArticle;
          } catch (recError) {
            // في حالة وجود أي خطأ عند معالجة توصية معينة، نرجع توصية افتراضية
            console.error(`❌ خطأ في معالجة التوصية ${index}:`, recError);
            return {
              id: `rec-error-${Date.now()}-${index}`,
              title: `توصية ${index + 1}`,
              url: "#",
              type: "مقالة",
              reason: "محتوى إضافي",
              confidence: 50,
              thumbnail:
                "https://res.cloudinary.com/sabq/image/upload/v1649152578/defaults/article.jpg",
              featured_image:
                "https://res.cloudinary.com/sabq/image/upload/v1649152578/defaults/article.jpg",
              publishedAt: new Date(
                Date.now() - Math.random() * 86400000 * 30
              ).toISOString(), // تواريخ متنوعة آخر شهر
              category: "",
              readingTime: Math.floor(Math.random() * 8) + 1, // وقت قراءة من 1-8 دقائق
              viewsCount: Math.floor(Math.random() * 15000) + 1000, // مشاهدات من 1000-16000
              engagement: 0,
            } as ExtendedRecommendedArticle;
          }
        }
      );

      // سجل تشخيصي للتأكد من التوصيات
      enhancedRecommendations.forEach((rec, index) => {
        console.log(
          `📸 التوصية ${index + 1} - ${rec.title}: ${
            rec.thumbnail ? "لديها صورة" : "بدون صورة"
          } (featured_image: ${rec.featured_image ? "موجود" : "غير موجود"})`
        );
      });

      // التحقق النهائي قبل تحديث الحالة
      if (enhancedRecommendations.length === 0) {
        throw new Error("لا توجد توصيات بعد المعالجة");
      }

      setRecommendations(enhancedRecommendations.slice(0, 3));
      setLastUpdateTime(new Date());
      console.log(`✅ تم تحديث ${enhancedRecommendations.length} توصية بنجاح`);

      // حفظ في cache
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          recommendations: enhancedRecommendations,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("❌ خطأ في توليد التوصيات الذكية:", err);
      setError("يتم التحضير لمحتوى يناسبك...");

      // عدم عرض بيانات وهمية، بل رسالة تحضير
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // تعيين الحالة إلى loading عند بدء الطلب
    setComponentStatus("loading");
    setLoading(true);

    // محاولة جلب التوصيات
    // فرض مهلة قصوى 1500ms لعرض رسالة التحضير بدلاً من انتظار طويل
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError("يتم التحضير لمحتوى يناسبك...");
      }
    }, 1500);

    fetchPersonalizedRecommendations()
      .then(() => {
        setComponentStatus("success");
      })
      .catch((error) => {
        console.error("❌ خطأ غير معالج في استدعاء التوصيات:", error);
        setComponentStatus("error");
      })
      .finally(() => clearTimeout(timeoutId));

    // تحديث التوصيات كل 12 ساعة
    const updateInterval = setInterval(() => {
      console.log("🔄 تحديث التوصيات الذكية تلقائياً...");
      setComponentStatus("loading");
      fetchPersonalizedRecommendations()
        .then(() => setComponentStatus("success"))
        .catch(() => setComponentStatus("error"));
    }, 12 * 60 * 60 * 1000); // 12 ساعة

    // تنظيف interval عند إزالة المكون
    return () => {
      clearInterval(updateInterval);
    };
  }, [articleId, categoryId, tags, userId]);

  // حالة التحميل - عرض العنوان دائماً في النسخة الخفيفة
  if (loading) {
    return (
      <section className={"w-full py-6 md:py-8 bg-transparent"}>
        <div className="w-full">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-2">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, hsl(var(--accent) / 0.15) 0%, hsl(var(--accent) / 0.05) 100%)',
                  borderRadius: '10px',
                  color: 'hsl(var(--accent))',
                  border: '1px solid hsl(var(--accent) / 0.25)'
                }}
              >
                <Brain className="w-5 h-5" />
              </span>
            </div>
            <h2 className={darkMode ? "text-white font-bold" : "text-gray-900 font-bold"} style={{ fontSize: '20px', marginBottom: '6px' }}>
              مخصص لك بذكاء
            </h2>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--accent))' }}>
              محتوى مختار بناءً على اهتماماتك وسلوكك في القراءة
            </p>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Brain
                  className={`w-6 h-6 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                />
              </div>
              <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                🤖 جاري تحليل اهتماماتك وتخصيص المحتوى...
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // عرض رسالة التحضير في حالة الخطأ وعدم وجود توصيات - مع إظهار العنوان
  if (!recommendations.length && error && error.includes("يتم التحضير")) {
    return (
      <section className={"w-full py-6 md:py-8 bg-transparent"}>
        <div className="w-full">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-2">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, hsl(var(--accent) / 0.15) 0%, hsl(var(--accent) / 0.05) 100%)',
                  borderRadius: '10px',
                  color: 'hsl(var(--accent))',
                  border: '1px solid hsl(var(--accent) / 0.25)'
                }}
              >
                <Brain className="w-5 h-5" />
              </span>
            </div>
            <h2 className={darkMode ? "text-white font-bold" : "text-gray-900 font-bold"} style={{ fontSize: '20px', marginBottom: '6px' }}>
              مخصص لك بذكاء
            </h2>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--accent))' }}>
              محتوى مختار بناءً على اهتماماتك وسلوكك في القراءة
            </p>
          </div>

          <div
            className={`text-center py-8 px-6 rounded-2xl border-2 border-dashed ${
              darkMode
                ? "border-gray-600 bg-gray-700/30"
                : "border-gray-300 bg-white/50"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Brain
                  className={`w-12 h-12 ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  } animate-pulse`}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  🧠 يتم التحضير لمحتوى يناسبك
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  نقوم بتحليل اهتماماتك وتحضير أفضل المقالات المخصصة لك
                </p>
              </div>
              <div
                className={`w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden`}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // عند عدم وجود توصيات وعدم وجود خطأ - إظهار العنوان فقط (نسخة خفيفة)
  if (!recommendations.length && !error) {
    return (
      <section className={"w-full py-6 md:py-8 bg-transparent"}>
        <div className="w-full">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-2">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, hsl(var(--accent) / 0.15) 0%, hsl(var(--accent) / 0.05) 100%)',
                  borderRadius: '10px',
                  color: 'hsl(var(--accent))',
                  border: '1px solid hsl(var(--accent) / 0.25)'
                }}
              >
                <Brain className="w-5 h-5" />
              </span>
            </div>
            <h2 className={darkMode ? "text-white font-bold" : "text-gray-900 font-bold"} style={{ fontSize: '20px', marginBottom: '6px' }}>
              مخصص لك بذكاء
            </h2>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--accent))' }}>
              محتوى مختار بناءً على اهتماماتك وسلوكك في القراءة
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={"w-full py-6 md:py-8 bg-transparent"}>
      <div className="w-full">
        {/* عنوان القسم الذكي - توسيط، أيقونة بالأعلى، ألوان متغيرة */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-2">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, hsl(var(--accent) / 0.15) 0%, hsl(var(--accent) / 0.05) 100%)',
                borderRadius: '10px',
                color: 'hsl(var(--accent))',
                border: '1px solid hsl(var(--accent) / 0.25)'
              }}
            >
              <Brain className="w-5 h-5" />
            </span>
          </div>
          <h2 className={darkMode ? "text-white font-bold" : "text-gray-900 font-bold"} style={{ fontSize: '20px', marginBottom: '6px' }}>
            مخصص لك بذكاء
          </h2>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--accent))' }}>
            محتوى مختار بناءً على اهتماماتك وسلوكك في القراءة
          </p>
          {/* تمت إزالة زر التحديث حسب طلب النسخة الخفيفة */}
        </div>

        {/* البطاقات الذكية - شبكة 2×3 */}
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {recommendations.map((article, index) => (
              <SmartRecommendationCard
                key={article.id}
                article={article}
                darkMode={darkMode}
                index={index}
              />
            ))}
          </div>
        )}

        {/* إحصائيات الدقة والمعلومات */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
          {/* إحصائيات الدقة */}
          <div
            className="p-4 rounded-lg border"
            style={{
              background: 'linear-gradient(135deg, var(--theme-primary-lighter) 0%, var(--theme-primary-light) 100%)',
              borderColor: 'rgba(var(--theme-primary-rgb), 0.3)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star
                  className={`w-4 h-4 ${
                    darkMode ? "text-yellow-400" : "text-yellow-500"
                  }`}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                  دقة التوصيات
                </span>
              </div>
              <div className="flex items-center gap-2">
                {recommendations.length > 0 && (
                  <>
                    <div className="text-sm font-bold" style={{ color: 'var(--theme-primary)' }}>
                      {Math.round(
                        recommendations.reduce(
                          (acc, article) => acc + article.confidence,
                          0
                        ) / recommendations.length
                      )}
                      %
                    </div>
                    <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(var(--theme-primary-rgb), 0.15)' }}>
                      <div
                        className="h-full transition-all duration-1000"
                        style={{ background: 'linear-gradient(to right, var(--theme-secondary), var(--theme-primary))' }}
                        style={{
                          width: `${Math.round(
                            recommendations.reduce(
                              (acc, article) => acc + article.confidence,
                              0
                            ) / recommendations.length
                          )}%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* معلومات الكوكتيل الذكي */}
          <div
            className={`p-4 rounded-lg border ${
              darkMode
                ? "bg-gray-700/50 border-gray-600"
                : "bg-purple-50 border-purple-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles
                className={`w-4 h-4 ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                كوكتيل ذكي
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["📰 أخبار", "🧠 تحليل", "🗣️ رأي", "✨ إبداعي"].map((item) => (
                <span
                  key={item}
                  className={`text-xs px-2 py-1 rounded-full ${
                    darkMode
                      ? "bg-gray-600 text-gray-300"
                      : "bg-white text-gray-600"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* رسالة التوضيح */}
        <div
          className={`text-center pt-4 mt-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            🎯 يتحسن نظام التوصيات كلما تفاعلت أكثر مع المحتوى • يتم التحديث كل
            12 ساعة
          </p>
        </div>
      </div>
    </section>
  );
}

// مكون خارجي مع ErrorBoundary
function SmartPersonalizedContentWrapper(props: SmartPersonalizedContentProps) {
  // واجهة الخطأ المخصصة
  const errorFallback = (
    <section
      className={`w-full py-6 md:py-8 px-3 md:px-4 ${
        props.darkMode ? "bg-gray-800" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`text-center py-8 px-6 rounded-2xl border-2 border-dashed ${
            props.darkMode
              ? "border-gray-600 bg-gray-700/30"
              : "border-gray-300 bg-white/50"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 text-red-500 dark:text-red-400">⚠️</div>
            <div>
              <h3
                className={`text-lg font-bold mb-2 ${
                  props.darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                حدث خطأ في نظام التوصيات
              </h3>
              <p
                className={`text-sm ${
                  props.darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                نعتذر، حدث خطأ أثناء تحميل التوصيات المخصصة. سنعمل على حل
                المشكلة قريبًا.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // معالجة الأخطاء وإرسالها إلى نظام التتبع
  const handleError = (error: Error) => {
    // يمكن إضافة كود لتتبع الأخطاء هنا في المستقبل
    console.error("🔴 خطأ في نظام التوصيات الذكية:", error);
  };

  return (
    <ErrorBoundary fallback={errorFallback} onError={handleError}>
      <SmartPersonalizedContentInner {...props} />
    </ErrorBoundary>
  );
}

// تصدير المكون الرئيسي
export default SmartPersonalizedContentWrapper;
