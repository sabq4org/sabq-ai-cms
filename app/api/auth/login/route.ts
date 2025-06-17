import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('محاولة تسجيل دخول:', { email, password });

    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // مستخدم اختبار ثابت - مؤقت للتطوير
    if ((email.toLowerCase() === 'ali@alhazmi.org' || email === 'test@test.com') && password === '123456') {
      console.log('تسجيل دخول ناجح - مستخدم اختبار');
      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: 'test-user',
          name: 'علي الحازمي',
          email: email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    // قراءة ملف المستخدمين
    try {
      const fileContent = await fs.readFile(usersFilePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      console.log('المستخدمون المسجلون:', data.users.map((u: any) => u.email));
      
      // البحث عن المستخدم (غير حساس لحالة الأحرف)
      const user = data.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      console.log('نتيجة البحث:', user ? 'تم العثور على المستخدم' : 'لم يتم العثور على المستخدم');
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }

      // التحقق من كلمة المرور
      console.log('التحقق من كلمة المرور...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('صحة كلمة المرور:', isPasswordValid);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }

      // إرجاع بيانات المستخدم (بدون كلمة المرور)
      const { password: _, ...userWithoutPassword } = user;
      
      console.log('تسجيل دخول ناجح للمستخدم:', user.email);
      
      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: userWithoutPassword
      });
      
    } catch (error) {
      console.error('خطأ في قراءة ملف المستخدمين:', error);
      // إذا لم يكن الملف موجوداً
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في عملية تسجيل الدخول' },
      { status: 500 }
    );
  }
} 