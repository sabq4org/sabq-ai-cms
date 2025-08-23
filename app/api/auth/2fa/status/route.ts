import { NextRequest, NextResponse } from 'next/server';
import { TwoFactorAuthService } from '@/lib/two-factor-auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// GET: التحقق من حالة 2FA
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : request.cookies.get('auth-token')?.value || request.cookies.get('auth_token')?.value;
    
    if (!authToken || !JWT_SECRET) {
      return NextResponse.json({ enabled: false });
    }
    
    try {
      const decoded = jwt.verify(authToken, JWT_SECRET, {
        algorithms: ['HS256'],
        ignoreExpiration: false
      }) as any;
      
      const userId = decoded.id || decoded.user_id || decoded.userId;
      const isEnabled = await TwoFactorAuthService.isEnabled(userId);
      
      return NextResponse.json({ enabled: isEnabled });
    } catch (error) {
      return NextResponse.json({ enabled: false });
    }
  } catch (error) {
    console.error('خطأ في التحقق من حالة 2FA:', error);
    return NextResponse.json({ enabled: false });
  }
}
