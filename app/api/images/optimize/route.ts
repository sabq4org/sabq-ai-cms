import { NextRequest, NextResponse } from 'next/server';

/**
 * خدمة تحسين الصور البسيطة باستخدام Cloudinary
 * تحويل الصور إلى Cloudinary للتحسين التلقائي
 */
export async function GET(request: NextRequest) {
  try {
    // استخراج المعاملات من الطلب
    const { searchParams } = new URL(request.url);
    
    // معاملات الصورة
    const url = searchParams.get('url');
    const width = searchParams.get('w') || '800';
    const height = searchParams.get('h') || '600';
    const quality = searchParams.get('q') || 'auto';
    const format = searchParams.get('f') || 'auto';
    
    // التحقق من وجود رابط الصورة
    if (!url) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // إذا كانت الصورة من Cloudinary بالفعل، أعدها كما هي
    if (url.includes('cloudinary.com')) {
      return NextResponse.redirect(url);
    }

    // إذا كانت من Unsplash، استخدم تحسينات Unsplash
    if (url.includes('unsplash.com')) {
      try {
        const unsplashUrl = new URL(url);
        unsplashUrl.searchParams.set('w', width);
        unsplashUrl.searchParams.set('h', height);
        unsplashUrl.searchParams.set('q', quality === 'auto' ? '80' : quality);
        unsplashUrl.searchParams.set('auto', 'format');
        unsplashUrl.searchParams.set('fit', 'crop');
        
        return NextResponse.redirect(unsplashUrl.toString());
      } catch {
        return NextResponse.redirect(url);
      }
    }

    // استخدام Cloudinary fetch API لتحسين الصور الخارجية
    const cloudinaryBaseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'}/image/fetch`;
    
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `c_fill`,
      `q_${quality}`,
      `f_${format}`,
      'fl_progressive',
      'fl_immutable_cache'
    ].join(',');

    const cloudinaryUrl = `${cloudinaryBaseUrl}/${transformations}/${encodeURIComponent(url)}`;
    
    // إعادة توجيه إلى Cloudinary
    return NextResponse.redirect(cloudinaryUrl);
    
  } catch (error) {
    console.error('Error in image optimization:', error);
    
    // في حالة الخطأ، أعد الصورة الأصلية
    const originalUrl = new URL(request.url).searchParams.get('url');
    if (originalUrl) {
      return NextResponse.redirect(originalUrl);
    }
    
    return NextResponse.json({ error: 'Failed to optimize image' }, { status: 500 });
  }
}
