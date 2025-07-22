// نظام الجرعات الذكية حسب التوقيت والمزاج
export interface DoseTimingConfig {
  timeSlot: 'morning' | 'noon' | 'evening' | 'night';
  mood: string;
  contentFocus: string[];
  tone: string;
  maxItems: number;
  excludeTopics?: string[];
}

export const DOSE_TIMING_CONFIGS: Record<string, DoseTimingConfig> = {
  // 🌅 جرعة الصباح: طاقة وحماس
  morning: {
    timeSlot: 'morning',
    mood: 'energetic',
    contentFocus: [
      'أخبار إيجابية',
      'إنجازات سعودية', 
      'فرص استثمارية',
      'تطورات تقنية',
      'نصائح مهنية',
      'طقس اليوم'
    ],
    tone: 'محفز ونشيط',
    maxItems: 5,
    excludeTopics: ['حوادث', 'وفيات', 'أزمات']
  },

  // ☀️ جرعة الظهر: عاجل ومهم
  noon: {
    timeSlot: 'noon',
    mood: 'focused',
    contentFocus: [
      'أخبار عاجلة',
      'ملخص صباح اليوم',
      'تحديثات الأسواق',
      'قرارات حكومية',
      'أخبار محلية مهمة'
    ],
    tone: 'مباشر ومركز',
    maxItems: 6,
    excludeTopics: []
  },

  // 🌆 جرعة المساء: تحليل وإلهام  
  evening: {
    timeSlot: 'evening',
    mood: 'reflective',
    contentFocus: [
      'تحليلات خفيفة',
      'قصص ملهمة',
      'ثقافة وفنون',
      'ملخص أهم أحداث اليوم',
      'رياضة ومنوعات'
    ],
    tone: 'هادئ ومتأمل',
    maxItems: 4,
    excludeTopics: ['أخبار عاجلة مؤلمة']
  },

  // 🌙 جرعة قبل النوم: هدوء وإيجابية
  night: {
    timeSlot: 'night', 
    mood: 'calm',
    contentFocus: [
      'ملخص هادئ لليوم',
      'أخبار إيجابية',
      'نصائح صحية',
      'حكم ومقولات',
      'طقس الغد'
    ],
    tone: 'هادئ ومطمئن',
    maxItems: 3,
    excludeTopics: ['حوادث', 'أزمات', 'أخبار صادمة', 'تقلبات أسواق']
  }
};

// تحديد التوقيت الحالي
export function getCurrentTimeSlot(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'noon'; 
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// فلترة المحتوى حسب التوقيت
export function filterContentByTiming(articles: any[], timeSlot: string) {
  const config = DOSE_TIMING_CONFIGS[timeSlot];
  if (!config) return articles;

  return articles.filter(article => {
    // استبعاد المواضيع المحظورة
    if (config.excludeTopics?.length) {
      const hasExcludedTopic = config.excludeTopics.some(topic => 
        article.title?.includes(topic) || 
        article.excerpt?.includes(topic) ||
        article.category_name?.includes(topic)
      );
      if (hasExcludedTopic) return false;
    }

    // إعطاء أولوية للمواضيع المركزة
    const hasFocusedContent = config.contentFocus.some(focus =>
      article.title?.includes(focus) ||
      article.excerpt?.includes(focus) ||
      article.category_name?.includes(focus)
    );

    return hasFocusedContent;
  }).slice(0, config.maxItems);
}
