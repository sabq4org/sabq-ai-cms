import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// سر إعادة التحقق - يجب أن يكون متطابقاً مع السر المستخدم في الطلب
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || 'sabq-revalidation-secret';

export async function POST(request: NextRequest) {
  try {
    // استخراج البيانات من الطلب
    const body = await request.json();
    const { path, secret, tag } = body;
    
    // التحقق من السر
    if (secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { 
          revalidated: false, 
          message: 'السر غير صحيح' 
        },
        { status: 401 }
      );
    }
    
    // التحقق من وجود المسار أو العلامة
    if (!path && !tag) {
      return NextResponse.json(
        { 
          revalidated: false, 
          message: 'يجب تحديد المسار أو العلامة' 
        },
        { status: 400 }
      );
    }
    
    // إعادة تحقق صحة المسار
    if (path) {
      console.log(`🔄 إعادة تحقق صحة المسار: ${path}`);
      revalidatePath(path);
    }
    
    // إعادة تحقق صحة العلامة
    if (tag) {
      console.log(`🔄 إعادة تحقق صحة العلامة: ${tag}`);
      revalidateTag(tag);
    }
    
    // إرجاع استجابة نجاح
    return NextResponse.json({
      revalidated: true,
      message: `تم إعادة تحقق صحة ${path ? `المسار: ${path}` : ''} ${tag ? `العلامة: ${tag}` : ''}`,
      date: new Date().toISOString()
    });
    
  } catch (error: any) {
    // إرجاع استجابة خطأ
    console.error('❌ خطأ في إعادة تحقق الصحة:', error);
    return NextResponse.json(
      { 
        revalidated: false, 
        message: error.message || 'حدث خطأ أثناء إعادة تحقق الصحة',
        error: error.stack
      },
      { status: 500 }
    );
  }
}