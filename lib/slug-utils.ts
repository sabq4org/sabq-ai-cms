/**
 * تحويل النص العربي إلى slug صديق لمحركات البحث
 */
export function generateSlug(text: string): string {
  // إزالة التشكيل العربي
  const withoutDiacritics = text.replace(/[\u064B-\u065F\u0670]/g, '');
  
  // استبدال الأحرف الخاصة
  const replacements: { [key: string]: string } = {
    'أ': 'a', 'إ': 'e', 'آ': 'a', 'ا': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'h', 'ء': 'a', 'ئ': 'e', 'ؤ': 'o',
    ' ': '-'
  };
  
  // تحويل الأحرف العربية
  let slug = withoutDiacritics.split('').map(char => 
    replacements[char] || char
  ).join('');
  
  // تنظيف النص
  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // استبدال الأحرف غير المسموحة
    .replace(/-+/g, '-') // دمج الشرطات المتعددة
    .replace(/^-|-$/g, ''); // إزالة الشرطات من البداية والنهاية
  
  // قص الطول إذا كان طويلاً جداً
  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-[^-]*$/, '');
  }
  
  return slug || 'article';
}

/**
 * توليد معرف فريد قصير للمقالات
 * يستخدم تاريخ وأحرف عشوائية لضمان الفرادة
 * مثال: "art-2024-abcd123"
 */
export function generateUniqueId(prefix: string = 'art'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // توليد جزء عشوائي قصير
  const randomPart = Math.random().toString(36).substring(2, 9);
  
  // إنشاء المعرف النهائي
  return `${prefix}-${year}${month}-${randomPart}`;
}

/**
 * تحويل معرف المقال إلى رابط
 * يفضل استخدام المعرف الفريد UUID بدلاً من slug العربي
 */
export function getArticleIdentifier(article: { id?: string; slug?: string; title?: string }): string {
  // أولوية للـ UUID دائماً - أكثر استقراراً من الروابط العربية
  if (article.id && article.id.length === 36 && article.id.includes('-')) {
    return article.id;
  }
  
  // ثانياً: التحقق من وجود معرف فريد في slug
  if (article.slug && /^art-\d{6}-[a-z0-9]{7}$/.test(article.slug)) {
    return article.slug;
  }
  
  // إذا كان المقال له slug إنجليزي صحيح (بدون عربي)، استخدمه
  if (article.slug && /^[a-z0-9-]+$/.test(article.slug) && !/[\u0600-\u06FF]/.test(article.slug)) {
    return article.slug;
  }
  
  // خلاف ذلك، ولّد معرف جديد
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
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
} 