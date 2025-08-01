/**
 * مكتبة مساعدة لتنسيق التواريخ باللغة العربية
 */

export function formatDateArabic(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح';
    }

    // أسماء الأشهر بالعربية
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    // أسماء الأيام بالعربية
    const arabicDays = [
      'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
    ];

    const day = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    const dayName = arabicDays[date.getDay()];

    return `${dayName}، ${day} ${month} ${year}`;
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ:', error);
    return 'تاريخ غير صحيح';
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح';
    }

    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const day = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ:', error);
    return 'تاريخ غير صحيح';
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح';
    }

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'منذ لحظات';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة${diffInMinutes > 1 ? '' : ''}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة${diffInHours > 1 ? '' : ''}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `منذ ${diffInDays} يوم${diffInDays > 1 ? '' : ''}`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `منذ ${diffInWeeks} أسبوع${diffInWeeks > 1 ? '' : ''}`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `منذ ${diffInMonths} شهر${diffInMonths > 1 ? '' : ''}`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `منذ ${diffInYears} سنة${diffInYears > 1 ? '' : ''}`;
    
  } catch (error) {
    console.error('خطأ في حساب الوقت المنقضي:', error);
    return 'تاريخ غير صحيح';
  }
}

export function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  } catch (error) {
    return false;
  }
}

export function isYesterday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear();
  } catch (error) {
    return false;
  }
}

export function formatSmartDate(dateString: string): string {
  if (isToday(dateString)) {
    return 'اليوم';
  }
  
  if (isYesterday(dateString)) {
    return 'أمس';
  }
  
  const timeAgo = formatTimeAgo(dateString);
  if (timeAgo.includes('منذ') && !timeAgo.includes('سنة')) {
    return timeAgo;
  }
  
  return formatDateShort(dateString);
}