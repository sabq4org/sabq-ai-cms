// ملف Cloudinary للخادم - يستخدم فقط في API routes
import { v2 as cloudinary } from 'cloudinary';

// تكوين Cloudinary من متغيرات البيئة
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// تكوين Cloudinary
cloudinary.config(cloudinaryConfig);

// التحقق من صحة الإعدادات
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.warn('⚠️  مفاتيح Cloudinary غير مكتملة في متغيرات البيئة');
}

// دالة تنظيف أسماء الملفات
export const cleanFileName = (fileName: string): string => {
  return fileName
    .replace(/[^\w.-]/g, '') // إزالة الرموز الخاصة والمسافات
    .replace(/\s+/g, '-') // استبدال المسافات بـ -
    .replace(/[^\x00-\x7F]/g, '') // إزالة الأحرف غير اللاتينية
    .replace(/[^a-zA-Z0-9._-]/g, '') // الاحتفاظ بالأحرف الآمنة فقط
    .toLowerCase()
    .substring(0, 50); // تقليل الطول الأقصى
};

// دالة رفع مع إعادة المحاولة
export const uploadWithRetry = async (
  file: File | Buffer,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: any[] | string;
    resourceType?: 'image' | 'video' | 'raw';
    fileName?: string;
  } = {},
  maxRetries: number = 3
): Promise<{
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  secureUrl?: string;
}> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 محاولة رفع ${attempt}/${maxRetries}...`);
      const result = await uploadToCloudinary(file, options);
      console.log(`✅ نجح الرفع من المحاولة ${attempt}`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ فشلت المحاولة ${attempt}: ${lastError.message}`);
      
      if (attempt < maxRetries) {
        // انتظار تصاعدي: 1s, 2s, 3s
        const delay = attempt * 1000;
        console.log(`⏳ الانتظار ${delay}ms قبل المحاولة التالية...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`فشل الرفع بعد ${maxRetries} محاولات: ${lastError?.message}`);
};

// دالة رفع الصور إلى Cloudinary
export const uploadToCloudinary = async (
  file: File | Buffer,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: any[] | string;
    resourceType?: 'image' | 'video' | 'raw';
    fileName?: string;
  } = {}
): Promise<{
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  secureUrl?: string;
}> => {
  try {
    // تحويل الملف إلى base64 إذا كان File
    let dataURI: string;
    let originalFileName = '';
    
    if (file instanceof File) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      dataURI = `data:${file.type};base64,${base64String}`;
      originalFileName = file.name;
    } else {
      // إذا كان Buffer
      const base64String = file.toString('base64');
      dataURI = `data:image/jpeg;base64,${base64String}`;
    }

    // تنظيف اسم الملف
    const cleanName = cleanFileName(originalFileName || options.fileName || 'image');
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    // إنشاء public_id نظيف وآمن
    const publicId = options.publicId || `${timestamp}_${cleanName}_${randomId}`.replace(/[^a-zA-Z0-9._-]/g, '_');

    // إعدادات الرفع المبسطة
    const uploadOptions = {
      folder: options.folder || 'sabq-cms/featured',
      resource_type: (options.resourceType || 'auto') as 'image' | 'video' | 'raw' | 'auto',
      public_id: publicId,
      overwrite: false,
      tags: ['sabq-cms']
    };

    console.log('📤 رفع الصورة إلى Cloudinary:', {
      folder: uploadOptions.folder,
      publicId: uploadOptions.public_id,
      fileName: cleanName
    });

    // رفع الملف
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    if (!result || !result.secure_url) {
      throw new Error('فشل في رفع الملف إلى Cloudinary');
    }

    console.log('✅ تم رفع الصورة بنجاح:', {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      secureUrl: result.secure_url
    };
  } catch (error) {
    console.error('❌ خطأ في رفع الملف إلى Cloudinary:', error);
    throw new Error(`فشل في رفع الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
};

// دالة حذف الصور من Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    console.log('🗑️  حذف الصورة من Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    const success = result.result === 'ok';
    
    if (success) {
      console.log('✅ تم حذف الصورة بنجاح');
    } else {
      console.log('⚠️  فشل في حذف الصورة:', result.result);
    }
    
    return success;
  } catch (error) {
    console.error('❌ خطأ في حذف الملف من Cloudinary:', error);
    return false;
  }
};

export default cloudinary; 