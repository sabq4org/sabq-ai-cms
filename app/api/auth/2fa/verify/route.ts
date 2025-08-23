import { NextRequest, NextResponse } from 'next/server';
import { TwoFactorAuthService } from '@/lib/two-factor-auth';
import { UserManagementService, SecurityManager } from '@/lib/auth/user-management';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// POST: التحقق من رمز 2FA وتفعيله
export async function POST(request: NextRequest) {
  try {
    const { token, action, tempToken } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'الرمز مطلوب' }, { status: 400 });
    }
    
    if (!JWT_SECRET) {
      console.error('خطأ أمني: JWT_SECRET غير محدد');
      return NextResponse.json({ error: 'خطأ في التكوين' }, { status: 500 });
    }
    
    // الحصول على معرف المستخدم
    let userId: string;
    let isTemp2FA = false;
    
    if (tempToken) {
      // التحقق من الرمز المؤقت (عند تسجيل الدخول مع 2FA)
      try {
        const decoded = jwt.verify(tempToken, JWT_SECRET, {
          algorithms: ['HS256'],
          ignoreExpiration: false
        }) as any;
        
        if (!decoded.temp_2fa) {
          return NextResponse.json({ error: 'رمز مؤقت غير صالح' }, { status: 401 });
        }
        
        userId = decoded.user_id;
        isTemp2FA = true;
      } catch (error) {
        return NextResponse.json({ error: 'رمز مؤقت منتهي الصلاحية' }, { status: 401 });
      }
    } else {
      // التحقق من رمز المصادقة العادي
      const authHeader = request.headers.get('authorization');
      const authToken = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7)
        : request.cookies.get('auth-token')?.value || request.cookies.get('auth_token')?.value;
      
      if (!authToken) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
      }
      
      try {
        const decoded = jwt.verify(authToken, JWT_SECRET, {
          algorithms: ['HS256'],
          ignoreExpiration: false
        }) as any;
        
        userId = decoded.id || decoded.user_id || decoded.userId;
      } catch (error) {
        return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
      }
    }
    
    if (action === 'enable') {
      // تفعيل 2FA لأول مرة
      const success = await TwoFactorAuthService.enableTwoFactor(userId, token);
      
      if (!success) {
        return NextResponse.json({ 
          error: 'الرمز غير صحيح. تأكد من مزامنة الوقت في جهازك' 
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'تم تفعيل المصادقة الثنائية بنجاح'
      });
    } else if (isTemp2FA) {
      // التحقق من 2FA عند تسجيل الدخول
      const isValid = await TwoFactorAuthService.verifyUserToken(userId, token);
      
      if (!isValid) {
        return NextResponse.json({ 
          error: 'الرمز غير صحيح' 
        }, { status: 400 });
      }
      
      // الحصول على بيانات المستخدم
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          is_admin: true
        }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
      }
      
      // إنشاء رموز الوصول النهائية
      const result = await UserManagementService.createSessionTokens(user, {
        remember_me: false
      });
      
      return NextResponse.json({
        success: true,
        message: 'تم التحقق بنجاح',
        ...result
      });
    } else {
      // التحقق العادي من 2FA (للعمليات الحساسة)
      const isValid = await TwoFactorAuthService.verifyUserToken(userId, token);
      
      if (!isValid) {
        return NextResponse.json({ 
          error: 'الرمز غير صحيح' 
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'تم التحقق بنجاح'
      });
    }
  } catch (error) {
    console.error('خطأ في التحقق من 2FA:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
