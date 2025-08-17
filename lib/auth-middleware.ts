import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    // جلب التوكن من الكوكيز
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }

    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    // التحقق من تفعيل البريد الإلكتروني
    if (!decoded.emailVerified) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'user',
      emailVerified: decoded.emailVerified
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function requireAuth(user: AuthUser | null): NextResponse | null {
  if (!user) {
    return NextResponse.json(
      { error: 'يجب تسجيل الدخول للمتابعة' },
      { status: 401 }
    );
  }
  
  if (!user.emailVerified) {
    return NextResponse.json(
      { error: 'يجب تفعيل البريد الإلكتروني أولاً' },
      { status: 403 }
    );
  }
  
  return null;
} 