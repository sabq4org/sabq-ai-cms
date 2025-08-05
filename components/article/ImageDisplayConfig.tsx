'use client';

// ملف إعدادات عرض الصور
// يمكن تغيير DISPLAY_MODE لتجربة أساليب مختلفة لعرض الصور

export type ImageDisplayMode = 'default' | 'blur-overlay' | 'aspect-ratio' | 'fullwidth';

// تكوين عرض الصور
export const IMAGE_CONFIG = {
  // وضع العرض الحالي
  // blur-overlay: صورة في المنتصف مع خلفية مموهة
  // aspect-ratio: صورة بنسبة عرض ثابتة
  // fullwidth: صورة بعرض كامل (التصميم المطلوب)
  // default: صورة بحجم صغير
  DISPLAY_MODE: 'fullwidth' as ImageDisplayMode,
  
  // نسبة العرض للوضع aspect-ratio
  ASPECT_RATIO: '16:9', // يمكن تغييرها إلى '4:3' أو '1:1'
  
  // إعدادات الجودة
  QUALITY: {
    // جودة الصور المحولة
    WEBP_QUALITY: 85,
    AVIF_QUALITY: 80,
    
    // الأحجام المختلفة
    SIZES: {
      MOBILE: 640,
      TABLET: 1024,
      DESKTOP: 1600,
      LARGE: 2400
    }
  },
  
  // متطلبات الصور للمحررين
  REQUIREMENTS: {
    MIN_WIDTH: 1600,
    MIN_HEIGHT: 900,
    MIN_DPI: 72,
    MAX_FILE_SIZE_MB: 5
  }
};

// مكون لعرض متطلبات الصور في لوحة التحكم
export function ImageRequirements() {
  const { REQUIREMENTS } = IMAGE_CONFIG;
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
        متطلبات الصور المميزة
      </h4>
      <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
        <li>• الحد الأدنى للعرض: {REQUIREMENTS.MIN_WIDTH}px</li>
        <li>• الحد الأدنى للارتفاع: {REQUIREMENTS.MIN_HEIGHT}px</li>
        <li>• الدقة: {REQUIREMENTS.MIN_DPI}dpi أو أعلى</li>
        <li>• الحجم الأقصى: {REQUIREMENTS.MAX_FILE_SIZE_MB}MB</li>
        <li>• الصيغ المدعومة: JPG, PNG, WebP</li>
      </ul>
    </div>
  );
}