import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // فحص متغيرات البيئة
    const cloudinaryConfig = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    };

    console.log('🔍 فحص إعدادات Cloudinary:', {
      cloudName: cloudinaryConfig.cloudName,
      hasApiKey: !!cloudinaryConfig.apiKey,
      hasApiSecret: !!cloudinaryConfig.apiSecret,
      uploadPreset: cloudinaryConfig.uploadPreset
    });

    // التحقق من وجود المتغيرات المطلوبة
    const missingVariables = [];
    if (!cloudinaryConfig.cloudName) missingVariables.push('CLOUDINARY_CLOUD_NAME');
    if (!cloudinaryConfig.apiKey) missingVariables.push('CLOUDINARY_API_KEY');
    if (!cloudinaryConfig.apiSecret) missingVariables.push('CLOUDINARY_API_SECRET');

    if (missingVariables.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'متغيرات البيئة مفقودة',
        missingVariables,
        message: 'يجب إعداد متغيرات البيئة الخاصة بـ Cloudinary',
        setupInstructions: {
          step1: 'إنشاء حساب مجاني في cloudinary.com',
          step2: 'الحصول على بيانات الاعتماد من Dashboard',
          step3: 'إضافة المتغيرات في ملف .env.local',
          variables: {
            CLOUDINARY_CLOUD_NAME: 'اسم السحابة من Dashboard',
            CLOUDINARY_API_KEY: 'مفتاح API من Dashboard',
            CLOUDINARY_API_SECRET: 'سر API من Dashboard (يجب أن يبقى سرياً)',
            NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: 'اسم Upload Preset'
          }
        }
      }, { status: 400 });
    }

    // اختبار الاتصال بـ Cloudinary
    try {
      // إنشاء صورة بيكسل واحد للاختبار
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      const formData = new FormData();
      // تحويل base64 إلى blob
      const response = await fetch(`data:image/png;base64,${testImageBase64}`);
      const blob = await response.blob();
      
      formData.append('file', blob, 'test.png');
      // جرب عدة presets مختلفة
      const presets = ['ml_default', 'unsigned_preset', 'sabq_preset'];
      formData.append('upload_preset', presets[0]);

      console.log('🚀 اختبار رفع صورة تجريبية...');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const uploadData = await uploadResponse.json();
      console.log('📊 نتيجة الاختبار:', uploadData);

      if (uploadResponse.ok && uploadData.secure_url) {
        return NextResponse.json({
          success: true,
          message: '✅ تم إعداد Cloudinary بنجاح!',
          testResult: {
            url: uploadData.secure_url,
            publicId: uploadData.public_id,
            cloudName: cloudinaryConfig.cloudName
          },
          config: {
            cloudName: cloudinaryConfig.cloudName,
            uploadPreset: cloudinaryConfig.uploadPreset
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'فشل اختبار Cloudinary',
          details: uploadData,
          message: uploadData.error?.message || 'خطأ غير معروف في Cloudinary',
          troubleshooting: {
            possibleCauses: [
              'Upload Preset غير صحيح أو غير موجود',
              'Cloud Name غير صحيح',
              'الإعدادات مقيدة في Cloudinary Dashboard',
              'مشكلة في الشبكة'
            ],
            nextSteps: [
              'تحقق من صحة Upload Preset في Cloudinary Dashboard',
              'تأكد من أن Upload Preset مُعد كـ "Unsigned"',
              'تحقق من إعدادات الأمان في Cloudinary'
            ]
          }
        }, { status: 400 });
      }

    } catch (uploadError) {
      console.error('❌ خطأ في اختبار Cloudinary:', uploadError);
      
      return NextResponse.json({
        success: false,
        error: 'خطأ في الاتصال بـ Cloudinary',
        details: uploadError instanceof Error ? uploadError.message : 'خطأ غير معروف',
        message: 'فشل في الاتصال بخدمة Cloudinary',
        troubleshooting: {
          possibleCauses: [
            'مشكلة في الشبكة',
            'إعدادات Cloudinary غير صحيحة',
            'حساب Cloudinary معلق أو محدود'
          ],
          recommendations: [
            'تحقق من اتصال الإنترنت',
            'راجع إعدادات Cloudinary Dashboard',
            'جرب إنشاء Upload Preset جديد'
          ]
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ خطأ عام في فحص Cloudinary:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في الخادم',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      message: 'حدث خطأ أثناء فحص إعدادات Cloudinary'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'setup') {
      // إعداد Cloudinary تلقائياً
      const setupInstructions = {
        message: '🛠️ خطوات إعداد Cloudinary',
        steps: [
          {
            step: 1,
            title: 'إنشاء حساب Cloudinary',
            url: 'https://cloudinary.com/users/register/free',
            description: 'أنشئ حساب مجاني في Cloudinary'
          },
          {
            step: 2,
            title: 'الحصول على بيانات الاعتماد',
            description: 'انسخ Cloud Name, API Key, API Secret من Dashboard'
          },
          {
            step: 3,
            title: 'إنشاء Upload Preset',
            description: 'اذهب إلى Settings > Upload > Add upload preset',
            settings: {
              mode: 'Unsigned',
              folder: 'sabq-cms',
              allowed_formats: 'jpg,png,gif,webp'
            }
          },
          {
            step: 4,
            title: 'تحديث متغيرات البيئة',
            envVariables: `
# إضافة هذه المتغيرات في .env.local
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset-name
            `
          }
        ]
      };

      return NextResponse.json({
        success: true,
        setupInstructions
      });
    }

    return NextResponse.json({
      success: false,
      error: 'إجراء غير معروف'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ خطأ في معالجة الطلب:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في معالجة الطلب',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 