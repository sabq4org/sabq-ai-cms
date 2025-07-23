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

    // محاولة رفع الصورة بطرق متعددة
    console.log('🚀 بدء رفع الصورة بطرق متعددة...');

    // الطريقة 1: Cloudinary العادي
    if (hasCloudinary) {
      try {
        console.log('📤 المحاولة 1: رفع إلى Cloudinary العادي...');
        
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
          case 'categories':
            folder = 'sabq-cms/categories';
            break;
          default:
            folder = 'sabq-cms/general';
        }

        const result = await uploadToCloudinary(file, {
          folder,
          fileName: file.name
        });

        console.log('✅ نجحت المحاولة 1:', result.url);

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
        console.error('❌ فشلت المحاولة 1:', uploadError);
      }
    }

    // الطريقة 2: Cloudinary المباشر بـ API (fallback)
    if (hasCloudinary) {
      try {
        console.log('📤 المحاولة 2: رفع مباشر إلى Cloudinary API...');
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64Data}`;
        
        const formData = new FormData();
        formData.append('file', dataUrl);
        formData.append('api_key', process.env.CLOUDINARY_API_KEY!);
        formData.append('timestamp', Math.round(Date.now() / 1000).toString());
        formData.append('folder', `sabq-cms/${type}`);
        
        // توقيع الطلب
        const crypto = require('crypto');
        const paramsToSign = `folder=sabq-cms/${type}&timestamp=${Math.round(Date.now() / 1000)}`;
        const signature = crypto
          .createHash('sha1')
          .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
          .digest('hex');
        
        formData.append('signature', signature);
        
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dybhezmvb';
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

      if (response.ok) {
        const result = await response.json();
        if (result.secure_url) {
          console.log('✅ نجحت المحاولة 2:', result.secure_url);
          
          await logUploadAttempt({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadType: type,
            status: 'success',
            cloudinaryUrl: result.secure_url,
            isPlaceholder: false
          });

          return NextResponse.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            message: 'تم رفع الصورة بنجاح (طريقة بديلة)',
            cloudinary_storage: true
          });
        }
      }
    } catch (fallbackError) {
      console.error('❌ فشلت المحاولة 2:', fallbackError);
    }
    }

    // تسجيل الفشل النهائي
    await logUploadAttempt({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadType: type,
      status: 'failed',
      errorMessage: 'فشلت جميع طرق الرفع',
      isPlaceholder: true
    });

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