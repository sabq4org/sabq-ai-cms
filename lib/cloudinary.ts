// ملف Cloudinary للعميل - بدون استيراد المكتبة التي تحتاج fs
// يستخدم فقط في المتصفح لتوليد روابط الصور

// تكوين Cloudinary من متغيرات البيئة
const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '559894124915114',
};

// دالة تنظيف أسماء الملفات
export const cleanFileName = (fileName: string): string => {
  return fileName
    .replace(/[^\w\s.-]/g, '') // إزالة الرموز الخاصة
    .replace(/\s+/g, '-') // استبدال المسافات بـ -
    .replace(/[^\x00-\x7F]/g, '') // إزالة الأحرف غير اللاتينية
    .toLowerCase()
    .substring(0, 100); // تحديد الطول الأقصى
};

// دالة التحقق من وجود الصورة
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    // التحقق من أن URL صحيح
    if (!url || !url.startsWith('http')) {
      return false;
    }

    // التحقق من وجود الصورة
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SabqAI-CMS/1.0)'
      },
      // إضافة timeout
      signal: AbortSignal.timeout(5000)
    });
    
    // التحقق من أن الاستجابة ناجحة وليست 404
    if (!response.ok) {
      console.log(`❌ الصورة غير موجودة: ${url} - Status: ${response.status}`);
      return false;
    }
    
    // التحقق من نوع المحتوى
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.log(`❌ الملف ليس صورة: ${url} - Content-Type: ${contentType}`);
      return false;
    }
    
    console.log(`✅ الصورة موجودة: ${url}`);
    return true;
  } catch (error) {
    console.error(`❌ خطأ في التحقق من وجود الصورة: ${url}`, error);
    return false;
  }
};

// دالة إنشاء URL محسن للصور
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
  } = {}
): string => {
  const transformations = [];
  
  if (options.width || options.height) {
    transformations.push(`w_${options.width || 'auto'},h_${options.height || 'auto'}`);
  }
  
  if (options.crop) {
    transformations.push(`c_${options.crop}`);
  }
  
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }
  
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  const transformationString = transformations.length > 0 ? transformations.join('/') + '/' : '';
  
  return `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/${transformationString}${publicId}`;
};

// دالة التحقق من صحة URL Cloudinary
export const isValidCloudinaryUrl = (url: string): boolean => {
  // التحقق البسيط من أن الرابط من Cloudinary
  return Boolean(url && url.includes('res.cloudinary.com'));
};

// دالة استخراج public_id من URL Cloudinary
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    // استخراج public_id من URL
    const publicIdParts = urlParts.slice(uploadIndex + 2); // تخطي 'upload' و version
    return publicIdParts.join('/').split('.')[0]; // إزالة الامتداد
  } catch (error) {
    console.error('خطأ في استخراج public_id:', error);
    return null;
  }
};

// دالة محسنة للحصول على صورة افتراضية ثابتة
export const getDefaultImageUrl = (type: 'article' | 'avatar' | 'category' = 'article'): string => {
  // استخدام صور SVG افتراضية محلية
  const defaultSvgs = {
    article: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#E5E7EB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#D1D5DB;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#grad1)"/>
        <path d="M300 200 L500 200 L500 400 L300 400 Z" fill="#9CA3AF" opacity="0.5"/>
        <circle cx="400" cy="300" r="50" fill="#9CA3AF" opacity="0.5"/>
        <text x="400" y="450" font-family="Arial, sans-serif" font-size="24" fill="#6B7280" text-anchor="middle" opacity="0.8">
          صورة المقال
        </text>
      </svg>
    `)}`,
    avatar: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#E5E7EB"/>
        <circle cx="100" cy="80" r="30" fill="#9CA3AF"/>
        <path d="M50 140 Q100 120 150 140 L150 180 L50 180 Z" fill="#9CA3AF"/>
      </svg>
    `)}`,
    category: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#F3F4F6"/>
        <rect x="50" y="50" width="300" height="200" fill="#E5E7EB" rx="10"/>
        <text x="200" y="150" font-family="Arial, sans-serif" font-size="20" fill="#6B7280" text-anchor="middle">
          تصنيف
        </text>
      </svg>
    `)}`
  };
  
  return defaultSvgs[type];
};

// دالة محسنة لتوليد صور افتراضية ثابتة بناءً على العنوان
export const generatePlaceholderImage = (title: string, type: 'article' | 'avatar' | 'category' = 'article'): string => {
  // استخدام صور SVG كـ data URI بدلاً من Cloudinary
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
  const colorIndex = title.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  // إنشاء نص مختصر من العنوان
  const text = title.substring(0, 2).toUpperCase();
  
  // إنشاء صورة SVG كـ data URI
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#${color}"/>
      <text x="200" y="150" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  // تحويل SVG إلى data URI
  const encodedSvg = encodeURIComponent(svg.trim());
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
};

// دالة محسنة للحصول على رابط صورة صالح
export const getValidImageUrl = (imageUrl?: string, fallbackTitle?: string, type: 'article' | 'avatar' | 'category' = 'article'): string => {
  // التحقق من وجود الرابط وصحته
  if (!imageUrl || imageUrl === '' || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
    return generatePlaceholderImage(fallbackTitle || 'مقال', type);
  }
  
  // إذا كان الرابط نسبي (يبدأ بـ /)
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // إذا كان الرابط من placeholder.jpg أو placeholder
  if (imageUrl.includes('placeholder') || imageUrl.includes('default')) {
    return generatePlaceholderImage(fallbackTitle || 'مقال', type);
  }
  
  // إذا كان الرابط هو publicId بدون بروتوكول (مثلاً sabq-cms/featured/xyz)
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('https')) {
    // إنشاء رابط كامل إلى Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb';
    return `https://res.cloudinary.com/${cloudName}/image/upload/${imageUrl}`;
  }
  
  // إذا كان الرابط كامل (يبدأ بـ http أو https)، استخدمه كما هو
  return imageUrl;
}; 