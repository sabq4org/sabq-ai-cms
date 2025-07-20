import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'مطلوب رابط الصورة' },
        { status: 400 }
      );
    }

    // تحقق من صحة رابط Cloudinary
    const isCloudinaryUrl = imageUrl.includes('res.cloudinary.com');
    
    // محاولة الوصول للصورة
    const response = await fetch(imageUrl, {
      method: 'HEAD', // استخدام HEAD للتحقق بدون تحميل الصورة كاملة
      headers: {
        'User-Agent': 'SABQ-CMS/1.0'
      }
    });

    const diagnostics = {
      url: imageUrl,
      isCloudinaryUrl,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      isAccessible: response.ok,
      timestamp: new Date().toISOString()
    };

    if (!response.ok) {
      return NextResponse.json({
        ...diagnostics,
        error: `فشل الوصول للصورة: ${response.status} ${response.statusText}`,
        suggestion: response.status === 404 
          ? 'الصورة غير موجودة في الخادم'
          : response.status === 403
          ? 'مطلوب صلاحية للوصول للصورة'
          : 'مشكلة في الخادم أو الشبكة'
      }, { status: 200 }); // نعيد 200 لأن API يعمل، لكن الصورة لا تعمل
    }

    return NextResponse.json({
      ...diagnostics,
      message: 'الصورة متاحة وقابلة للوصول'
    });

  } catch (error) {
    console.error('خطأ في تشخيص الصورة:', error);
    
    return NextResponse.json({
      error: 'فشل في تشخيص الصورة',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
