// app/api/images/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const width = parseInt(searchParams.get('w') || '800');
    const height = parseInt(searchParams.get('h') || '0');
    const quality = parseInt(searchParams.get('q') || '80');
    const format = searchParams.get('f') || 'webp';
    const fit = searchParams.get('fit') || 'cover';

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // تنظيف وتحسين رابط Amazon S3
    const cleanUrl = cleanS3Url(url);
    
    // جلب الصورة الأصلية
    const imageResponse = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SABQ-Image-Optimizer/1.0)',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    // تحسين الصورة باستخدام Sharp
    let sharpInstance = sharp(Buffer.from(imageBuffer));
    
    // تطبيق التحسينات
    if (width || height) {
      const resizeOptions: any = {
        width: width > 0 ? width : undefined,
        height: height > 0 ? height : undefined,
        fit: fit as any,
        withoutEnlargement: true,
      };
      sharpInstance = sharpInstance.resize(resizeOptions);
    }

    // تحديد الصيغة والجودة
    switch (format) {
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality, 
          effort: 6,
          smartSubsample: true 
        });
        break;
      case 'avif':
        sharpInstance = sharpInstance.avif({ 
          quality,
          effort: 4 
        });
        break;
      case 'jpg':
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality,
          progressive: true,
          mozjpeg: true 
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality,
          compressionLevel: 9,
          adaptiveFiltering: true 
        });
        break;
      default:
        sharpInstance = sharpInstance.webp({ quality });
    }

    const optimizedBuffer = await sharpInstance.toBuffer();
    
    // إعداد headers للتخزين المؤقت
    const headers = new Headers({
      'Content-Type': `image/${format}`,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': optimizedBuffer.length.toString(),
      'X-Optimized-By': 'SABQ-Image-Service',
    });

    return new NextResponse(optimizedBuffer, { headers });

  } catch (error) {
    console.error('خطأ في تحسين الصورة:', error);
    
    // إرجاع صورة احتياطية في حالة الخطأ
    return NextResponse.redirect(getFallbackImageUrl(), 302);
  }
}

/**
 * تنظيف روابط Amazon S3 من المعاملات المعقدة
 */
function cleanS3Url(url: string): string {
  try {
    const urlObject = new URL(url);
    
    // إزالة جميع معاملات التوقيع والأمان
    const paramsToRemove = [
      'X-Amz-Algorithm',
      'X-Amz-Content-Sha256', 
      'X-Amz-Credential',
      'X-Amz-Date',
      'X-Amz-Expires',
      'X-Amz-Signature',
      'X-Amz-SignedHeaders',
      'x-amz-checksum-mode',
      'x-id'
    ];
    
    paramsToRemove.forEach(param => {
      urlObject.searchParams.delete(param);
    });
    
    // إنشاء URL نظيف
    const cleanUrl = urlObject.toString();
    
    console.log('🔧 تنظيف رابط S3:', {
      original: url.substring(0, 100) + '...',
      cleaned: cleanUrl
    });
    
    return cleanUrl;
    
  } catch (error) {
    console.warn('خطأ في تنظيف رابط S3:', error);
    return url;
  }
}

/**
 * الحصول على رابط صورة احتياطية
 */
function getFallbackImageUrl(): string {
  return 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80';
}
