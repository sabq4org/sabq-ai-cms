/**
 * 🗓️ نظام التاريخ الموحد - سبق الذكية
 * التاريخ المعتمد في الواجهة هو الميلادي فقط، بصيغة عربية (d MMMM yyyy)
 * مثال: 13 يوليو 2025
 */

/**
 * ✅ دالة تنسيق التاريخ الميلادي الموحدة (باللغة العربية)
 * تعرض التاريخ بصيغة: "13 يوليو 2025" 
 */
export function formatDateGregorian(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // تحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // أسماء الأشهر باللغة العربية
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ الميلادي:', error);
    return '';
  }
}

/**
 * 📅 دالة التاريخ الكامل للاستخدام في واجهة المقالات
 * تعرض: "13 يوليو 2025"
 */
export function formatFullDate(dateString: string | undefined): string {
  return formatDateGregorian(dateString);
}

/**
 * ⏰ دالة التاريخ النسبي للاستخدام في الكروت
 * تعرض: "منذ ساعتين" أو "13 يوليو 2025" للتواريخ القديمة
 */
export function formatRelativeDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // للتواريخ الحديثة (أقل من 24 ساعة)
    if (diffHours < 1) return 'منذ أقل من ساعة';
    if (diffHours < 24) return `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    
    // للتواريخ الأقدم، نعرض التاريخ الكامل
    return formatDateGregorian(dateString);
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ النسبي:', error);
    return formatDateGregorian(dateString);
  }
}

/**
 * ⏱️ دالة للتاريخ مع الوقت
 * تعرض: "13 يوليو 2025 الساعة 14:30"
 */
export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const formattedDate = formatDateGregorian(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${formattedDate} الساعة ${hours}:${minutes}`;
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ والوقت:', error);
    return formatDateGregorian(dateString);
  }
}

/**
 * 📆 دالة تنسيق مختصر للتاريخ (بدون السنة إذا كانت نفس السنة الحالية)
 * تعرض: "13 يوليو" أو "13 يوليو 2024" 
 */
export function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // إذا كانت نفس السنة الحالية، لا نعرض السنة
    if (year === now.getFullYear()) {
      return `${day} ${month}`;
    }
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ المختصر:', error);
    return '';
  }
}

/**
 * ☀️ فحص إذا كان التاريخ اليوم
 */
export function isToday(dateString: string): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString();
  } catch {
    return false;
  }
}

/**
 * � دالة للوقت فقط
 * تعرض: "14:30"
 */
export function formatTimeOnly(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('خطأ في تنسيق الوقت:', error);
    return '';
  }
}

/**
 * 🔍 فحص صحة التاريخ
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
