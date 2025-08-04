/**
 * مكتبة مساعدة لتنسيق التواريخ بالتقويم الميلادي والأرقام الغربية
 * Date utilities library for Gregorian calendar with Western numerals
 */

import { format, isValid, parseISO } from "date-fns";
import {
  LOCALIZATION_CONFIG,
  convertToWesternNumerals,
  formatNumber,
} from "./config/localization";

export function formatDateArabic(dateString: string): string {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);

    if (!isValid(date)) {
      return "تاريخ غير صحيح";
    }

    // أسماء الأشهر الميلادية بالعربية
    const gregorianMonthsArabic = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    // أسماء الأيام بالعربية
    const arabicDays = [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];

    const day = date.getDate();
    const month = gregorianMonthsArabic[date.getMonth()];
    const year = date.getFullYear();
    const dayName = arabicDays[date.getDay()];

    // استخدام الأرقام الغربية
    const formattedDay = formatNumber(day);
    const formattedYear = formatNumber(year);

    return `${dayName}، ${formattedDay} ${month} ${formattedYear}`;
  } catch (error) {
    console.error("خطأ في تنسيق التاريخ:", error);
    return "تاريخ غير صحيح";
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);

    if (!isValid(date)) {
      return "تاريخ غير صحيح";
    }

    const gregorianMonthsArabic = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    const day = date.getDate();
    const month = gregorianMonthsArabic[date.getMonth()];
    const year = date.getFullYear();

    // استخدام الأرقام الغربية
    const formattedDay = formatNumber(day);
    const formattedYear = formatNumber(year);

    return `${formattedDay} ${month} ${formattedYear}`;
  } catch (error) {
    console.error("خطأ في تنسيق التاريخ:", error);
    return "تاريخ غير صحيح";
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);

    if (!isValid(date)) {
      return "تاريخ غير صحيح";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "منذ لحظات";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      const formattedMinutes = formatNumber(diffInMinutes);
      return `منذ ${formattedMinutes} دقيقة${diffInMinutes > 1 ? "" : ""}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      const formattedHours = formatNumber(diffInHours);
      return `منذ ${formattedHours} ساعة${diffInHours > 1 ? "" : ""}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      const formattedDays = formatNumber(diffInDays);
      return `منذ ${formattedDays} يوم${diffInDays > 1 ? "" : ""}`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      const formattedWeeks = formatNumber(diffInWeeks);
      return `منذ ${formattedWeeks} أسبوع${diffInWeeks > 1 ? "" : ""}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      const formattedMonths = formatNumber(diffInMonths);
      return `منذ ${formattedMonths} شهر${diffInMonths > 1 ? "" : ""}`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    const formattedYears = formatNumber(diffInYears);
    return `منذ ${formattedYears} سنة${diffInYears > 1 ? "" : ""}`;
  } catch (error) {
    console.error("خطأ في حساب الوقت المنقضي:", error);
    return "تاريخ غير صحيح";
  }
}

export function isToday(dateString: string): boolean {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);
    const today = new Date();

    return (
      isValid(date) &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
}

export function isYesterday(dateString: string): boolean {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
      isValid(date) &&
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  } catch (error) {
    return false;
  }
}

export function formatSmartDate(dateString: string): string {
  if (isToday(dateString)) {
    return "اليوم";
  }

  if (isYesterday(dateString)) {
    return "أمس";
  }

  const timeAgo = formatTimeAgo(dateString);
  if (timeAgo.includes("منذ") && !timeAgo.includes("سنة")) {
    return timeAgo;
  }

  return formatDateShort(dateString);
}

/**
 * تنسيق التاريخ بالشكل الكامل (للتوافق مع الملفات الموجودة)
 */
export function formatFullDate(dateString: string): string {
  return formatDateArabic(dateString);
}

/**
 * تنسيق التاريخ النسبي (للتوافق مع الملفات الموجودة)
 */
export function formatRelativeDate(dateString: string): string {
  return formatSmartDate(dateString);
}

/**
 * تنسيق التاريخ الميلادي (محدث للأرقام الغربية)
 * Gregorian date formatting with Western numerals
 */
export function formatDateGregorian(dateString: string): string {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);

    if (!isValid(date)) {
      return "تاريخ غير صحيح";
    }

    // استخدام date-fns مع التنسيق المطلوب
    const formattedDate = format(date, LOCALIZATION_CONFIG.FORMATS.FULL_DATE);

    // تحويل للأرقام الغربية إذا كان مطلوباً
    return LOCALIZATION_CONFIG.NUMBERS.USE_WESTERN_NUMERALS
      ? convertToWesternNumerals(formattedDate)
      : formattedDate;
  } catch (error) {
    console.error("خطأ في تنسيق التاريخ الميلادي:", error);
    return "تاريخ غير صحيح";
  }
}

/**
 * تنسيق التاريخ مع الوقت
 * Format date with time
 */
export function formatDateTime(
  dateString: string,
  use24Hour: boolean = true
): string {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);

    if (!isValid(date)) {
      return "تاريخ غير صحيح";
    }

    const timeFormat = use24Hour
      ? LOCALIZATION_CONFIG.FORMATS.TIME_24H
      : LOCALIZATION_CONFIG.FORMATS.TIME_12H;
    const formattedDateTime = format(
      date,
      `${LOCALIZATION_CONFIG.FORMATS.FULL_DATE} ${timeFormat}`
    );

    return LOCALIZATION_CONFIG.NUMBERS.USE_WESTERN_NUMERALS
      ? convertToWesternNumerals(formattedDateTime)
      : formattedDateTime;
  } catch (error) {
    console.error("خطأ في تنسيق التاريخ والوقت:", error);
    return "تاريخ غير صحيح";
  }
}

/**
 * تنسيق الوقت فقط
 * Format time only
 */
export function formatTime(
  dateString: string,
  use24Hour: boolean = true
): string {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);

    if (!isValid(date)) {
      return "وقت غير صحيح";
    }

    const timeFormat = use24Hour
      ? LOCALIZATION_CONFIG.FORMATS.TIME_24H
      : LOCALIZATION_CONFIG.FORMATS.TIME_12H;
    const formattedTime = format(date, timeFormat);

    return LOCALIZATION_CONFIG.NUMBERS.USE_WESTERN_NUMERALS
      ? convertToWesternNumerals(formattedTime)
      : formattedTime;
  } catch (error) {
    console.error("خطأ في تنسيق الوقت:", error);
    return "وقت غير صحيح";
  }
}
