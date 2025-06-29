import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

// Cloudinary configuration (for production)
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dybhezmvb',
  api_key: process.env.CLOUDINARY_API_KEY || '559894124915114',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'vuiA8rLNm7d1U-UAOTED6FyC4hY',
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع أي ملف' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if we're in production and have Cloudinary config
    const isProduction = process.env.NODE_ENV === 'production';
    const hasCloudinaryConfig = cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret;

    if (hasCloudinaryConfig) {
      // Use Cloudinary for both production and development
      try {
        const cloudinary = require('cloudinary').v2;
        
        cloudinary.config({
          cloud_name: cloudinaryConfig.cloud_name,
          api_key: cloudinaryConfig.api_key,
          api_secret: cloudinaryConfig.api_secret,
        });

        // Convert buffer to base64
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'sabq-cms',
          resource_type: 'auto',
          public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        });

        console.log('✅ تم رفع الملف إلى Cloudinary:', result.secure_url);

        return NextResponse.json({ 
          success: true, 
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          message: 'تم رفع الصورة بنجاح إلى Cloudinary'
        });

      } catch (cloudinaryError) {
        console.error('❌ خطأ في رفع الملف إلى Cloudinary:', cloudinaryError);
        // Fallback to local storage if Cloudinary fails
      }
    }

    // Local storage (fallback only)
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const fileName = `${Date.now()}-${file.name}`;
    const path = join(uploadsDir, fileName);

    // حفظ الملف محلياً
    await writeFile(path, buffer);
    console.log(`✅ تم رفع الملف محلياً: ${path}`);

    // إرجاع المسار العام للملف
    const publicPath = `/uploads/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicPath,
      message: 'تم رفع الصورة محلياً (تحذير: قد تختفي عند إعادة النشر على Vercel)'
    });

  } catch (error) {
    console.error('❌ خطأ في رفع الملف:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'فشل رفع الملف',
      message: error instanceof Error ? error.message : 'خطأ غير معروف' 
    }, { status: 500 });
  }
}

// دعم OPTIONS للـ CORS
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