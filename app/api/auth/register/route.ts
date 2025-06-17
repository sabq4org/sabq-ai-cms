import { NextRequest, NextResponse } from 'next/server';

// TODO: استيراد قاعدة البيانات الحقيقية
// import { prisma } from '@/lib/prisma'; // أو أي ORM تستخدمونه
// import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      gender,
      city,
      country,
      preferredCategories,
      subscribeNewsletter
    } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!fullName || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'الحقول المطلوبة مفقودة'
      }, { status: 400 });
    }

    // التحقق من تنسيق البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'البريد الإلكتروني غير صحيح'
      }, { status: 400 });
    }

    // التحقق من قوة كلمة المرور
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      }, { status: 400 });
    }

    // TODO: التحقق من وجود المستخدم في قاعدة البيانات الحقيقية
    // const existingUser = await prisma.user.findUnique({
    //   where: { email }
    // });
    // if (existingUser) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'البريد الإلكتروني مسجل مسبقاً'
    //   }, { status: 409 });
    // }

    // TODO: تشفير كلمة المرور
    // const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: إنشاء المستخدم في قاعدة البيانات الحقيقية
    // const newUser = await prisma.user.create({
    //   data: {
    //     fullName,
    //     email,
    //     phone: phone || '',
    //     password: hashedPassword,
    //     gender: gender || 'not_specified',
    //     city: city || '',
    //     country: country || 'السعودية',
    //     emailVerified: false,
    //     emailVerificationToken: crypto.randomUUID(),
    //     subscribeNewsletter: Boolean(subscribeNewsletter),
    //     status: 'pending'
    //   }
    // });

    // TODO: إضافة التفضيلات
    // if (preferredCategories && preferredCategories.length > 0) {
    //   await prisma.userPreference.createMany({
    //     data: preferredCategories.map(categoryId => ({
    //       userId: newUser.id,
    //       categoryId
    //     }))
    //   });
    // }

    // TODO: منح نقاط الولاء
    // await prisma.loyaltyPoint.create({
    //   data: {
    //     userId: newUser.id,
    //     points: 50,
    //     actionType: 'registration',
    //     description: 'مكافأة التسجيل الجديد'
    //   }
    // });

    // TODO: إرسال بريد التحقق
    // await sendVerificationEmail(newUser.email, newUser.emailVerificationToken);

    console.log(`طلب تسجيل جديد: ${fullName} (${email})`);

    return NextResponse.json({
      success: false,
      error: 'التسجيل متوقف مؤقتاً - يجب ربط النظام بقاعدة البيانات الحقيقية أولاً',
      message: 'يرجى إكمال إعداد قاعدة البيانات لتفعيل التسجيل'
    }, { status: 503 });

  } catch (error) {
    console.error('خطأ في تسجيل المستخدم:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'إحصائيات التسجيل متوقفة - يجب ربط النظام بقاعدة البيانات الحقيقية',
    data: {
      totalUsers: 0,
      verifiedUsers: 0,
      totalLoyaltyPoints: 0
    }
  });
} 