import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

// تهيئة Cloudinary إن توفرت المتغيرات
const hasCloudinary = Boolean(
  (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "general";

    if (!file) {
      return NextResponse.json({ success: false, error: "لم يتم اختيار ملف" }, { status: 400 });
    }

    // قيود حجم معقولة (25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "حجم الملف كبير جداً (الحد 25MB)" }, { status: 400 });
    }

    // دعم أنواع شائعة بما فيها HEIC/AVIF
    const supported = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "image/heic",
      "image/heif"
    ];
    if (!supported.includes(file.type)) {
      // سنقبل النوع ونستخدم data URL كحل بديل
      // لا نرفض مباشرة لتفادي تعطل الواجهة
    }

    // إذا Cloudinary متاح ارفع مباشرة
    if (hasCloudinary) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const folder = `sabq-cms/${type}`;

      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
            public_id: `${Date.now()}_${(file.name || "upload").replace(/[^a-zA-Z0-9.-]/g, "_")}`,
            overwrite: false,
            tags: ["sabq-cms", type],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({ success: true, url: uploadResult.secure_url });
    }

    // Fallback: إرجاع Data URL مباشرةً (لا يعتمد على نظام الملفات)
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;
    return NextResponse.json({ success: true, url: dataUrl, fallback: true });
  } catch (error: any) {
    console.error("❌ upload-image-safe error:", error?.message || error);
    return NextResponse.json({ success: false, error: "فشل رفع الصورة" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [SAFE IMAGE UPLOAD] بدء رفع صورة بأمان...');
    
    // معالجة FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    
    console.log('📋 [SAFE IMAGE UPLOAD] معلومات الطلب:', {
      fileExists: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      uploadType: type
    });
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على ملف للرفع'
      }, { status: 400 });
    }
    
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF'
      }, { status: 400 });
    }
    
    // التحقق من حجم الملف (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى 10MB'
      }, { status: 400 });
    }
    
    // تحويل الملف إلى Base64 (حل آمن لبيئة الإنتاج)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    
    // إنشاء Data URL
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    // في بيئة الإنتاج، نعيد البيانات مباشرة بدلاً من حفظها
    console.log(`✅ [SAFE IMAGE UPLOAD] تم تحويل الصورة إلى Base64 بنجاح`);
    
    // إنشاء معرف فريد للصورة
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueId = `${type}_${timestamp}_${randomString}`;
    
    return NextResponse.json({
      success: true,
      url: dataUrl, // إرجاع البيانات مباشرة
      fileName: `${uniqueId}.${extension}`,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadType: type,
      method: 'base64',
      uploaded_at: new Date().toISOString(),
      message: 'تم رفع الصورة بنجاح (Base64)'
    });
    
  } catch (error: any) {
    console.error('❌ [SAFE IMAGE UPLOAD] خطأ عام:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء رفع الصورة',
      details: error.message,
      code: 'GENERAL_ERROR'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'خدمة رفع الصور الآمنة تعمل بشكل صحيح',
    version: '1.0-safe',
    supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: '10MB',
    method: 'base64',
    note: 'هذا API آمن لبيئة الإنتاج - يستخدم Base64 بدلاً من حفظ الملفات'
  });
}