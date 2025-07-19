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

// دالة لإنشاء رابط صورة محسن
export const generateImageUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  crop?: string;
} = {}) => {
  const { cloudName } = getPublicCloudinaryConfig();
  
  if (!cloudName || !publicId) {
    return '/images/placeholder.jpg';
  }

  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'auto',
    crop = 'fill'
  } = options;

  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
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

// إعدادات افتراضية لرفع الصور
export const getUploadOptions = (type: string = 'general') => {
  const baseOptions = {
    resource_type: 'image' as const,
    quality: 'auto',
    fetch_format: 'auto',
    flags: 'progressive',
    tags: ['sabq-cms']
  };

  switch (type) {
    case 'featured':
      return {
        ...baseOptions,
        folder: 'sabq-cms/featured',
        transformation: [
          { width: 1200, height: 630, crop: 'fill', quality: 85 },
          { if: 'w_gt_1200', width: 1200, crop: 'scale' }
        ]
      };
    
    case 'avatar':
      return {
        ...baseOptions,
        folder: 'sabq-cms/avatars',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 90 },
          { radius: 'max' }
        ]
      };
    
    case 'gallery':
      return {
        ...baseOptions,
        folder: 'sabq-cms/gallery',
        transformation: [
          { width: 1000, quality: 85, crop: 'scale' }
        ]
      };
    
    default:
      return {
        ...baseOptions,
        folder: 'sabq-cms/general'
      };
  }
}; 