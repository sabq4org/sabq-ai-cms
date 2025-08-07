import { NextRequest, NextResponse } from 'next/server';
import { setUserCookie, getDefaultUser } from '@/lib/auth-utils';

// تسجيل دخول تجريبي للتطوير
export async function POST() {
  try {
    // إنشاء مستخدم افتراضي
    const user = {
      id: 'dev-user-id',
      name: 'مطور المحتوى',
      email: 'dev@sabq.org',
      role: 'editor'
    };
    
    // حفظ المستخدم في الكوكيز
    await setUserCookie(user);
    
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user
    });
    
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return NextResponse.json({
      error: 'خطأ في تسجيل الدخول'
    }, { status: 500 });
  }
}

// جلب بيانات المستخدم الحالي
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'يمكنك استخدام POST لتسجيل دخول تجريبي',
    note: 'هذا للتطوير فقط'
  });
}
