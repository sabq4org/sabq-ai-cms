import { NextRequest, NextResponse } from 'next/server';

/**
 * خدمة تحسين الصور المتقدمة
 * تعالج مشاكل Amazon S3 وتوفر حلول بديلة
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpeg' | 'png';
  fallback?: string;
}

class ImageService {
  private cloudinaryBaseUrl = 'https://res.cloudinary.com/dybhezmvb/image/upload';
  private unsplashFallbacks = [
    'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
  ];

  /**
   * تنظيف وتحسين رابط الصورة
   */
  cleanImageUrl(imageUrl: string): string {
    if (!imageUrl) return this.getRandomFallback();

    // تجاهل روابط Amazon S3 المعقدة
    if (this.isProblematicS3Url(imageUrl)) {
      console.warn('🚫 تم تجاهل رابط S3 معقد:', imageUrl.substring(0, 100) + '...');
      return this.getRandomFallback();
    }

    // تحسين روابط Cloudinary
    if (imageUrl.includes('cloudinary.com')) {
      return this.optimizeCloudinaryUrl(imageUrl);
    }

    // إرجاع الرابط كما هو إذا كان آمن
    return imageUrl;
  }

  /**
   * فحص إذا كان رابط S3 مشكوك فيه
   */
  private isProblematicS3Url(url: string): boolean {
    return url.includes('amazonaws.com') && (
      url.includes('X-Amz-') ||
      url.includes('Expires=') ||
      url.includes('Signature=') ||
      url.length > 200
    );
  }

  /**
   * تحسين روابط Cloudinary
   */
  private optimizeCloudinaryUrl(url: string, options?: ImageOptimizationOptions): string {
    try {
      const urlParts = url.split('/upload/');
      if (urlParts.length !== 2) return url;

      const baseUrl = urlParts[0] + '/upload/';
      const imagePath = urlParts[1];

      // إضافة تحسينات
      const optimizations = [];
      
      if (options?.width) optimizations.push(`w_${options.width}`);
      if (options?.height) optimizations.push(`h_${options.height}`);
      if (options?.quality) optimizations.push(`q_${options.quality}`);
      if (options?.format) optimizations.push(`f_${options.format}`);
      
      // تحسينات افتراضية للأداء
      optimizations.push('q_auto'); // جودة تلقائية
      optimizations.push('f_auto'); // صيغة تلقائية (WebP في المتصفحات المدعومة)
      optimizations.push('dpr_auto'); // كثافة البكسل التلقائية
      
      const optimizationString = optimizations.join(',');
      return `${baseUrl}${optimizationString}/${imagePath}`;
    } catch (error) {
      console.error('خطأ في تحسين رابط Cloudinary:', error);
      return url;
    }
  }

  /**
   * الحصول على صورة احتياطية عشوائية
   */
  private getRandomFallback(): string {
    const randomIndex = Math.floor(Math.random() * this.unsplashFallbacks.length);
    return this.unsplashFallbacks[randomIndex];
  }

  /**
   * رفع صورة إلى Cloudinary مع تحسينات
   */
  async uploadToCloudinary(file: File, folder = 'categories'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'sabq_preset');
      formData.append('folder', folder);
      formData.append('quality', 'auto');
      formData.append('format', 'auto');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dybhezmvb/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return this.optimizeCloudinaryUrl(result.secure_url);
    } catch (error) {
      console.error('خطأ في رفع الصورة إلى Cloudinary:', error);
      throw error;
    }
  }

  /**
   * إنشاء URL محسن للصورة
   */
  createOptimizedUrl(
    imageUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    const cleanUrl = this.cleanImageUrl(imageUrl);
    
    if (cleanUrl.includes('cloudinary.com')) {
      return this.optimizeCloudinaryUrl(cleanUrl, options);
    }
    
    return cleanUrl;
  }
}

// إنشاء instance واحد للاستخدام العام
export const imageService = new ImageService();

// API endpoint لمعالجة الصور
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const quality = searchParams.get('quality');
  const format = searchParams.get('format') as any;

  if (!imageUrl) {
    return NextResponse.json({ 
      error: 'مطلوب رابط الصورة' 
    }, { status: 400 });
  }

  try {
    const optimizedUrl = imageService.createOptimizedUrl(imageUrl, {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: quality ? parseInt(quality) : undefined,
      format: format || 'auto'
    });

    return NextResponse.json({
      original: imageUrl,
      optimized: optimizedUrl,
      isS3: imageUrl.includes('amazonaws.com'),
      isCloudinary: optimizedUrl.includes('cloudinary.com'),
      isFallback: optimizedUrl.includes('unsplash.com')
    });
  } catch (error) {
    console.error('خطأ في معالجة الصورة:', error);
    return NextResponse.json({ 
      error: 'خطأ في معالجة الصورة',
      fallback: imageService.createOptimizedUrl('')
    }, { status: 500 });
  }
}
