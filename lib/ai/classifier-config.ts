/**
 * 🔧 إعدادات نظام التصنيف الذكي
 * ملف التكوين الرئيسي لتخصيص سلوك النظام
 */

export const CLASSIFIER_CONFIG = {
  // إعدادات عامة
  ENABLED: true,
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  
  // إعدادات التصنيف
  CLASSIFICATION: {
    // استخدام التصنيف الذكي المتقدم (قادم قريباً)
    USE_AI_CLASSIFICATION: false,
    
    // الحد الأدنى لمستوى الثقة لقبول التصنيف
    MIN_CONFIDENCE_THRESHOLD: 0.6,
    
    // الحد الأدنى لنقاط الجودة
    MIN_QUALITY_SCORE: 50,
    
    // عدد الاقتراحات القصوى
    MAX_SUGGESTIONS: 5,
    
    // تطبيق التصنيف تلقائياً
    AUTO_APPLY_CLASSIFICATION: false,
    
    // حفظ نتائج التصنيف في قاعدة البيانات
    SAVE_CLASSIFICATION_RESULTS: true
  },
  
  // إعدادات تحليل الجودة
  QUALITY_ANALYSIS: {
    // الحد الأدنى لطول المحتوى (بالكلمات)
    MIN_CONTENT_LENGTH: 50,
    
    // الحد الأدنى لطول العنوان (بالأحرف)
    MIN_TITLE_LENGTH: 10,
    
    // نقاط إضافية للمقالات الطويلة
    LONG_ARTICLE_BONUS: 10,
    
    // عدد الكلمات المفتاحية المطلوبة
    REQUIRED_KEYWORDS_COUNT: 3,
    
    // وزن العنوان في التصنيف
    TITLE_WEIGHT: 0.3,
    
    // وزن المحتوى في التصنيف
    CONTENT_WEIGHT: 0.7
  },
  
  // إعدادات التحليل الإقليمي
  REGIONAL_ANALYSIS: {
    // تفعيل تحليل الصلة الإقليمية
    ENABLED: true,
    
    // الحد الأدنى للصلة الإقليمية
    MIN_REGIONAL_RELEVANCE: 0.1,
    
    // نقاط إضافية للمحتوى المحلي
    LOCAL_CONTENT_BONUS: 15,
    
    // قائمة المناطق المدعومة
    SUPPORTED_REGIONS: [
      'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان',
      'الأردن', 'لبنان', 'سوريا', 'العراق', 'فلسطين',
      'مصر', 'ليبيا', 'تونس', 'الجزائر', 'المغرب', 'السودان',
      'اليمن', 'الصومال', 'جيبوتي', 'موريتانيا'
    ]
  },
  
  // إعدادات الواجهة
  UI_SETTINGS: {
    // عرض تفاصيل التصنيف بشكل افتراضي
    SHOW_DETAILS_BY_DEFAULT: true,
    
    // تفعيل التصنيف التلقائي في الواجهة
    AUTO_CLASSIFY_ON_LOAD: false,
    
    // عرض مؤشرات الأداء
    SHOW_PERFORMANCE_INDICATORS: true,
    
    // عرض الاقتراحات
    SHOW_SUGGESTIONS: true,
    
    // ألوان التصنيفات
    CATEGORY_COLORS: {
      'سياسي': '#3B82F6',      // أزرق
      'اقتصادي': '#10B981',     // أخضر
      'رياضي': '#F59E0B',      // برتقالي
      'ثقافي': '#8B5CF6',      // بنفسجي
      'تقني': '#06B6D4',       // سماوي
      'اجتماعي': '#EF4444',    // أحمر
      'صحي': '#84CC16',        // أخضر فاتح
      'ترفيهي': '#F97316',     // برتقالي داكن
      'تعليمي': '#6366F1',     // نيلي
      'بيئي': '#22C55E'        // أخضر داكن
    }
  },
  
  // إعدادات الأداء
  PERFORMANCE: {
    // مهلة زمنية للتصنيف (بالثواني)
    CLASSIFICATION_TIMEOUT: 30,
    
    // حجم الذاكرة المؤقتة للنتائج
    CACHE_SIZE: 100,
    
    // مدة صالحية الذاكرة المؤقتة (بالدقائق)
    CACHE_TTL: 60,
    
    // تأخير بين العمليات المتتالية (بالمللي ثانية)
    BATCH_PROCESSING_DELAY: 500,
    
    // حد أقصى للمعالجة المتوازية
    MAX_CONCURRENT_OPERATIONS: 5
  },
  
  // إعدادات API
  API_SETTINGS: {
    // تفعيل تسجيل العمليات
    ENABLE_LOGGING: true,
    
    // حد أقصى لحجم الطلب (بالكيلوبايت)
    MAX_REQUEST_SIZE: 1024,
    
    // معدل الطلبات المسموح (طلبات/دقيقة)
    RATE_LIMIT: 60,
    
    // مفاتيح API المطلوبة
    REQUIRE_API_KEY: false,
    
    // إرجاع تفاصيل مفصلة في الاستجابة
    RETURN_DETAILED_RESPONSE: true
  },
  
  // إعدادات التطوير والاختبار
  DEVELOPMENT: {
    // تفعيل وضع المحاكاة
    MOCK_MODE: false,
    
    // تأخير مصطنع للاختبار (بالمللي ثانية)
    MOCK_DELAY: 1000,
    
    // نتائج مُعرفة مسبقاً للاختبار
    MOCK_RESULTS: {
      'نص تجريبي': {
        mainCategory: 'تقني',
        subCategory: 'ذكاء اصطناعي',
        confidence: 0.85,
        qualityScore: 78,
        regionRelevance: 0.6,
        suggestions: ['هذا نص تجريبي للاختبار']
      }
    },
    
    // عرض وقت التنفيذ في النتائج
    SHOW_EXECUTION_TIME: true,
    
    // حفظ سجلات مفصلة
    VERBOSE_LOGGING: true
  }
};

/**
 * دالة مساعدة للحصول على إعداد محدد
 */
export function getConfig(path: string, defaultValue?: any) {
  const keys = path.split('.');
  let current: any = CLASSIFIER_CONFIG;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current !== undefined ? current : defaultValue;
}

/**
 * دالة للتحقق من تفعيل ميزة معينة
 */
export function isFeatureEnabled(feature: string): boolean {
  return getConfig(feature, false) === true;
}

/**
 * دالة للحصول على لون التصنيف
 */
export function getCategoryColor(category: string): string {
  return getConfig(`UI_SETTINGS.CATEGORY_COLORS.${category}`, '#6B7280');
}

/**
 * دالة للتحقق من صحة إعدادات التصنيف
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // التحقق من الحد الأدنى للثقة
  const minConfidence = getConfig('CLASSIFICATION.MIN_CONFIDENCE_THRESHOLD');
  if (minConfidence < 0 || minConfidence > 1) {
    errors.push('MIN_CONFIDENCE_THRESHOLD يجب أن يكون بين 0 و 1');
  }
  
  // التحقق من نقاط الجودة
  const minQuality = getConfig('QUALITY_ANALYSIS.MIN_QUALITY_SCORE');
  if (minQuality < 0 || minQuality > 100) {
    errors.push('MIN_QUALITY_SCORE يجب أن يكون بين 0 و 100');
  }
  
  // التحقق من أوزان التصنيف
  const titleWeight = getConfig('QUALITY_ANALYSIS.TITLE_WEIGHT');
  const contentWeight = getConfig('QUALITY_ANALYSIS.CONTENT_WEIGHT');
  if (Math.abs((titleWeight + contentWeight) - 1) > 0.01) {
    errors.push('مجموع TITLE_WEIGHT و CONTENT_WEIGHT يجب أن يساوي 1');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default CLASSIFIER_CONFIG;
