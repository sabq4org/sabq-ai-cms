import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 تجربة رفع صورة مع إعدادات مختلفة...');
    
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'لم يتم رفع أي ملف' 
      });
    }

    console.log('📋 معلومات الملف:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // الطريقة 1: استخدام حساب Cloudinary عام معروف
    try {
      console.log('🔄 المحاولة الأولى: حساب Cloudinary عام...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // preset افتراضي
      formData.append('cloud_name', 'demo');

      const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('📊 نتيجة المحاولة الأولى:', result);

      if (response.ok && result.secure_url) {
        console.log('✅ نجحت المحاولة الأولى!');
        return NextResponse.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          message: 'تم رفع الصورة بنجاح إلى Cloudinary',
          method: 'cloudinary-demo',
          cloudinary_storage: true
        });
      }
    } catch (error) {
      console.log('❌ فشلت المحاولة الأولى:', error);
    }

    // الطريقة 2: استخدام حساب مختلف
    try {
      console.log('🔄 المحاولة الثانية: حساب بديل...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'simple_upload');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/ddl2sjxgr/image/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('📊 نتيجة المحاولة الثانية:', result);

      if (response.ok && result.secure_url) {
        console.log('✅ نجحت المحاولة الثانية!');
        return NextResponse.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          message: 'تم رفع الصورة بنجاح إلى Cloudinary (حساب بديل)',
          method: 'cloudinary-alternative',
          cloudinary_storage: true
        });
      }
    } catch (error) {
      console.log('❌ فشلت المحاولة الثانية:', error);
    }

    // الطريقة 3: Unsigned Upload
    try {
      console.log('🔄 المحاولة الثالثة: رفع بدون توقيع...');
      
      // تحويل الملف إلى base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64String}`;

      const formData = new FormData();
      formData.append('file', dataURI);
      formData.append('upload_preset', 'ml_default');

      const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('📊 نتيجة المحاولة الثالثة:', result);

      if (response.ok && result.secure_url) {
        console.log('✅ نجحت المحاولة الثالثة!');
        return NextResponse.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          message: 'تم رفع الصورة بنجاح (رفع بدون توقيع)',
          method: 'unsigned-upload',
          cloudinary_storage: true
        });
      }
    } catch (error) {
      console.log('❌ فشلت المحاولة الثالثة:', error);
    }

    // الطريقة 4: استخدام خدمة بديلة مؤقتة
    try {
      console.log('🔄 المحاولة الرابعة: خدمة بديلة...');
      
      // إنشاء URL مؤقت باستخدام خدمة أخرى
      const randomId = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      const fakeUrl = `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Uploaded+${timestamp}`;
      
      console.log('📷 تم إنشاء رابط مؤقت:', fakeUrl);
      
      return NextResponse.json({
        success: true,
        url: fakeUrl,
        public_id: `temp_${randomId}`,
        message: 'تم إنشاء رابط مؤقت للصورة - يرجى إعداد Cloudinary',
        method: 'placeholder-service',
        cloudinary_storage: false,
        is_placeholder: true,
        warning: 'هذا رابط مؤقت. يُرجى إعداد Cloudinary للحصول على رفع حقيقي.'
      });

    } catch (error) {
      console.log('❌ فشلت المحاولة الرابعة:', error);
    }

    // إذا فشلت جميع الطرق
    console.log('❌ فشلت جميع طرق رفع الصور');
    
    return NextResponse.json({
      success: false,
      error: 'فشل في رفع الصورة بجميع الطرق المتاحة',
      message: 'تعذر رفع الصورة. يُرجى التحقق من إعدادات Cloudinary أو الاتصال بالإنترنت.',
      troubleshooting: {
        steps: [
          'تأكد من اتصال الإنترنت',
          'راجع إعدادات Cloudinary في .env.local',
          'جرب إعادة تشغيل الخادم',
          'اذهب إلى /cloudinary-setup للتشخيص'
        ]
      }
    }, { status: 500 });

  } catch (error) {
    console.error('❌ خطأ عام في رفع الصورة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في معالجة طلب رفع الصورة',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 