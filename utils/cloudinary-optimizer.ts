/**
 * مساعدات تحسين الصور عبر Cloudinary
 * يدعم جميع ميزات Cloudinary Transformation API
 */

export type CloudinaryQuality = 'auto' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
export type CloudinaryFormat = 'auto' | 'webp' | 'avif' | 'jpg' | 'png' | 'svg';
export type CloudinaryCrop = 'fill' | 'fit' | 'limit' | 'scale' | 'crop' | 'thumb' | 'pad';
export type CloudinaryGravity = 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west';
export type CloudinaryDPR = 1 | 1.5 | 2 | 2.5 | 3 | 'auto';

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: CloudinaryQuality;
  format?: CloudinaryFormat;
  dpr?: CloudinaryDPR;
  crop?: CloudinaryCrop;
  gravity?: CloudinaryGravity;
  aspectRatio?: string;  // مثل: "16:9"
  blur?: number;  // 1-2000
  sharpen?: number;  // 1-2000
  brightness?: number;  // -99 to 100
  saturation?: number;  // -100 to 100
}

/**
 * تحسين رابط Cloudinary بتحويلات مخصصة
 */
export function getCloudinaryUrl(
  url: string,
  options: CloudinaryOptions = {}
): string {
  // التحقق من صحة الرابط
  if (!url || typeof url !== 'string') {
    console.warn('[Cloudinary] Invalid URL:', url);
    return url || '';
  }
  
  // فقط روابط Cloudinary
  if (!url.includes('res.cloudinary.com/')) {
    return url;
  }
  
  // تقسيم الرابط عند /upload/
  const parts = url.split('/upload/');
  if (parts.length !== 2) {
    console.warn('[Cloudinary] Cannot parse URL:', url);
    return url;
  }
  
  const [baseUrl, imagePath] = parts;
  
  // استخراج الخيارات
  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    dpr = 1,
    crop = 'limit',
    gravity = 'auto',
    aspectRatio,
    blur,
    sharpen,
    brightness,
    saturation,
  } = options;
  
  // بناء سلسلة التحويلات
  const transformations: string[] = [];
  
  // 1. التنسيق (أولاً للتوافق)
  transformations.push(`f_${format}`);
  
  // 2. الجودة
  if (quality) {
    transformations.push(`q_${quality}`);
  }
  
  // 3. الأبعاد
  if (width) {
    transformations.push(`w_${width}`);
  }
  
  if (height) {
    transformations.push(`h_${height}`);
  }
  
  // 4. نسبة العرض إلى الارتفاع
  if (aspectRatio) {
    transformations.push(`ar_${aspectRatio.replace(':', '_')}`);
  }
  
  // 5. DPR (Device Pixel Ratio)
  if (dpr !== 1) {
    transformations.push(`dpr_${dpr}`);
  }
  
  // 6. Crop Mode
  transformations.push(`c_${crop}`);
  
  // 7. Gravity (للـ crop/fill)
  if (gravity !== 'auto' && (crop === 'fill' || crop === 'crop' || crop === 'thumb')) {
    transformations.push(`g_${gravity}`);
  }
  
  // 8. تأثيرات إضافية
  const effects: string[] = [];
  
  if (blur !== undefined) {
    effects.push(`blur:${blur}`);
  }
  
  if (sharpen !== undefined) {
    effects.push(`sharpen:${sharpen}`);
  }
  
  if (brightness !== undefined) {
    effects.push(`brightness:${brightness}`);
  }
  
  if (saturation !== undefined) {
    effects.push(`saturation:${saturation}`);
  }
  
  if (effects.length > 0) {
    transformations.push(`e_${effects.join(':')}`);
  }
  
  // دمج التحويلات
  const transformString = transformations.join(',');
  
  // بناء الرابط النهائي
  return `${baseUrl}/upload/${transformString}/${imagePath}`;
}

/**
 * توليد srcset للصور المستجيبة
 */
export function getCloudinarySrcSet(
  url: string,
  widths: number[] = [400, 800, 1200, 1600, 2000],
  options: Omit<CloudinaryOptions, 'width'> = {}
): string {
  if (!url.includes('res.cloudinary.com/')) {
    return '';
  }
  
  return widths
    .map(width => {
      const optimizedUrl = getCloudinaryUrl(url, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * إعدادات مُحسّنة مسبقاً
 */
export const CLOUDINARY_PRESETS = {
  /**
   * صورة بطل (Hero) - جودة عالية، أبعاد كبيرة
   */
  hero: (url: string, dpr: CloudinaryDPR = 2): string => {
    return getCloudinaryUrl(url, {
      width: 1200,
      quality: 'auto:best',
      format: 'auto',
      dpr,
      crop: 'limit',
    });
  },
  
  /**
   * صورة بطل مع srcset
   */
  heroResponsive: (url: string): { src: string; srcSet: string; sizes: string } => {
    return {
      src: getCloudinaryUrl(url, {
        width: 1200,
        quality: 'auto:best',
        format: 'auto',
      }),
      srcSet: getCloudinarySrcSet(url, [640, 1200, 1920], {
        quality: 'auto:best',
        format: 'auto',
      }),
      sizes: '(max-width: 768px) 100vw, 1200px',
    };
  },
  
  /**
   * صورة داخل المحتوى - جودة جيدة، أبعاد متوسطة
   */
  content: (url: string): string => {
    return getCloudinaryUrl(url, {
      width: 800,
      quality: 'auto:good',
      format: 'auto',
      crop: 'limit',
    });
  },
  
  /**
   * صورة داخل المحتوى مع srcset
   */
  contentResponsive: (url: string): { src: string; srcSet: string; sizes: string } => {
    return {
      src: getCloudinaryUrl(url, {
        width: 800,
        quality: 'auto:good',
        format: 'auto',
      }),
      srcSet: getCloudinarySrcSet(url, [400, 800, 1200], {
        quality: 'auto:good',
        format: 'auto',
      }),
      sizes: '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px',
    };
  },
  
  /**
   * صورة مصغرة - جودة متوسطة، أبعاد صغيرة
   */
  thumbnail: (url: string, size: number = 200): string => {
    return getCloudinaryUrl(url, {
      width: size,
      height: size,
      quality: 'auto:good',
      format: 'auto',
      crop: 'fill',
      gravity: 'auto',
    });
  },
  
  /**
   * أفاتار المستخدم - دائري، أبعاد صغيرة
   */
  avatar: (url: string, size: number = 64): string => {
    return getCloudinaryUrl(url, {
      width: size,
      height: size,
      quality: 'auto:good',
      format: 'auto',
      crop: 'thumb',
      gravity: 'face',
    });
  },
  
  /**
   * صورة OG (Open Graph) - للشبكات الاجتماعية
   */
  social: (url: string): string => {
    return getCloudinaryUrl(url, {
      width: 1200,
      height: 630,
      quality: 'auto:good',
      format: 'auto',
      crop: 'fill',
      gravity: 'auto',
    });
  },
  
  /**
   * صورة مطموسة (Blur) - للـ Placeholder
   */
  blurPlaceholder: (url: string): string => {
    return getCloudinaryUrl(url, {
      width: 40,
      quality: 'auto:eco',
      format: 'auto',
      blur: 1000,
    });
  },
};

/**
 * معالجة HTML لتحسين جميع صور Cloudinary
 * يُستخدم في server-side processing
 */
export function optimizeCloudinaryImagesInHTML(
  html: string,
  defaultOptions: CloudinaryOptions = {}
): string {
  if (!html) return '';
  
  // Pattern للصور
  const imgPattern = /<img([^>]+)src=["']([^"']+res\.cloudinary\.com[^"']+)["']([^>]*)>/gi;
  
  return html.replace(imgPattern, (match, pre, src, post) => {
    try {
      // تخطي الصور المُحسّنة بالفعل
      if (/\/upload\/[^\/]*f_auto/.test(src)) {
        return match;
      }
      
      // تحسين الرابط
      const optimized = getCloudinaryUrl(src, {
        width: 800,
        quality: 'auto:good',
        format: 'auto',
        crop: 'limit',
        ...defaultOptions,
      });
      
      // توليد srcset
      const srcset = getCloudinarySrcSet(src, [400, 800, 1200], {
        quality: 'auto:good',
        format: 'auto',
        ...defaultOptions,
      });
      
      // إعادة بناء tag
      let newTag = `<img${pre}src="${optimized}"`;
      
      // إضافة srcset إذا لم يكن موجوداً
      if (!/srcset=/.test(match)) {
        newTag += ` srcset="${srcset}"`;
      }
      
      // إضافة sizes إذا لم يكن موجوداً
      if (!/sizes=/.test(match)) {
        newTag += ` sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"`;
      }
      
      // إضافة loading="lazy" إذا لم يكن موجوداً
      if (!/loading=/.test(match)) {
        newTag += ` loading="lazy"`;
      }
      
      // إضافة decoding="async"
      if (!/decoding=/.test(match)) {
        newTag += ` decoding="async"`;
      }
      
      newTag += post + '>';
      
      return newTag;
    } catch (error) {
      console.error('[Cloudinary] Error optimizing image in HTML:', error);
      return match;  // إرجاع الأصلي في حال الخطأ
    }
  });
}

/**
 * فحص ما إذا كان الرابط من Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  return typeof url === 'string' && url.includes('res.cloudinary.com/');
}

/**
 * استخراج Public ID من رابط Cloudinary
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  
  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return null;
    
    // إزالة التحويلات والامتدادات
    let publicId = parts[1];
    
    // إزالة التحويلات (كل ما قبل آخر /)
    const segments = publicId.split('/');
    if (segments.length > 1) {
      // إزالة أول segment (التحويلات)
      publicId = segments.slice(1).join('/');
    }
    
    // إزالة الامتداد
    publicId = publicId.replace(/\.[^.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('[Cloudinary] Error extracting public ID:', error);
    return null;
  }
}

