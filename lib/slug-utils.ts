/**
 * تحويل النص العربي إلى slug صديق لمحركات البحث
 */
export function generateSlug(text: string): string {
  // إزالة التشكيل العربي
  const withoutDiacritics = text.replace(/[\u064B-\u065F\u0670]/g, "");

  // استبدال الأحرف الخاصة
  const replacements: { [key: string]: string } = {
    أ: "a",
    إ: "e",
    آ: "a",
    ا: "a",
    ب: "b",
    ت: "t",
    ث: "th",
    ج: "j",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "dh",
    ر: "r",
    ز: "z",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "d",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "q",
    ك: "k",
    ل: "l",
    م: "m",
    ن: "n",
    ه: "h",
    و: "w",
    ي: "y",
    ى: "a",
    ة: "h",
    ء: "a",
    ئ: "e",
    ؤ: "o",
    " ": "-",
  };

  // تحويل الأحرف العربية
  let slug = withoutDiacritics
    .split("")
    .map((char) => replacements[char] || char)
    .join("");

  // تنظيف النص
  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // استبدال الأحرف غير المسموحة
    .replace(/-+/g, "-") // دمج الشرطات المتعددة
    .replace(/^-|-$/g, ""); // إزالة الشرطات من البداية والنهاية

  // قص الطول إذا كان طويلاً جداً
  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-[^-]*$/, "");
  }

  return slug || "article";
}

/**
 * توليد معرف فريد قصير للمقالات
 * يستخدم تاريخ وأحرف عشوائية لضمان الفرادة
 * مثال: "art-2024-abcd123"
 */
export function generateUniqueId(prefix: string = "art"): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // توليد جزء عشوائي قصير
  const randomPart = Math.random().toString(36).substring(2, 9);

  // إنشاء المعرف النهائي
  return `${prefix}-${year}${month}-${randomPart}`;
}

/**
 * تحويل معرف المقال إلى رابط - تجنب الروابط العربية لحل مشاكل React #130
 * يستخدم ID فقط لضمان الاستقرار والتوافق
 */
export function getArticleIdentifier(article: {
  id?: string;
  slug?: string;
  title?: string;
}): string {
  // أولوية للـ UUID دائماً - أكثر استقراراً ومنع مشاكل React #130
  if (article.id && article.id.length === 36 && article.id.includes("-")) {
    return article.id;
  }

  // التحقق من معرف المقال الجديد بصيغة article_timestamp_random
  if (article.id && /^article_\d+_[a-z0-9]+$/.test(article.id)) {
    return article.id;
  }

  // إذا كان هناك ID رقمي، استخدمه
  if (article.id && /^\d+$/.test(article.id)) {
    return article.id;
  }

  // تجنب الـ slugs العربية تماماً - تسبب مشاكل في الـ routing وReact errors
  // استخدام ID فقط لضمان عدم تعارض الأحرف العربية مع React rendering

  // إذا لم يكن هناك ID صحيح، ولّد معرف جديد
  return generateUniqueId();
}

/**
 * توليد slug فريد بإضافة رقم عشوائي
 */
export function generateUniqueSlug(text: string): string {
  const baseSlug = generateSlug(text);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * التحقق من صلاحية slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * تنظيف slug موجود
 */
export function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
