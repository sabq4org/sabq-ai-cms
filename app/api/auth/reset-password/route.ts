// API لإعادة تعيين كلمة المرور - نظام سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import { UserManagementService } from '@/lib/auth/user-management';
import { z } from 'zod';

// Schema للتحقق من البيانات
const ResetRequestSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح')
});

const ResetConfirmSchema = z.object({
  token: z.string().min(1, 'رمز إعادة التعيين مطلوب'),
  new_password: z.string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص')
});

// طلب إعادة تعيين كلمة المرور
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق إذا كان طلب إعادة تعيين أم تأكيد
    if (body.token && body.new_password) {
      // تأكيد إعادة التعيين
      const validationResult = ResetConfirmSchema.safeParse(body);
      
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

      const result = await UserManagementService.confirmPasswordReset(
        validationResult.data.token,
        validationResult.data.new_password
      );

      return NextResponse.json(
        {
          success: result.success,
          message: result.message,
          error: result.error
        },
        { status: result.success ? 200 : 400 }
      );

    } else {
      // طلب إعادة التعيين
      const validationResult = ResetRequestSchema.safeParse(body);
      
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

      const result = await UserManagementService.requestPasswordReset(
        validationResult.data.email
      );

      return NextResponse.json(
        {
          success: result.success,
          message: result.message,
          error: result.error
        },
        { status: result.success ? 200 : 400 }
      );
    }

  } catch (error: any) {
    console.error('Password reset API error:', error);
    
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