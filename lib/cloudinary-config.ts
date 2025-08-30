import { v2 as cloudinary } from 'cloudinary';

// إعداد Cloudinary
const setupCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️ Cloudinary غير مُعد بشكل صحيح. تأكد من وجود متغيرات البيئة التالية:');
    console.warn('- CLOUDINARY_CLOUD_NAME');
    console.warn('- CLOUDINARY_API_KEY');
    console.warn('- CLOUDINARY_API_SECRET');
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  console.log('✅ تم إعداد Cloudinary بنجاح:', cloudName);
  return true;
};

// التحقق من التكوين
export const isCloudinaryConfigured = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && 
           process.env.CLOUDINARY_API_KEY && 
           process.env.CLOUDINARY_API_SECRET);
};

// إعداد Cloudinary عند التحميل
const configured = setupCloudinary();

export { cloudinary, configured };

// دالة للحصول على إعدادات Cloudinary للعميل
export const getPublicCloudinaryConfig = () => {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sabq_preset'
  };
};

// دالة لإنشاء رابط صورة محسن مع تحسينات الأداء
export const generateImageUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: string;
  crop?: string;
  responsive?: boolean;
  lazy?: boolean;
} = {}) => {
  const { cloudName } = getPublicCloudinaryConfig();
  
  if (!cloudName || !publicId) {
    return '/images/placeholder.jpg';
  }

  const {
    width = 800,
    height = 600,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    responsive = true,
    lazy = true
  } = options;

  // بناء transformations محسنة للأداء
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `q_${quality}`, // استخدام q_auto للضغط التلقائي
    `f_${format}`, // استخدام f_auto لتحويل تلقائي إلى WebP/AVIF
    'fl_progressive', // تحميل تدريجي
    'fl_immutable_cache' // تخزين مؤقت ثابت
  ];

  // إضافة تحسينات responsive
  if (responsive) {
    transformations.push('dpr_auto'); // كثافة البكسل التلقائية
  }

  // إضافة lazy loading للصور الكبيرة
  if (lazy && (width > 400 || height > 300)) {
    transformations.push('fl_lazy');
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(',')}/${publicId}`;
};

// دالة للتحقق من وجود الصورة
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// إعدادات افتراضية محسنة لرفع الصور
export const getUploadOptions = (type: string = 'general') => {
  const baseOptions = {
    resource_type: 'image' as const,
    quality: 'auto:best', // ضغط تلقائي ذكي محسن للأداء
    fetch_format: 'auto', // تحويل تلقائي إلى WebP/AVIF
    flags: [
      'progressive', 
      'immutable_cache', 
      'keep_iptc',
      'strip_profile',
      'force_strip'
    ], // تحميل تدريجي وتخزين ثابت مع إزالة البيانات الوصفية
    tags: ['sabq-cms'],
    // إضافة responsive breakpoints محسنة
    responsive_breakpoints: [
      { max_width: 1920, max_images: 4, bytes_step: 20000, min_width: 400 },
      { max_width: 1200, max_images: 3, bytes_step: 15000, min_width: 300 },
      { max_width: 800, max_images: 2, bytes_step: 10000, min_width: 200 }
    ],
    // ضغط إضافي للأداء
    secure: true,
    unique_filename: false,
    use_filename: true,
    overwrite: true
  };

  switch (type) {
    case 'featured':
      return {
        ...baseOptions,
        folder: 'sabq-cms/featured',
        transformation: [
          { width: 1200, height: 630, crop: 'fill', quality: 'auto:best', gravity: 'auto:subject' },
          { if: 'w_gt_1200', width: 1200, crop: 'scale' },
          { format: 'auto' }, // تحويل تلقائي للصيغة الأمثل
          { effect: 'sharpen:80' }, // تحسين حدة الصورة
          { flags: 'progressive' }
        ]
      };
    
    case 'avatar':
      return {
        ...baseOptions,
        folder: 'sabq-cms/avatars',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face:center', quality: 'auto:best' },
          { radius: 'max' },
          { format: 'auto' },
          { effect: 'sharpen:60' },
          { flags: 'progressive' }
        ]
      };
    
    case 'gallery':
      return {
        ...baseOptions,
        folder: 'sabq-cms/gallery',
        transformation: [
          { width: 1000, quality: 'auto:good', crop: 'scale', gravity: 'auto:subject' },
          { format: 'auto' },
          { effect: 'auto_contrast' },
          { flags: 'progressive' }
        ]
      };
    
    case 'thumbnail':
      return {
        ...baseOptions,
        folder: 'sabq-cms/thumbnails',
        transformation: [
          { width: 300, height: 200, crop: 'fill', quality: 'auto:eco' },
          { format: 'auto' }
        ]
      };
    
    default:
      return {
        ...baseOptions,
        folder: 'sabq-cms/general',
        transformation: [
          { quality: 'auto' },
          { format: 'auto' }
        ]
      };
  }
}; 