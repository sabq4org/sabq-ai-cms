// دالة منطق عرض الإعلان المحدث
export function shouldDisplayAd(ad: {
  is_always_on: boolean;
  start_date: Date;
  end_date: Date;
  max_views: number | null;
  views_count: number;
  is_active: boolean;
}): boolean {
  // إذا كان الإعلان غير نشط
  if (!ad.is_active) {
    return false;
  }

  // إذا كان إعلان دائم
  if (ad.is_always_on) {
    // التحقق من الحد الأقصى للمشاهدات
    if (ad.max_views !== null && ad.views_count >= ad.max_views) {
      return false;
    }
    return true;
  }

  // للإعلانات المحدودة بالوقت
  const now = new Date();
  const isInDateRange = now >= ad.start_date && now <= ad.end_date;

  // التحقق من الحد الأقصى للمشاهدات
  const isUnderMaxViews =
    ad.max_views === null || ad.views_count < ad.max_views;

  return isInDateRange && isUnderMaxViews;
}

// تحديد حالة الإعلان للعرض في الواجهة
export function getAdStatus(ad: {
  is_always_on: boolean;
  start_date: Date;
  end_date: Date;
  max_views: number | null;
  views_count: number;
  is_active: boolean;
}): "active" | "expired" | "upcoming" | "exhausted" | "disabled" {
  if (!ad.is_active) {
    return "disabled";
  }

  // التحقق من استنفاد المشاهدات
  if (ad.max_views !== null && ad.views_count >= ad.max_views) {
    return "exhausted";
  }

  // للإعلانات الدائمة
  if (ad.is_always_on) {
    return "active";
  }

  // للإعلانات المحدودة بالوقت
  const now = new Date();

  if (now < ad.start_date) {
    return "upcoming";
  }

  if (now > ad.end_date) {
    return "expired";
  }

  return "active";
}

// رسائل الحالة بالعربية
export const AD_STATUS_MESSAGES = {
  active: "نشط",
  expired: "منتهي",
  upcoming: "قادم",
  exhausted: "مستنفد",
  disabled: "معطل",
} as const;

// أيقونات الحالة
export const AD_STATUS_ICONS = {
  active: "🟢",
  expired: "🔴",
  upcoming: "🟡",
  exhausted: "⭕",
  disabled: "⚫",
} as const;
