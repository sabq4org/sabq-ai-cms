/**
 * تكوينات الأداء والصور
 */

// إعدادات تحسين الصور
export const IMAGE_CONFIG = {
  // تفعيل التحميل الكسول للصور
  lazyLoading: true,
  
  // استخدام placeholder أثناء التحميل
  showPlaceholder: true,
  
  // مهلة تحميل الصور (ثانية)
  loadTimeout: 5,
  
  // عدد المحاولات عند فشل الصورة
  maxRetries: 2,
  
  // استخدام CDN للصور الخارجية
  useCDN: true,
  
  // أحجام الصور المحسنة
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 }
  }
};

// قائمة الصور المعطلة المعروفة (لتجنب محاولة تحميلها)
export const BROKEN_IMAGES = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b47c',
  'https://images.unsplash.com/photo-1594736797933-d0411e042d9e',
  'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/mubarak-al-ati.jpg'
];

// دالة للتحقق من الصور المعطلة
export function isBrokenImage(url: string): boolean {
  if (!url) return true;
  return BROKEN_IMAGES.some(broken => url.includes(broken));
}

// دالة لإنشاء placeholder سريع
export function getQuickPlaceholder(type: 'article' | 'avatar' | 'category' = 'article'): string {
  const placeholders = {
    article: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOWNhM2FmIj7YtdmI2LHYqTwvdGV4dD48L3N2Zz4=',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzljYTNhZiI+2YU8L3RleHQ+PC9zdmc+',
    category: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZDFkNWRiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNmI3MjgwIj7Yqti12YbZitmBPC90ZXh0Pjwvc3ZnPg=='
  };
  return placeholders[type] || placeholders.article;
} 