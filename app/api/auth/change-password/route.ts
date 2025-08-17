// API لتغيير كلمة المرور - نظام سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService, PasswordChangeSchema } from '@/lib/auth/user-management';
import { authMiddleware } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const authResult = await authMiddleware(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'غير مصرح بالوصول'
        },
        { status: 401 }
      );
    }

    // قراءة البيانات
    const body = await request.json();
    
    // التحقق من صحة البيانات
    const validationResult = PasswordChangeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات غير صحيحة',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    // تغيير كلمة المرور
    const result = await UserManagementService.changePassword(
      authResult.user.id,
      validationResult.data
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      );
    }

    // إرسال الاستجابة الناجحة
    const response = NextResponse.json(
      {
        success: true,
        message: result.message
      },
      { status: 200 }
    );

    // حذف cookies لإجبار المستخدم على إعادة تسجيل الدخول
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;

  } catch (error: any) {
    console.error('Change password API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ داخلي في الخادم'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
