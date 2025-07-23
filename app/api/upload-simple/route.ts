import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 بدء رفع الصورة بطريقة مبسطة...');
    
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'لم يتم رفع أي ملف' 
      });
    }

    // التحقق من صحة الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'نوع الملف غير مسموح' 
      });
    }

    // التحقق من إعدادات Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ إعدادات Cloudinary غير مكتملة');
      return NextResponse.json({ 
        success: false, 
        error: 'إعدادات الخدمة غير مكتملة' 
      });
    }

    // تحويل الملف إلى Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // تحديد المجلد
    let folder = 'sabq-cms/general';
    switch (type) {
      case 'avatar':
        folder = 'sabq-cms/avatars';
        break;
      case 'featured':
        folder = 'sabq-cms/featured';
        break;
      case 'gallery':
        folder = 'sabq-cms/gallery';
        break;
      case 'team':
        folder = 'sabq-cms/team';
        break;
      case 'analysis':
        folder = 'sabq-cms/analysis';
        break;
      default:
        folder = 'sabq-cms/general';
    }

    console.log('📤 رفع إلى Cloudinary...');
    console.log('📁 المجلد:', folder);
    console.log('📁 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

    // رفع الصورة إلى Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`,
          overwrite: true,
          invalidate: true,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ خطأ Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ نجح رفع Cloudinary:', result?.secure_url);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const uploadResult = result as any;

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      message: 'تم رفع الصورة بنجاح',
      cloudinary_storage: true
    });

  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في رفع الصورة',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
