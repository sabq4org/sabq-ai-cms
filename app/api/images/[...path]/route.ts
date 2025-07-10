import { NextRequest, NextResponse } from 'next/server';
import { getOptimizedImageUrl } from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await context.params;
    const imagePath = resolvedParams.path.join('/');
    
    // التحقق من وجود المسار
    if (!imagePath) {
      return NextResponse.json(
        { error: 'مسار الصورة مطلوب' },
        { status: 400 }
      );
    }
    
    // إنشاء رابط Cloudinary محسن
    const cloudinaryUrl = getOptimizedImageUrl(imagePath, {
      width: 800,
      height: 600,
      quality: 80,
      format: 'webp',
      crop: 'fill'
    });
    
    // إعادة توجيه إلى Cloudinary
    return NextResponse.redirect(cloudinaryUrl);
    
  } catch (error) {
    console.error('خطأ في معالجة الصورة:', error);
    
    // إرجاع صورة افتراضية من Cloudinary
    const defaultImageUrl = `https://res.cloudinary.com/dybhezmvb/image/upload/v1/sabq-cms/defaults/default-image.jpg`;
    return NextResponse.redirect(defaultImageUrl);
  }
}

// معالجة طلبات POST لتحميل الصور إلى Cloudinary
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      { 
        error: 'التحميل يجب أن يتم عبر Cloudinary مباشرة',
        message: 'استخدم API Cloudinary للتحميل' 
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    return NextResponse.json(
      { error: 'فشل معالجة الطلب' },
      { status: 500 }
    );
  }
}
