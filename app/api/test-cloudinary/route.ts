import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم اختيار ملف' },
        { status: 400 }
      );
    }

    // إعداد FormData لـ Cloudinary
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', file);
    cloudinaryData.append('upload_preset', 'simple_upload');
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    // رفع إلى Cloudinary
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: cloudinaryData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'فشل رفع الصورة',
          details: data,
          cloudName,
          status: response.status
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      cloudName
    });
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في الخادم',
        message: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb',
    uploadPreset: 'simple_upload',
    testEndpoint: '/api/test-cloudinary',
    usage: 'POST مع FormData يحتوي على file'
  });
} 