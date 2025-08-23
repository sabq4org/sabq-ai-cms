import { NextRequest, NextResponse } from 'next/server';
import { TwoFactorAuthService } from '@/lib/two-factor-auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// POST: إنشاء سر 2FA جديد
export async function POST(request: NextRequest) {
  try {
    // التحقق من المستخدم
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
    let userEmail: string;
    
    try {
      const decoded = jwt.verify(authToken, JWT_SECRET, {
        algorithms: ['HS256'],
        ignoreExpiration: false
      }) as any;
      
      userId = decoded.id || decoded.user_id || decoded.userId;
      userEmail = decoded.email;
      
      if (!userId || !userEmail) {
        return NextResponse.json({ error: 'بيانات المستخدم غير كاملة' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
    }
    
    // إنشاء سر 2FA
    const twoFactorData = await TwoFactorAuthService.generateSecret(userId, userEmail);
    
    return NextResponse.json({
      success: true,
      qrCode: twoFactorData.qrCodeUrl,
      secret: twoFactorData.secret,
      backupCodes: twoFactorData.backupCodes,
      message: 'امسح رمز QR باستخدام تطبيق المصادقة (Google Authenticator أو Authy)'
    });
  } catch (error) {
    console.error('خطأ في إنشاء 2FA:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
