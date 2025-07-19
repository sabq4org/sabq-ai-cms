/**
 * دالة تنسيق التاريخ الثابتة لتجنب مشاكل الهيدريشن في Next.js
 * تضمن نفس النتيجة على الخادم والعميل
 */

interface DateFormatOptions {
  includeYear?: boolean;
  includeTime?: boolean;
  format?: 'full' | 'short' | 'minimal';
}

/**
 * تنسيق التاريخ بطريقة ثابتة لتجنب اختلافات الهيدريشن
 */
export function formatDate(dateString: string | undefined, options: DateFormatOptions = {}): string {
  if (!dateString) return 'اليوم';
  
  const { includeYear = false, includeTime = false, format = 'short' } = options;
  
  try {
    const date = new Date(dateString);
    
    // تحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // للتواريخ الحديثة، نعرض نص نسبي
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7 && format !== 'full') return `منذ ${diffDays} أيام`;
    
    // تنسيق ثابت للتاريخ
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // تنسيق قصير بدون فاصلة لتجنب مشاكل الهيدريشن
    let formattedDate = `${day} ${month}`;
    
    if (includeYear || year !== now.getFullYear()) {
      formattedDate += ` ${year}`;
    }
    
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      formattedDate += ` ${hours}:${minutes}`;
    }
    
    return formattedDate;
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ:', error);
    return 'تاريخ غير صحيح';
  }
}

/**
 * تنسيق التاريخ للعرض المختصر (يوم وشهر فقط)
 */
export function formatDateShort(dateString: string | undefined): string {
  return formatDate(dateString, { format: 'short' });
}

/**
 * تنسيق التاريخ مع السنة
 */
export function formatDateWithYear(dateString: string | undefined): string {
  return formatDate(dateString, { includeYear: true });
}

/**
 * تنسيق التاريخ مع الوقت
 */
export function formatDateWithTime(dateString: string | undefined): string {
  return formatDate(dateString, { includeTime: true });
}

/**
 * تحويل التاريخ النسبي (منذ x دقائق/ساعات/أيام)
 */
export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return 'غير محدد';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهر`;
    
    return formatDate(dateString, { includeYear: true });
  } catch (error) {
    console.error('خطأ في تنسيق الوقت النسبي:', error);
    return 'غير محدد';
  }
}

/**
 * تنسيق التاريخ بطريقة آمنة مع نص بديل
 */
export function formatDateSafe(
  dateString: string | undefined, 
  format: 'full' | 'short' | 'minimal' = 'short', 
  fallback: string = 'غير محدد'
): string {
  if (!dateString) return fallback;
  
  try {
    const options: DateFormatOptions = {
      format,
      includeYear: format === 'full',
      includeTime: format === 'full'
    };
    
    const result = formatDate(dateString, options);
    return result === 'تاريخ غير صحيح' ? fallback : result;
  } catch (error) {
    console.error('خطأ في formatDateSafe:', error);
    return fallback;
  }
}

/**
 * تنسيق التاريخ والوقت معاً
 */
export function formatDateTime(dateString: string | undefined): string {
  return formatDate(dateString, { includeTime: true, includeYear: true });
}

/**
 * تنسيق التاريخ النسبي المتقدم
 */
export function formatRelativeDate(dateString: string | undefined): string {
  if (!dateString) return 'غير محدد';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهر`;
    
    return `منذ ${Math.floor(diffDays / 365)} سنة`;
  } catch (error) {
    console.error('خطأ في formatRelativeDate:', error);
    return 'غير محدد';
  }
} 