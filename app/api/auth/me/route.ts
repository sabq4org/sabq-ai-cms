import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma, { ensureConnection } from '@/lib/prisma';
import { handleOptions, corsResponse, addCorsHeaders } from '@/lib/cors';













// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return handleOptions();
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 بدء التحقق من هوية المستخدم...')
    
    // التأكد من الاتصال بقاعدة البيانات أولاً
    const isConnected = await ensureConnection();
    if (!isConnected) {
      console.error('❌ فشل الاتصال بقاعدة البيانات')
      return corsResponse({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, 500);
    }

    // Debugging: طباعة متغيرات البيئة للتأكد من وجودها
    console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);
    console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);

    // محاولة الحصول على التوكن من الكوكيز أو من Authorization header
    let token = request.cookies.get('auth-token')?.value;
    
    // إذا لم يوجد في الكوكيز، جرب cookie بإسم 'user'
    if (!token) {
      const userCookie = request.cookies.get('user')?.value;
      if (userCookie) {
        try {
          // فك تشفير URL encoding
          const decodedCookie = decodeURIComponent(userCookie);
          const userObject = JSON.parse(decodedCookie);
          if (userObject.id) {
            token = userCookie; // استخدم المعرف من cookie
          }
        } catch (e) {
          console.log('فشل في تحليل user cookie:', e);
        }
      }
    }
    
    // إذا لم يوجد في الكوكيز، جرب من Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return corsResponse(
        { success: false, error: 'لم يتم العثور على معلومات المصادقة' },
        401
      );
    }

    // التحقق من صحة التوكن
    let decoded: any;
    try {
      // محاولة فك تشفير JWT أولاً
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // إذا فشل JWT، جرب تحليل JSON من user cookie
      try {
        const decodedCookie = decodeURIComponent(token);
        const userObject = JSON.parse(decodedCookie);
        if (userObject.id) {
          decoded = userObject;
        } else {
          throw new Error('لا يحتوي على معرف مستخدم');
        }
      } catch (jsonError) {
        return corsResponse(
          { success: false, error: 'جلسة غير صالحة' },
          401
        );
      }
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
        avatar: true,
        is_admin: true
      }
    });

    if (!user) {
      return corsResponse(
        { success: false, error: 'المستخدم غير موجود' },
        404
      );
    }

    // جلب نقاط الولاء
    const loyaltyPoints = await prisma.loyalty_points.findMany({
      where: { user_id: user.id },
      select: {
        points: true
      }
    });

    // حساب مجموع نقاط الولاء
    const totalLoyaltyPoints = loyaltyPoints.reduce((total: number, lp: { points: number }) => total + lp.points, 0);

    // جلب تفضيلات المستخدم
    const preferences = await prisma.user_preferences.findMany({
      where: {
        user_id: user.id,
        key: { startsWith: 'category_' }
      },
      select: {
        id: true,
        key: true,
        value: true
      }
    });

    // استخراج اهتمامات المستخدم
    const interests = {
      categories: preferences
        .filter((pref: { key: string; }) => pref.key.startsWith('category_'))
        .map((pref: { value: any; }) => {
          const value = pref.value as any;
          return value?.name || '';
        })
        .filter(Boolean),
      keywords: [] // لا توجد جدول keywords في المستخدمين
    };

    // إضافة معلومات إضافية
    const responseUser = {
      ...user,
      is_admin: user.is_admin || user.role === 'admin' || user.role === 'super_admin',
      loyaltyPoints: totalLoyaltyPoints,
      status: 'active', // قيمة افتراضية
      role: user.role || 'user',
      isVerified: user.is_verified || false,
      interests: interests.categories
    };

    return corsResponse({
      success: true,
      user: responseUser
    });

  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدم:', error);
    return corsResponse(
      { 
        success: false, 
        error: 'حدث خطأ في جلب بيانات المستخدم'
      },
      500
    );
  }
} 