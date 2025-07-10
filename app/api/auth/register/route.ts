import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email';
import crypto from 'crypto';


export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // التحقق من البيانات المطلوبة
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني غير صحيح' },
        { status: 400 }
      );
    }

    // التحقق من طول كلمة المرور
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود بريد إلكتروني مكرر
    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء معرف فريد
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // إنشاء المستخدم في قاعدة البيانات
    const newUser = await prisma.users.create({
      data: {
        id: userId,
        name,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        is_verified: false,
        role: 'user',
        is_admin: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // توليد رمز التحقق
    const verificationCode = generateVerificationCode();
    
    // حفظ رمز التحقق في قاعدة البيانات
    await prisma.email_verification_codes.create({
      data: {
        id: `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 دقائق
        created_at: new Date()
      }
    });

    // إرسال بريد التحقق
    const emailSent = await sendVerificationEmail(email, name, verificationCode);
    
    if (!emailSent) {
      console.warn('⚠️ تحذير: فشل إرسال بريد التحقق');
    }

    // إنشاء نقاط ولاء أولية (50 نقطة ترحيبية)
    await prisma.loyalty_points.create({
      data: {
        id: `lp-${crypto.randomUUID()}`,
        user_id: newUser.id,
        points: 50,
        action: 'registration_bonus'
      }
    });

    // إرجاع بيانات المستخدم (بدون كلمة المرور)
    const { password_hash, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'تم إنشاء الحساب بنجاح. تم إرسال رمز التحقق إلى بريدك الإلكتروني' 
        : 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword,
      requiresVerification: true
    });
    
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في عملية التسجيل',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const [totalUsers, verifiedUsers, totalPoints] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { is_verified: true } }),
      prisma.loyalty_points.aggregate({
        _sum: { points: true }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        totalLoyaltyPoints: totalPoints._sum.points || 0
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الإحصائيات'
    }, { status: 500 });
  }
} 