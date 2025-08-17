/**
 * تحويل النص العربي إلى slug إنجليزي فقط - منع الروابط العربية نهائياً
 */
export function generateSlug(text: string): string {
  // إزالة التشكيل العربي
  const withoutDiacritics = text.replace(/[\u064B-\u065F\u0670]/g, "");

  // استبدال الأحرف العربية بمعادلاتها الإنجليزية
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
    // إضافة أرقام عربية
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  // تحويل جميع الأحرف العربية إلى إنجليزية
  let slug = withoutDiacritics
    .split("")
    .map((char) => replacements[char] || char)
    .join("");

  // تنظيف شامل - إزالة أي حرف غير إنجليزي
  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // السماح بالأحرف الإنجليزية والأرقام والشرطات فقط
    .replace(/-+/g, "-") // دمج الشرطات المتعددة
    .replace(/^-+|-+$/g, ""); // إزالة الشرطات من البداية والنهاية

  // التحقق من وجود محتوى إنجليزي صالح
  if (!slug || slug.length < 2 || !/[a-z0-9]/.test(slug)) {
    return ""; // إرجاع فارغ ليتم استخدام nanoid بدلاً منه
  }

  // قص الطول إذا كان طويلاً جداً
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-[^-]*$/, "");
  }

  return slug;
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
 * توليد slug فريد بإضافة رقم عشوائي - إنجليزي فقط
 */
export function generateUniqueSlug(text: string): string {
  const baseSlug = generateSlug(text);
  const randomSuffix = Math.random().toString(36).substring(2, 6);

  // إذا فشل generateSlug في إنتاج محتوى إنجليزي، استخدم nanoid
  if (!baseSlug) {
    return `content-${randomSuffix}`;
  }

  return `${baseSlug}-${randomSuffix}`;
}

/**
 * التحقق من صلاحية slug - إنجليزي فقط
 */
export function isValidSlug(slug: string): boolean {
  // السماح بالأحرف الإنجليزية الصغيرة والأرقام والشرطات فقط
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && !containsArabic(slug);
}

/**
 * تنظيف slug موجود - إزالة أي محتوى عربي
 */
export function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, "") // إزالة جميع الأحرف العربية
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * فحص وجود أحرف عربية في النص
 */
export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * فرض استخدام روابط إنجليزية فقط - منع الروابط العربية نهائياً
 */
export function enforceEnglishSlug(slug: string): string {
  // إذا كان الرابط يحتوي على أحرف عربية، استبدله بـ nanoid
  if (containsArabic(slug)) {
    console.warn(`⚠️ تم منع استخدام رابط عربي: ${slug}`);
    return `content-${Math.random().toString(36).substring(2, 8)}`;
  }

  // تنظيف الرابط ليكون إنجليزي فقط
  const cleaned = cleanSlug(slug);

  // إذا لم يتبقى محتوى صالح بعد التنظيف، استخدم nanoid
  if (!cleaned || cleaned.length < 2) {
    return `content-${Math.random().toString(36).substring(2, 8)}`;
  }

  return cleaned;
}
