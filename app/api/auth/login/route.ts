import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// مفتاح سري لتوقيع JWT (يجب تخزينه في متغير بيئة)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('محاولة تسجيل دخول:', { email });

    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // قراءة ملف المستخدمين
    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = await readFile(usersFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    const users = data.users || [];

    // البحث عن المستخدم بالبريد الإلكتروني
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من حالة الحساب
    if (user.status === 'suspended' || user.status === 'banned') {
      return NextResponse.json(
        { success: false, error: 'عذراً، حسابك موقوف أو محظور' },
        { status: 403 }
      );
    }

    // إزالة كلمة المرور من البيانات المرسلة
    const { password: _, ...userWithoutPassword } = user;

    console.log('تسجيل دخول ناجح للمستخدم:', user.email);

    // إضافة معلومات إضافية للمستخدم
    const responseUser = {
      ...userWithoutPassword,
      is_admin: user.role === 'admin' || user.role === 'super_admin',
      // التأكد من وجود جميع الحقول المطلوبة
      loyaltyPoints: user.loyaltyPoints || 0,
      status: user.status || 'active',
      role: user.role || 'regular',
      isVerified: user.isVerified || false
    };

    // إنشاء JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        is_admin: responseUser.is_admin
      },
      JWT_SECRET,
      { expiresIn: '7d' } // صلاحية لمدة 7 أيام
    );

    // إنشاء response مع الكوكيز
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: responseUser
    });

    // إضافة الكوكيز الآمنة
    const isProduction = process.env.NODE_ENV === 'production';
    
    // كوكيز للمستخدم
    response.cookies.set('user', JSON.stringify(responseUser), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: '/'
    });

    // كوكيز للتوكن
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: '/'
    });

    return response;
    
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في عملية تسجيل الدخول' },
      { status: 500 }
    );
  }
} 