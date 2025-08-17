import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// صور احتياطية لكل نوع محتوى
const FALLBACK_IMAGES = {
  article: '/images/placeholder-featured.jpg',
  category: '/images/category-default.jpg',
  author: '/images/default-avatar.jpg',
  default: '/images/placeholder-featured.jpg'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    console.log('📸 طلب صورة:', imagePath);
    
    // تحديد نوع المحتوى من المسار
    let contentType = 'default';
    if (imagePath.includes('category') || imagePath.includes('categories')) {
      contentType = 'category';
    } else if (imagePath.includes('author') || imagePath.includes('avatar')) {
      contentType = 'author';
    } else if (imagePath.includes('article') || imagePath.includes('featured')) {
      contentType = 'article';
    }
    
    // محاولة قراءة الصورة من المجلد العام
    const publicPath = path.join(process.cwd(), 'public', 'uploads', imagePath);
    
    if (fs.existsSync(publicPath)) {
      const imageBuffer = fs.readFileSync(publicPath);
      const ext = path.extname(publicPath).toLowerCase();
      
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.gif') mimeType = 'image/gif';
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }
    
    // إذا لم توجد الصورة، إعادة توجيه إلى صورة احتياطية
    const fallbackImage = FALLBACK_IMAGES[contentType as keyof typeof FALLBACK_IMAGES];
    console.log('⚠️ الصورة غير موجودة، استخدام الصورة الاحتياطية:', fallbackImage);
    
    return NextResponse.redirect(new URL(fallbackImage, request.url), {
      status: 301,
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في معالجة الصورة:', error);
    
    // في حالة الخطأ، إعادة توجيه إلى صورة افتراضية
    return NextResponse.redirect(new URL(FALLBACK_IMAGES.default, request.url), {
      status: 302
    });
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
