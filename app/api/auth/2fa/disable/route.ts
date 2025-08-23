import { NextRequest, NextResponse } from 'next/server';
import { TwoFactorAuthService } from '@/lib/two-factor-auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// POST: تعطيل 2FA
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : request.cookies.get('auth-token')?.value || request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    
    if (!JWT_SECRET) {
      console.error('خطأ أمني: JWT_SECRET غير محدد');
      return NextResponse.json({ error: 'خطأ في التكوين' }, { status: 500 });
    }
    
    let userId: string;
    
    try {
      const decoded = jwt.verify(authToken, JWT_SECRET, {
        algorithms: ['HS256'],
        ignoreExpiration: false
      }) as any;
      
      userId = decoded.id || decoded.user_id || decoded.userId;
      
      if (!userId) {
        return NextResponse.json({ error: 'بيانات المستخدم غير كاملة' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
    }
    
    // تعطيل 2FA
    const success = await TwoFactorAuthService.disableTwoFactor(userId);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'فشل في تعطيل المصادقة الثنائية' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم تعطيل المصادقة الثنائية'
    });
  } catch (error) {
    console.error('خطأ في تعطيل 2FA:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
