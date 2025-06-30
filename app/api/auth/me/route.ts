import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
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

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        isAdmin: true,
        loyaltyPoints: {
          select: {
            points: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // حساب مجموع نقاط الولاء
    const totalLoyaltyPoints = user.loyaltyPoints.reduce((total, lp) => total + lp.points, 0);

    // إضافة معلومات إضافية
    const responseUser = {
      ...user,
      is_admin: user.isAdmin || user.role === 'admin' || user.role === 'super_admin',
      loyaltyPoints: totalLoyaltyPoints,
      status: 'active', // قيمة افتراضية
      role: user.role || 'user',
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
  } finally {
    await prisma.$disconnect();
  }
} 