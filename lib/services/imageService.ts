// lib/services/imageService.ts
import { NextRequest, NextResponse } from 'next/server';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

export class ImageService {
  private static cloudinaryBaseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`;
  private static s3BaseUrl = process.env.AWS_S3_BASE_URL || '';

  /**
   * تحسين رابط Amazon S3 وإزالة المعاملات المعقدة
   */
  static optimizeS3Url(originalUrl: string): string {
    if (!originalUrl || !originalUrl.includes('amazonaws.com')) {
      return originalUrl;
    }

    try {
      const url = new URL(originalUrl);
      
      // إزالة جميع معاملات التوقيع والأمان
      const cleanParams = new URLSearchParams();
      
      // الاحتفاظ فقط بالمعاملات الأساسية إن وجدت
      if (url.searchParams.has('response-content-disposition')) {
        cleanParams.set('response-content-disposition', url.searchParams.get('response-content-disposition')!);
      }

      // إنشاء رابط نظيف
      const cleanUrl = `${url.protocol}//${url.host}${url.pathname}`;
      const queryString = cleanParams.toString();
      
      return queryString ? `${cleanUrl}?${queryString}` : cleanUrl;
    } catch (error) {
      console.warn('خطأ في تحسين رابط S3:', error);
      return originalUrl;
    }
  }

  /**
   * إنشاء رابط محسن للصورة مع خيارات التحسين
   */
  static getOptimizedImageUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl) return '';

    const {
      width = 800,
      height,
      quality = 80,
      format = 'webp',
      fit = 'cover'
    } = options;

    // إذا كانت الصورة من Cloudinary، استخدم تحسينات Cloudinary
    if (originalUrl.includes('cloudinary.com')) {
      return this.optimizeCloudinaryUrl(originalUrl, options);
    }

    // إذا كانت الصورة من S3، استخدم خدمة Image Proxy الداخلية
    if (originalUrl.includes('amazonaws.com')) {
      const cleanUrl = this.optimizeS3Url(originalUrl);
      return this.createProxyUrl(cleanUrl, options);
    }

    // إذا كانت صورة خارجية، استخدم Next.js Image Optimization
    return this.createProxyUrl(originalUrl, options);
  }

  /**
   * تحسين رابط Cloudinary
   */
  private static optimizeCloudinaryUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions
  ): string {
    try {
      const { width, height, quality, format, fit } = options;
      
      // استخراج معرف الصورة من رابط Cloudinary
      const imageIdMatch = originalUrl.match(/\/v\d+\/(.+)$/);
      if (!imageIdMatch) return originalUrl;
      
      const imageId = imageIdMatch[1];
      
      // بناء معاملات التحسين
      const transformations = [];
      
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      if (quality) transformations.push(`q_${quality}`);
      if (format) transformations.push(`f_${format}`);
      if (fit) transformations.push(`c_${fit}`);
      
      // إضافة تحسينات إضافية
      transformations.push('f_auto'); // تحديد الصيغة تلقائياً
      transformations.push('q_auto'); // جودة تلقائية حسب الشبكة
      
      const transformationString = transformations.join(',');
      
      return `${this.cloudinaryBaseUrl}/image/upload/${transformationString}/${imageId}`;
    } catch (error) {
      console.warn('خطأ في تحسين رابط Cloudinary:', error);
      return originalUrl;
    }
  }

  /**
   * إنشاء رابط Proxy للصور مع تحسين
   */
  private static createProxyUrl(
    originalUrl: string, 
    options: ImageOptimizationOptions
  ): string {
    const params = new URLSearchParams();
    params.set('url', originalUrl);
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.fit) params.set('fit', options.fit);
    
    return `/api/images/optimize?${params.toString()}`;
  }

  /**
   * فحص صحة رابط الصورة
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && (contentType?.startsWith('image/') ?? false);
    } catch {
      return false;
    }
  }

  /**
   * الحصول على صورة احتياطية حسب نوع المحتوى
   */
  static getFallbackImage(category?: string): string {
    const fallbackImages = {
      'تقنية': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      'رياضة': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
      'اقتصاد': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      'ميديا': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80'
    };

    return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.default;
  }

  /**
   * تحويل الصور من S3 إلى Cloudinary (للترحيل)
   */
  static async migrateImageToCloudinary(s3Url: string, publicId?: string): Promise<string | null> {
    try {
      const cloudinary = require('cloudinary').v2;
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.upload(s3Url, {
        public_id: publicId,
        folder: 'sabq-cms',
        resource_type: 'image',
        overwrite: true,
        quality: 'auto:good',
        format: 'auto'
      });

      return result.secure_url;
    } catch (error) {
      console.error('خطأ في ترحيل الصورة إلى Cloudinary:', error);
      return null;
    }
  }
}

// Hook لاستخدام خدمة الصور في React Components
export function useImageOptimization() {
  const getOptimizedUrl = (
    originalUrl: string, 
    options?: ImageOptimizationOptions
  ) => {
    return ImageService.getOptimizedImageUrl(originalUrl, options);
  };

  const getFallbackUrl = (category?: string) => {
    return ImageService.getFallbackImage(category);
  };

  return {
    getOptimizedUrl,
    getFallbackUrl,
    validateUrl: ImageService.validateImageUrl
  };
}
