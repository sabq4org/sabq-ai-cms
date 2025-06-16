import { NextRequest, NextResponse } from 'next/server';

// محاكاة قاعدة البيانات في الذاكرة
const users: any[] = [];
const userPreferences: any[] = [];
const loyaltyPoints: any[] = [];

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

    // التحقق من وجود البريد مسبقاً
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'البريد الإلكتروني مسجل مسبقاً'
      }, { status: 409 });
    }

    // إنشاء المستخدم الجديد
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      phone: phone || '',
      password, // في التطبيق الحقيقي يجب تشفيرها
      gender: gender || 'not_specified',
      city: city || '',
      country: country || 'السعودية',
      emailVerified: false,
      emailVerificationToken: Math.random().toString(36),
      subscribeNewsletter: Boolean(subscribeNewsletter),
      preferredCategories: preferredCategories || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // حفظ المستخدم
    users.push(newUser);

    // إنشاء التفضيلات
    if (preferredCategories && preferredCategories.length > 0) {
      for (const categoryId of preferredCategories) {
        userPreferences.push({
          id: Date.now().toString() + Math.random(),
          userId: newUser.id,
          categoryId,
          createdAt: new Date().toISOString()
        });
      }
    }

    // منح نقاط الولاء (50 نقطة)
    loyaltyPoints.push({
      id: Date.now().toString() + Math.random(),
      userId: newUser.id,
      points: 50,
      actionType: 'registration',
      description: 'مكافأة التسجيل الجديد',
      createdAt: new Date().toISOString()
    });

    console.log(`تسجيل مستخدم جديد: ${fullName} (${email})`);

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء حسابك بنجاح!',
      data: {
        userId: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        loyaltyPoints: 50,
        emailVerificationRequired: true
      }
    }, { status: 201 });

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
    success: true,
    data: {
      totalUsers: users.length,
      verifiedUsers: users.filter(u => u.emailVerified).length,
      totalLoyaltyPoints: loyaltyPoints.reduce((sum, p) => sum + p.points, 0)
    }
  });
} 