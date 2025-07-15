/**
 * نظام ربط الاهتمامات - سبق الذكية
 * يتعامل مع تحويل الاهتمامات القديمة إلى التصنيفات الفعلية
 */

// خريطة ربط الاهتمامات المبسطة بالتصنيفات الفعلية
export const INTEREST_TO_CATEGORY_MAPPING: { [key: string]: string } = {
  // اهتمامات متطابقة
  'politics': 'politics',      // السياسة
  'economy': 'economy',        // الاقتصاد  
  'sports': 'sports',          // الرياضة
  'technology': 'technology',   // التقنية
  'tech': 'technology',        // التقنية (مختصر)
  'culture': 'culture',        // الثقافة -> ثقافة ومجتمع
  
  // اهتمامات تحتاج تحويل
  'health': 'misc',           // الصحة -> منوعات
  'travel': 'misc',           // السفر -> منوعات  
  'entertainment': 'misc',     // الترفيه -> منوعات
  'lifestyle': 'misc',        // نمط الحياة -> منوعات
  'food': 'misc',             // طعام -> منوعات
  'fashion': 'misc',          // أزياء -> منوعات
  
  // تصنيفات فعلية إضافية
  'local': 'local',           // محليات
  'opinion': 'opinion',       // مقالات رأي
  'misc': 'misc',             // منوعات
  
  // اهتمامات بالعربية  
  'سياسة': 'politics',
  'اقتصاد': 'economy',
  'رياضة': 'sports', 
  'تقنية': 'technology',
  'تكنولوجيا': 'technology',
  'ثقافة': 'culture',
  'صحة': 'misc',
  'سفر': 'misc',
  'ترفيه': 'misc',
  'محليات': 'local',
  'رأي': 'opinion',
  'منوعات': 'misc'
};

// أسماء التصنيفات المعروضة للمستخدم
export const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  'technology': 'التقنية والذكاء الاصطناعي',
  'sports': 'الرياضة والبطولات',
  'economy': 'الاقتصاد والأعمال',
  'politics': 'السياسة والحكومة',
  'local': 'الأخبار المحلية',
  'culture': 'الثقافة والمجتمع',
  'opinion': 'المقالات والتحليلات',
  'misc': 'منوعات (صحة، سفر، ترفيه)'
};

/**
 * تحويل اهتمام أو قائمة اهتمامات إلى تصنيفات فعلية
 */
export function mapInterestToCategory(interest: string): string {
  const mapped = INTEREST_TO_CATEGORY_MAPPING[interest.toLowerCase()];
  return mapped || 'misc'; // افتراضي: منوعات
}

/**
 * تحويل قائمة اهتمامات إلى تصنيفات فعلية (مع إزالة التكرار)
 */
export function mapInterestsToCategories(interests: string[]): string[] {
  const mappedCategories = interests.map(mapInterestToCategory);
  return [...new Set(mappedCategories)]; // إزالة التكرار
}

/**
 * التحقق من صحة تصنيف
 */
export function isValidCategory(categorySlug: string): boolean {
  const validCategories = ['technology', 'sports', 'economy', 'politics', 'local', 'culture', 'opinion', 'misc'];
  return validCategories.includes(categorySlug);
}

/**
 * تحويل ID تصنيف إلى slug
 */
export function categoryIdToSlug(categoryId: string | number): string {
  const idToSlugMap: { [key: string]: string } = {
    '1': 'technology',
    '2': 'sports', 
    '3': 'economy',
    '4': 'politics',
    '5': 'local',
    '6': 'culture',
    '7': 'opinion',
    '8': 'misc'
  };
  
  return idToSlugMap[String(categoryId)] || 'misc';
}

/**
 * تحويل slug تصنيف إلى ID
 */
export function categorySlugToId(categorySlug: string): string {
  const slugToIdMap: { [key: string]: string } = {
    'technology': '1',
    'sports': '2',
    'economy': '3', 
    'politics': '4',
    'local': '5',
    'culture': '6',
    'opinion': '7',
    'misc': '8'
  };
  
  return slugToIdMap[categorySlug] || '8';
}

/**
 * تنظيف وتحديث اهتمامات المستخدم
 */
export function normalizeUserInterests(interests: string[]): string[] {
  // تحويل إلى تصنيفات فعلية
  const mapped = mapInterestsToCategories(interests);
  
  // التأكد من أن جميع التصنيفات صحيحة
  const validated = mapped.filter(isValidCategory);
  
  // إضافة تصنيف افتراضي إذا كانت القائمة فارغة
  if (validated.length === 0) {
    return ['misc'];
  }
  
  return validated;
}

/**
 * الحصول على معلومات التصنيف الكاملة
 */
export function getCategoryInfo(categorySlug: string) {
  const categoryData: { [key: string]: any } = {
    'technology': {
      id: '1',
      name: 'تقنية',
      name_ar: 'تقنية',
      slug: 'technology',
      description: 'أخبار وتطورات التقنية والذكاء الاصطناعي',
      color: '#8B5CF6',
      icon: '💻'
    },
    'sports': {
      id: '2', 
      name: 'رياضة',
      name_ar: 'رياضة',
      slug: 'sports',
      description: 'أخبار رياضية محلية وعالمية',
      color: '#F59E0B',
      icon: '⚽'
    },
    'economy': {
      id: '3',
      name: 'اقتصاد', 
      name_ar: 'اقتصاد',
      slug: 'economy',
      description: 'تقارير السوق والمال والأعمال والطاقة',
      color: '#10B981',
      icon: '💰'
    },
    'politics': {
      id: '4',
      name: 'سياسة',
      name_ar: 'سياسة', 
      slug: 'politics',
      description: 'مستجدات السياسة المحلية والدولية وتحليلاتها',
      color: '#EF4444',
      icon: '🏛️'
    },
    'local': {
      id: '5',
      name: 'محليات',
      name_ar: 'محليات',
      slug: 'local', 
      description: 'أخبار المناطق والمدن السعودية',
      color: '#3B82F6',
      icon: '🗺️'
    },
    'culture': {
      id: '6',
      name: 'ثقافة ومجتمع',
      name_ar: 'ثقافة ومجتمع',
      slug: 'culture',
      description: 'فعاليات ثقافية، مناسبات، قضايا اجتماعية', 
      color: '#EC4899',
      icon: '🎭'
    },
    'opinion': {
      id: '7',
      name: 'مقالات رأي',
      name_ar: 'مقالات رأي',
      slug: 'opinion',
      description: 'تحليلات ووجهات نظر كتاب الرأي',
      color: '#7C3AED', 
      icon: '✍️'
    },
    'misc': {
      id: '8',
      name: 'منوعات',
      name_ar: 'منوعات',
      slug: 'misc',
      description: 'أخبار خفيفة، صحة، سفر، ترفيه وأحداث متنوعة',
      color: '#6B7280',
      icon: '🎉'
    }
  };
  
  return categoryData[categorySlug] || categoryData['misc'];
} 