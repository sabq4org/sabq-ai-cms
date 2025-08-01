import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 [SIMPLE UPLOAD] بدء رفع صورة...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'avatar';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على ملف' },
        { status: 400 }
      );
    }
    
    console.log(`📊 معلومات الملف: ${file.name}, الحجم: ${Math.round(file.size / 1024)}KB`);
    
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم. يجب أن يكون صورة' },
        { status: 400 }
      );
    }
    
    // التحقق من حجم الملف (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'حجم الملف كبير جداً. الحد الأقصى 5MB' },
        { status: 400 }
      );
    }
    
    // تحويل الصورة إلى base64 كحل مؤقت
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    
    // إنشاء URL data للصورة
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    console.log('✅ [SIMPLE UPLOAD] تم تحويل الصورة إلى base64 بنجاح');
    
    // في التطبيق الحقيقي، ستحفظ الصورة في خدمة سحابية أو مجلد
    // لكن الآن نُرجع data URL للاختبار
    
    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
      message: 'تم رفع الصورة بنجاح (مؤقتاً كـ base64)'
    });
    
  } catch (error: any) {
    console.error('❌ [SIMPLE UPLOAD] خطأ في رفع الصورة:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء رفع الصورة',
        details: error?.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'خدمة رفع الصور البسيطة تعمل',
    note: 'هذه خدمة مؤقتة تحول الصور إلى base64'
  });
}