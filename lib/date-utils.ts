// دوال مساعدة للتاريخ - بالتقويم الميلادي فقط

export interface DateFormatOptions {
  includeTime?: boolean;
  format?: 'short' | 'medium' | 'long' | 'full';
  timeZone?: string;
}

/**
 * تنسيق التاريخ بالتقويم الميلادي باللغة العربية
 */
export function formatDate(date: Date | string, options: DateFormatOptions = {}): string {
  const {
    includeTime = false,
    format = 'medium',
    timeZone = 'Asia/Riyadh'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'تاريخ غير صحيح';
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    calendar: 'gregory', // التقويم الميلادي
    numberingSystem: 'latn', // الأرقام اللاتينية
  };

  // إعداد تنسيق التاريخ
  if (format === 'short') {
    dateOptions.year = 'numeric';
    dateOptions.month = 'numeric';
    dateOptions.day = 'numeric';
  } else if (format === 'medium') {
    dateOptions.year = 'numeric';
    dateOptions.month = 'short';
    dateOptions.day = 'numeric';
  } else if (format === 'long') {
    dateOptions.year = 'numeric';
    dateOptions.month = 'long';
    dateOptions.day = 'numeric';
    dateOptions.weekday = 'long';
  } else if (format === 'full') {
    dateOptions.year = 'numeric';
    dateOptions.month = 'long';
    dateOptions.day = 'numeric';
    dateOptions.weekday = 'long';
  }

  // إضافة الوقت إذا كان مطلوباً
  if (includeTime) {
    dateOptions.hour = '2-digit';
    dateOptions.minute = '2-digit';
    dateOptions.hour12 = true;
  }

  return dateObj.toLocaleDateString('ar-SA', dateOptions);
}

/**
 * تنسيق التاريخ والوقت معاً
 */
export function formatDateTime(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  return formatDate(date, { includeTime: true, format });
}

/**
 * تنسيق التاريخ بشكل مختصر (رقمي)
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'تاريخ غير صحيح';
  }

  return dateObj.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    calendar: 'gregory',
    numberingSystem: 'latn'
  });
}

/**
 * تنسيق التاريخ النسبي (منذ كم من الوقت)
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'الآن';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} دقيقة`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ساعة`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} يوم`;
  } else {
    return formatDate(dateObj, { format: 'short' });
  }
}

/**
 * تنسيق الوقت فقط
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'وقت غير صحيح';
  }

  return dateObj.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh'
  });
}

/**
 * تحويل التاريخ إلى نص قابل للقراءة
 */
export function formatDateReadable(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const targetDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

  if (targetDate.getTime() === today.getTime()) {
    return `اليوم، ${formatTime(dateObj)}`;
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return `أمس، ${formatTime(dateObj)}`;
  } else if (now.getTime() - targetDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return dateObj.toLocaleDateString('ar-SA', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      calendar: 'gregory',
      numberingSystem: 'latn'
    });
  } else {
    return formatDateTime(dateObj, 'medium');
  }
}

/**
 * الحصول على التاريخ الحالي بالميلادي
 */
export function getCurrentDate(): string {
  return formatDate(new Date(), { format: 'long' });
}

/**
 * الحصول على التاريخ والوقت الحالي
 */
export function getCurrentDateTime(): string {
  return formatDateTime(new Date(), 'long');
}

/**
 * دالة formatFullDate للتوافق مع الملفات القديمة
 */
export function formatFullDate(date: Date | string): string {
  return formatDateTime(date, 'long');
}

/**
 * دالة formatDateOnly للتوافق مع الملفات القديمة
 */
export function formatDateOnly(date: Date | string): string {
  return formatDate(date, { format: 'long' });
} 