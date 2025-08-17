import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

// دالة مساعدة لإضافة CORS headers
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// دالة لإنشاء response مع CORS headers
function corsResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// دالة للحصول على المستخدم من التوكن
async function getUserFromToken(request: NextRequest) {
  try {
    // محاولة الحصول على التوكن من الكوكيز أو من Authorization header
    let token = request.cookies.get('auth-token')?.value;
    
    // إذا لم يوجد في الكوكيز، جرب cookie بإسم 'user'
    if (!token) {
      const userCookie = request.cookies.get('user')?.value;
      if (userCookie) {
        try {
          const decodedCookie = decodeURIComponent(userCookie);
          const userObject = JSON.parse(decodedCookie);
          if (userObject.id) {
            token = userCookie;
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
      return null;
    }

    // التحقق من صحة التوكن
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      try {
        const decodedCookie = decodeURIComponent(token);
        const userObject = JSON.parse(decodedCookie);
        if (userObject.id) {
          decoded = userObject;
        } else {
          throw new Error('لا يحتوي على معرف مستخدم');
        }
      } catch (jsonError) {
        return null;
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
        is_verified: true
      }
    });

    return user;
  } catch (error) {
    console.error('خطأ في استخراج المستخدم:', error);
    return null;
  }
}

// GET: جلب تفضيلات المستخدم
export async function GET(request: NextRequest) {
  try {
    // التأكد من الاتصال بقاعدة البيانات
    // سيتم التحقق من الاتصال تلقائياً عند استخدام Prisma

    // الحصول على المستخدم
    const user = await getUserFromToken(request);
    if (!user) {
      return corsResponse({
        success: false,
        error: 'غير مصرح بالوصول'
      }, 401);
    }

    // جلب تفضيلات المستخدم
    const preferences = await prisma.user_preferences.findMany({
      where: {
        user_id: user.id
      },
      select: {
        id: true,
        key: true,
        value: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        key: 'asc'
      }
    });

    return corsResponse({
      success: true,
      data: preferences,
      total: preferences.length
    });

  } catch (error) {
    console.error('خطأ في جلب تفضيلات المستخدم:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب التفضيلات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// POST: إنشاء أو تحديث تفضيل
export async function POST(request: NextRequest) {
  try {
    // التأكد من الاتصال بقاعدة البيانات
    // سيتم التحقق من الاتصال تلقائياً عند استخدام Prisma

    // الحصول على المستخدم
    const user = await getUserFromToken(request);
    if (!user) {
      return corsResponse({
        success: false,
        error: 'غير مصرح بالوصول'
      }, 401);
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return corsResponse({
        success: false,
        error: 'مفتاح التفضيل مطلوب'
      }, 400);
    }

    // إنشاء أو تحديث التفضيل
    const preference = await prisma.user_preferences.upsert({
      where: {
        user_id_key: {
          user_id: user.id,
          key: key
        }
      },
      update: {
        value: value,
        updated_at: new Date()
      },
      create: {
        id: crypto.randomUUID(),
        user_id: user.id,
        key: key,
        value: value,
        updated_at: new Date()
      }
    });

    return corsResponse({
      success: true,
      data: preference,
      message: 'تم حفظ التفضيل بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حفظ التفضيل:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في حفظ التفضيل',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// DELETE: حذف تفضيل
export async function DELETE(request: NextRequest) {
  try {
    // التأكد من الاتصال بقاعدة البيانات
    // سيتم التحقق من الاتصال تلقائياً عند استخدام Prisma

    // الحصول على المستخدم
    const user = await getUserFromToken(request);
    if (!user) {
      return corsResponse({
        success: false,
        error: 'غير مصرح بالوصول'
      }, 401);
    }

    const { searchParams } = new URL(request.url!);
    const key = searchParams.get('key');

    if (!key) {
      return corsResponse({
        success: false,
        error: 'مفتاح التفضيل مطلوب'
      }, 400);
    }

    // حذف التفضيل
    await prisma.user_preferences.deleteMany({
      where: {
        user_id: user.id,
        key: key
      }
    });

    return corsResponse({
      success: true,
      message: 'تم حذف التفضيل بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف التفضيل:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في حذف التفضيل',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}
