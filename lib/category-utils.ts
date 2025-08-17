/**
 * أدوات مساعدة للتعامل مع التصنيفات
 * تم إنشاء هذا الملف لتوحيد التعامل مع حقول التصنيفات في جميع أنحاء التطبيق
 */

// أنواع التصنيف الممكنة
export interface CategoryType {
  id: string | number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  slug?: string;
  color?: string;
  color_hex?: string;
  icon?: string;
  description?: string;
}

/**
 * الحصول على اسم التصنيف مع دعم جميع الحقول الممكنة
 */
export function getCategoryName(category: CategoryType | string | null | undefined): string {
  if (!category) return 'غير مصنف';
  
  // إذا كان التصنيف نص مباشر
  if (typeof category === 'string') return category;
  
  // البحث عن الاسم بالترتيب: name > name_ar > name_en
  return category.name || category.name_ar || category.name_en || 'غير مصنف';
}

/**
 * الحصول على لون التصنيف مع دعم جميع الحقول الممكنة
 */
export function getCategoryColor(category: CategoryType | null | undefined): string {
  if (!category || typeof category === 'string') {
    // ألوان افتراضية للتصنيفات
    const defaultColors = ['#1a73e8', '#ea4335', '#34a853', '#fbbc04', '#673ab7', '#e91e63'];
    const index = Math.abs((typeof category === 'string' ? category : '').charCodeAt(0) - 65) % defaultColors.length;
    return defaultColors[index];
  }
  
  // البحث عن اللون بالترتيب: color > color_hex
  return category.color || category.color_hex || '#6B7280'; // رمادي افتراضي
}

/**
 * الحصول على أيقونة التصنيف
 */
export function getCategoryIcon(category: CategoryType | null | undefined): string | null {
  if (!category || typeof category === 'string') return null;
  return category.icon || null;
}

/**
 * الحصول على رابط التصنيف
 */
export function getCategoryLink(category: CategoryType | string | null | undefined): string {
  if (!category) return '/categories/uncategorized';
  
  if (typeof category === 'string') {
    return `/categories/${category.toLowerCase().replace(/\s+/g, '-')}`;
  }
  
  // استخدام slug إذا كان متاحاً، وإلا تحويل الاسم
  const slug = category.slug || getCategoryName(category).toLowerCase().replace(/\s+/g, '-');
  return `/categories/${slug}`;
}

/**
 * التحقق من صحة كائن التصنيف
 */
export function isValidCategory(category: any): category is CategoryType {
  return category && typeof category === 'object' && 
    (category.name || category.name_ar || category.name_en);
}

/**
 * تنسيق التصنيف للعرض
 */
export function formatCategoryForDisplay(category: CategoryType | string | null | undefined) {
  return {
    name: getCategoryName(category),
    color: getCategoryColor(category as CategoryType),
    icon: getCategoryIcon(category as CategoryType),
    link: getCategoryLink(category)
  };
} 