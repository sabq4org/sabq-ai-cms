import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { readFile } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    // محاولة الحصول على التوكن من الكوكيز
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على معلومات المصادقة' },
        { status: 401 }
      );
    }

    // التحقق من صحة التوكن
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'جلسة غير صالحة' },
        { status: 401 }
      );
    }

    // قراءة ملف المستخدمين
    const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = await readFile(usersFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    const users = data.users || [];

    // البحث عن المستخدم
    const user = users.find((u: any) => u.id === decoded.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // إزالة كلمة المرور من البيانات
    const { password: _, ...userWithoutPassword } = user;

    // إضافة معلومات إضافية
    const responseUser = {
      ...userWithoutPassword,
      is_admin: user.role === 'admin' || user.role === 'super_admin',
      loyaltyPoints: user.loyaltyPoints || 0,
      status: user.status || 'active',
      role: user.role || 'regular',
      isVerified: user.isVerified || false
    };

    return NextResponse.json({
      success: true,
      user: responseUser
    });

  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدم:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب بيانات المستخدم'
      },
      { status: 500 }
    );
  }
} 