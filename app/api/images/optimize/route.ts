import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * خدمة تحسين وتعديل الصور عند الطلب
 * تدعم تحميل صور من مصادر خارجية وتحسينها
 * مع دعم تغيير الحجم والجودة والتنسيق
 */
export async function GET(request: NextRequest) {
  try {
    // استخراج المعاملات من الطلب
    const { searchParams } = new URL(request.url);
    
    // معاملات الصورة
    const url = searchParams.get('url');
    const width = Number(searchParams.get('w')) || undefined;
    const height = Number(searchParams.get('h')) || undefined;
    const quality = Number(searchParams.get('q')) || 80;
    const format = searchParams.get('f') || 'webp';
    const fit = searchParams.get('fit') || 'cover';
    
    // التحقق من وجود رابط الصورة
    if (!url) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }
    
    // تحميل الصورة من المصدر
    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      // إذا فشل تحميل الصورة، استخدم صورة احتياطية
      const fallbackUrl = '/images/placeholder.jpg';
      const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${fallbackUrl}`);
      if (!fallbackResponse.ok) {
        return NextResponse.json({ error: 'Failed to load image' }, { status: 404 });
      }
      
      const fallbackBuffer = await fallbackResponse.arrayBuffer();
      return new NextResponse(fallbackBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    // الحصول على بيانات الصورة
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // معالجة الصورة باستخدام sharp
    let sharpInstance = sharp(Buffer.from(imageBuffer));
    
    // تغيير الحجم إذا تم تحديده
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit: fit as keyof sharp.FitEnum,
      });
    }
    
    // تحويل التنسيق
    let outputFormat: any;
    let contentType = '';
    
    switch (format) {
      case 'webp':
        outputFormat = sharpInstance.webp({ quality });
        contentType = 'image/webp';
        break;
      case 'avif':
        outputFormat = sharpInstance.avif({ quality });
        contentType = 'image/avif';
        break;
      case 'png':
        outputFormat = sharpInstance.png();
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
      default:
        outputFormat = sharpInstance.jpeg({ quality });
        contentType = 'image/jpeg';
    }
    
    // الحصول على الصورة المحسنة
    const optimizedImageBuffer = await outputFormat.toBuffer();
    
    // إعادة الصورة المحسنة
    return new NextResponse(optimizedImageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24 ساعة
      }
    });
    
  } catch (error) {
    console.error('Error optimizing image:', error);
    return NextResponse.json({ error: 'Failed to optimize image' }, { status: 500 });
  }
}
