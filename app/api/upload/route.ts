import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary-server';
import { getSupabaseClient } from '@/lib/supabase';
import { optimizeImageBuffer, validateImage } from '@/lib/image-optimizer';

// دالة لتسجيل محاولات رفع الصور
async function logUploadAttempt(details: {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadType: string;
  status: 'success' | 'failed' | 'placeholder';
  errorMessage?: string;
  cloudinaryUrl?: string;
  isPlaceholder: boolean;
}) {
  try {
    const supabase = getSupabaseClient();
    
    await supabase.from('upload_logs').insert({
      file_name: details.fileName,
      file_size: details.fileSize,
      file_type: details.fileType,
      upload_type: details.uploadType,
      status: details.status,
      error_message: details.errorMessage,
      cloudinary_url: details.cloudinaryUrl,
      is_placeholder: details.isPlaceholder,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('خطأ في تسجيل محاولة الرفع:', error);
  }
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع أي ملف' });
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'نوع الملف غير مسموح',
        message: 'يسمح فقط بملفات الصور (JPEG, PNG, GIF, WebP)'
      }, { status: 400 });
    }

    // التحقق من حجم الملف (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'حجم الملف كبير جداً',
        message: 'حجم الملف يجب أن يكون أقل من 10 ميجابايت'
      }, { status: 400 });
    }

    // التحقق من توفر Cloudinary
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                         process.env.CLOUDINARY_API_KEY && 
                         process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      try {
        // تحديد مجلد Cloudinary حسب النوع
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

        console.log('🔄 تحسين الصورة...');
        
        // تحويل الملف إلى Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // تحسين الصورة وتحويلها إلى WebP
        const optimizedBuffer = await optimizeImageBuffer(buffer, {
          format: 'webp',
          quality: 85,
          width: 1920, // الحد الأقصى للعرض
          height: 1080, // الحد الأقصى للارتفاع
        });
        
        // إنشاء ملف جديد محسّن
        const optimizedFile = new File([optimizedBuffer], 
          file.name.replace(/\.[^/.]+$/, '.webp'), 
          { type: 'image/webp' }
        );

        console.log('📤 رفع الصورة المحسنة إلى Cloudinary...');

        // رفع الصورة المحسنة إلى Cloudinary
        const result = await uploadToCloudinary(optimizedFile, {
          folder,
          fileName: optimizedFile.name
        });

        console.log('✅ تم رفع الصورة المحسنة إلى Cloudinary بنجاح:', result.url);

        // تسجيل النجاح
        await logUploadAttempt({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadType: type,
          status: 'success',
          cloudinaryUrl: result.url,
          isPlaceholder: false
        });

        return NextResponse.json({ 
          success: true, 
          url: result.url,
          public_id: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          message: 'تم رفع الصورة إلى السحابة بنجاح',
          cloudinary_storage: true
        });

      } catch (uploadError) {
        console.error('❌ خطأ في رفع الملف إلى Cloudinary:', uploadError);
        
        // تسجيل الفشل
        await logUploadAttempt({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadType: type,
          status: 'failed',
          errorMessage: uploadError instanceof Error ? uploadError.message : 'خطأ غير معروف',
          isPlaceholder: true
        });
        
        // السماح بالاستمرار مع placeholder
      }
    }

    // إذا لم يتوفر Cloudinary، استخدم placeholder
    console.log('⚠️ استخدام صورة placeholder - Cloudinary غير متوفر');
    
    // تسجيل استخدام placeholder
    await logUploadAttempt({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadType: type,
      status: 'placeholder',
      errorMessage: hasCloudinary ? 'فشل رفع الصورة إلى Cloudinary' : 'Cloudinary غير مُعد',
      isPlaceholder: true
    });
    
    // إرجاع صورة placeholder حسب النوع
    let placeholderUrl = '/placeholder.jpg';
    if (type === 'avatar') {
      placeholderUrl = '/images/placeholder-avatar.jpg';
    } else if (type === 'featured') {
      placeholderUrl = '/images/placeholder-featured.jpg';
    }

    return NextResponse.json({ 
      success: true, 
      url: placeholderUrl,
      public_id: 'placeholder_' + Date.now(),
      width: 800,
      height: 600,
      format: 'jpg',
      bytes: 0,
      message: 'تم استخدام صورة مؤقتة - يرجى إعداد Cloudinary للرفع الحقيقي',
      cloudinary_storage: false,
      is_placeholder: true
    });

  } catch (error) {
    console.error('❌ خطأ في معالجة الملف:', error);
    
    // إرجاع استجابة خطأ صحيحة
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'فشل في معالجة الملف',
      message: 'حدث خطأ أثناء معالجة الطلب',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
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