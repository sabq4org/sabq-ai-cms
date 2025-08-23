import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
const SECURE_KEYS = ['authToken', 'userId', 'user'];

// GET: الحصول على البيانات الآمنة
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const key = request.nextUrl.searchParams.get('key');
    
    if (!key || !SECURE_KEYS.includes(key)) {
      return NextResponse.json({ error: 'مفتاح غير صالح' }, { status: 400 });
    }
    
    // الحصول على القيمة من HttpOnly cookie
    const secureValue = cookieStore.get(`secure_${key}`);
    
    if (!secureValue) {
      return NextResponse.json({ value: null });
    }
    
    // فك التشفير إذا لزم الأمر
    try {
      const decrypted = Buffer.from(secureValue.value, 'base64').toString('utf-8');
      return NextResponse.json({ value: decrypted });
    } catch {
      return NextResponse.json({ value: secureValue.value });
    }
  } catch (error) {
    console.error('خطأ في قراءة البيانات الآمنة:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST: حفظ البيانات بشكل آمن
export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    
    if (!key || !value || !SECURE_KEYS.includes(key)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }
    
    // تشفير القيمة
    const encrypted = Buffer.from(value).toString('base64');
    
    // حفظ في HttpOnly cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: `secure_${key}`,
      value: encrypted,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 أيام
    });
    
    return response;
  } catch (error) {
    console.error('خطأ في حفظ البيانات الآمنة:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE: مسح البيانات الآمنة
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // مسح جميع cookies الآمنة
    SECURE_KEYS.forEach(key => {
      response.cookies.set({
        name: `secure_${key}`,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0 // حذف فوري
      });
    });
    
    return response;
  } catch (error) {
    console.error('خطأ في مسح البيانات الآمنة:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
