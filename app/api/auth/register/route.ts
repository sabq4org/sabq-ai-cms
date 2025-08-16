// API لتسجيل المستخدمين الجدد - نظام سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService, UserCreateSchema } from '@/lib/auth/user-management';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من صحة البيانات
    const validationResult = UserCreateSchema.safeParse(body);
    
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

    // تسجيل المستخدم
    const result = await UserManagementService.registerUser(validationResult.data);

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
        message: result.message,
        user: {
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.name,
          role: result.user?.role,
          is_verified: result.user?.is_verified,
          profile_completed: result.user?.profile_completed
        }
      },
      { status: 201 }
    );

    // تعيين cookies آمنة
    if (result.access_token && result.refresh_token) {
      response.cookies.set('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 دقيقة
        path: '/'
      });

      response.cookies.set('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 يوم
        path: '/'
      });
    }

    return response;

  } catch (error: any) {
    console.error('Registration API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ داخلي في الخادم'
      },
      { status: 500 }
    );
  }
}

// تحديد CORS headers
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