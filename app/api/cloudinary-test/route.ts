import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 فحص إعدادات Cloudinary...');
    
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'محدد' : 'غير محدد',
      cloudinary_url: process.env.CLOUDINARY_URL ? 'محدد' : 'غير محدد'
    };

    console.log('الإعدادات:', config);

    const isValid = !!(config.cloud_name && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

    return NextResponse.json({
      status: 'success',
      cloudinary_configured: isValid,
      config: config,
      details: {
        cloud_name_length: config.cloud_name?.length || 0,
        api_key_length: process.env.CLOUDINARY_API_KEY?.length || 0,
        api_secret_length: process.env.CLOUDINARY_API_SECRET?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ خطأ في فحص Cloudinary:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}
