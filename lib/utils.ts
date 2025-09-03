import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { linkTo } from "./url-builder";

import { formatNumber } from "./config/localization";
import { getArticleIdentifier } from "./slug-utils";

/**
 * دالة مساعدة لدمج فئات CSS مع دعم Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق التاريخ باللغة العربية
 */
export function formatDate(
  date: Date | string,
  locale: string = "ar-SA"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(dateObj);
}

/**
 * تنسيق التاريخ باللغة العربية
 */
export function formatDateAr(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Intl.DateTimeFormat("ar-SA", options).format(date);
}

/**
 * تنسيق الوقت النسبي باللغة العربية
 */
export function getRelativeTimeAr(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "قبل لحظات";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `قبل ${minutes} ${
      minutes === 1
        ? "دقيقة"
        : minutes === 2
        ? "دقيقتين"
        : minutes <= 10
        ? "دقائق"
        : "دقيقة"
    }`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `قبل ${hours} ${
      hours === 1
        ? "ساعة"
        : hours === 2
        ? "ساعتين"
        : hours <= 10
        ? "ساعات"
        : "ساعة"
    }`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `قبل ${days} ${
      days === 1 ? "يوم" : days === 2 ? "يومين" : days <= 10 ? "أيام" : "يوم"
    }`;
  } else {
    return formatDateAr(date);
  }
}

/**
 * اختصار النص مع إضافة ...
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * تنسيق الأرقام بالعربية
 */
export function formatNumberAr(num: number): string {
  return formatNumber(num, { useThousandSeparator: true });
}

/**
 * تحويل الأرقام الكبيرة إلى صيغة مختصرة
 */
export function formatCompactNumberAr(num: number): string {
  if (num < 1000) return formatNumberAr(num);
  if (num < 1000000) return `${formatNumber(Math.floor(num / 1000))} ألف`;
  if (num < 1000000000)
    return `${formatNumber(Math.floor(num / 1000000))} مليون`;
  return `${formatNumber(Math.floor(num / 1000000000))} مليار`;
}

export function getImageUrl(imagePath: string | undefined | null): string {
  console.log("🔍 getImageUrl called with:", imagePath);

  if (!imagePath) {
    console.log("⚠️ No image path provided, using placeholder");
    return "/images/placeholder-featured.jpg";
  }

  // إذا كان المسار URL كامل، أرجعه كما هو
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    console.log("✅ Using full URL:", imagePath);
    return imagePath;
  }

  // إذا كان المسار يبدأ بـ /uploads، تحقق من البيئة
  if (imagePath.startsWith("/uploads/")) {
    // في بيئة الإنتاج، استخدم URL الكامل
    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost"
    ) {
      const siteUrl = "https://sabq.io";
      const fullUrl = `${siteUrl}${imagePath}`;
      console.log("🌐 Production URL:", fullUrl);
      return fullUrl;
    }
    // في بيئة التطوير، أرجع المسار كما هو
    console.log("🛠️ Development mode, using original path:", imagePath);
    return imagePath;
  }

  // إذا كان المسار نسبي، أضف / في البداية
  if (!imagePath.startsWith("/")) {
    const fullPath = `/${imagePath}`;
    console.log("🔧 Adding leading slash:", fullPath);
    return fullPath;
  }

  console.log("📁 Using path as-is:", imagePath);
  return imagePath;
}

// دالة مساعدة لإنشاء صور مصغرة محسنة
export function getOptimizedImageUrl(
  imagePath: string | undefined | null,
  width: number = 800,
  quality: number = 85
): string {
  const baseUrl = getImageUrl(imagePath);

  if (!baseUrl || baseUrl === "/images/placeholder-article.jpg") {
    return baseUrl;
  }

  // إذا كان URL خارجي، أرجعه كما هو (Next.js سيحسنه تلقائياً)
  if (baseUrl.startsWith("http")) {
    return baseUrl;
  }

  // للصور المحلية، يمكن إضافة معاملات تحسين
  return baseUrl;
}

/**
 * 🔷 دالة مركزية لتحديد المسار المناسب للمقال - تم تحديثها لحل مشاكل React #130
 *
 * منطق صارم وحصري لتوزيع المسارات:
 * • المقالات العادية (أخبار، تقارير، تغطيات) → /article/[id]
 * • مقالات الرأي (كتّاب، زوايا رأي) → /opinion/[id]
 *
 * تم إزالة دعم الروابط العربية لحل مشاكل React #130 في الإنتاج
 *
 * @param article - المقال المراد تحديد مساره
 * @returns المسار المناسب للمقال (ID فقط)
 */
export function getArticleLink(article: any): string {
  if (!article) {
    console.warn(
      "getArticleLink: Article object is missing. Returning fallback link '#'."
    );
    return "#";
  }

  // Ensure contentType is correctly determined with a fallback
  const contentType =
    article.content_type ||
    (["opinion", "analysis", "interview"].includes(
      article.article_type?.toLowerCase()
    )
      ? "OPINION"
      : "NEWS");

  if (article.slug) {
    return linkTo({ slug: article.slug, contentType });
  }

  // Fallback for older articles that might not have a slug
  if (article.id) {
    console.warn(
      `getArticleLink: Fallback to ID for article "${
        article.title || article.id
      }".`
    );
    // This assumes old articles are news, adjust if necessary
    return linkTo({ slug: article.id, contentType: "NEWS" });
  }

  console.error(
    "getArticleLink: Article is missing both slug and id. Cannot generate link.",
    article
  );
  return "#";
}

/**
 * إنشاء رابط المقال الذكي (Smart Article Link) - محدث لحل مشاكل React #130
 * يوجه المقالات للتصميم الجديد مع ميزات AI - باستخدام ID فقط
 */
export function getSmartArticleLink(article: any): string {
  // 🛡️ Guard Clause: التحقق من وجود المقال
  if (!article) {
    console.warn(
      "getSmartArticleLink: Article is missing. Returning fallback link.",
      { article }
    );
    return "/";
  }

  // استخدام ID فقط - منع مشاكل React #130 من الروابط العربية
  const identifier = getArticleIdentifier(article);

  if (!identifier) {
    console.warn(
      "getSmartArticleLink: Could not generate identifier. Returning fallback link.",
      { article }
    );
    return "/";
  }

  // التحقق من نوع المقال
  const isOpinionArticle =
    article.category?.slug === "opinion" ||
    article.category?.name === "رأي" ||
    article.category_name === "رأي" ||
    article.type === "OPINION" ||
    article.article_type === "opinion" ||
    article.is_opinion === true;

  // إرجاع المسار الذكي المناسب - استخدام ID فقط
  if (isOpinionArticle) {
    return `/opinion/${identifier}`;
  }

  // جميع المقالات الأخرى تذهب للتصميم العادي (إزالة smart-page مؤقتاً لحل المشاكل)
  return `/news/${identifier}`;
}

// Force rebuild - 2025-01-04

/**
 * تنسيق حجم الملف بوحدات قابلة للقراءة
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 بايت";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت", "تيرابايت"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
