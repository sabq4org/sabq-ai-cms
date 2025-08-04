/**
 * مكتبة مساعدة لتنسيق الأرقام بالنظام الغربي
 * Number formatting utilities for Western numerals
 */

import {
  convertToWesternNumerals,
  formatLargeNumber,
  formatNumber,
  isValidNumber,
} from "./config/localization";

/**
 * تنسيق عدد المشاهدات
 * Format view count
 */
export function formatViewsCount(count: number): string {
  if (!isValidNumber(count) || count < 0) {
    return "0";
  }

  return formatLargeNumber(count);
}

/**
 * تنسيق عدد الإعجابات
 * Format likes count
 */
export function formatLikesCount(count: number): string {
  if (!isValidNumber(count) || count < 0) {
    return "0";
  }

  return formatLargeNumber(count);
}

/**
 * تنسيق عدد التعليقات
 * Format comments count
 */
export function formatCommentsCount(count: number): string {
  if (!isValidNumber(count) || count < 0) {
    return "0";
  }

  return formatLargeNumber(count);
}

/**
 * تنسيق إحصائيات لوحة التحكم
 * Format dashboard statistics
 */
export function formatDashboardStat(value: number): string {
  if (!isValidNumber(value) || value < 0) {
    return "0";
  }

  return formatNumber(value, { useThousandSeparator: true });
}

/**
 * تنسيق الأرقام للعرض في الجداول
 * Format numbers for table display
 */
export function formatTableNumber(value: number, decimals: number = 0): string {
  if (!isValidNumber(value)) {
    return "-";
  }

  return formatNumber(value, {
    useThousandSeparator: true,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * تنسيق النسب المئوية
 * Format percentages
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (!isValidNumber(value)) {
    return "0%";
  }

  const formattedValue = formatNumber(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${formattedValue}%`;
}

/**
 * تنسيق المبالغ المالية
 * Format currency amounts
 */
export function formatCurrency(
  amount: number,
  currency: string = "ريال"
): string {
  if (!isValidNumber(amount)) {
    return `0 ${currency}`;
  }

  const formattedAmount = formatNumber(amount, {
    useThousandSeparator: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formattedAmount} ${currency}`;
}

/**
 * تحويل النص المحتوي على أرقام عربية إلى غربية
 * Convert text containing Arabic numerals to Western numerals
 */
export function convertTextNumerals(text: string): string {
  return convertToWesternNumerals(text);
}

/**
 * تنسيق أرقام الهاتف
 * Format phone numbers
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // إزالة كل شيء عدا الأرقام
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  // تحويل للأرقام الغربية
  const westernNumber = convertToWesternNumerals(cleanNumber);

  // تنسيق الرقم السعودي
  if (westernNumber.startsWith("966")) {
    return `+${westernNumber.substring(0, 3)} ${westernNumber.substring(
      3,
      5
    )} ${westernNumber.substring(5, 8)} ${westernNumber.substring(8)}`;
  } else if (westernNumber.startsWith("05") && westernNumber.length === 10) {
    return `${westernNumber.substring(0, 3)} ${westernNumber.substring(
      3,
      6
    )} ${westernNumber.substring(6)}`;
  }

  return westernNumber;
}

/**
 * تنسيق معرف المقال أو المستخدم
 * Format article or user ID
 */
export function formatId(id: number | string): string {
  const numId = typeof id === "string" ? parseInt(id) : id;

  if (!isValidNumber(numId)) {
    return "غير محدد";
  }

  return `#${formatNumber(numId)}`;
}

/**
 * تنسيق الوقت بالثواني لعرض مدة القراءة
 * Format reading time in seconds
 */
export function formatReadingTime(seconds: number): string {
  if (!isValidNumber(seconds) || seconds < 0) {
    return "0 ثانية";
  }

  if (seconds < 60) {
    return `${formatNumber(Math.round(seconds))} ثانية`;
  }

  const minutes = Math.round(seconds / 60);
  return `${formatNumber(minutes)} دقيقة`;
}

/**
 * تنسيق حجم الملف
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (!isValidNumber(bytes) || bytes < 0) {
    return "0 بايت";
  }

  const units = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formattedSize = formatNumber(size, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  });

  return `${formattedSize} ${units[unitIndex]}`;
}
