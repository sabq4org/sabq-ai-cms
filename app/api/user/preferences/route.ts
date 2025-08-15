import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const interests = await prisma.user_interests.findMany({
      where: { user_id: user.id },
      select: { id: true, category_id: true, is_active: true, created_at: true },
      orderBy: { created_at: "desc" }
    });
    await prisma.$disconnect();
    return NextResponse.json({ interests, updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const categoryIds: string[] = body?.interests?.categoryIds || [];
    const terms: string[] = body?.interests?.terms || [];

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$transaction(async (tx) => {
      await tx.user_interests.deleteMany({ where: { user_id: user.id } });
      const data: any[] = [];
      for (const cid of categoryIds) {
        data.push({ user_id: user.id, category_id: cid });
      }
      for (const term of terms) {
        if (term && term.trim()) data.push({ user_id: user.id, category_id: undefined });
      }
      if (data.length) {
        await tx.user_interests.createMany({ data, skipDuplicates: true });
      }
    });
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// تم حذف جميع imports من interests-mapping لأنها مدمرة
// import { normalizeUserInterests, mapInterestsToCategories, categorySlugToId } from '@/lib/interests-mapping';

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

// POST: حفظ تفضيلات المستخدم
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, categoryIds, source = 'manual' } = body;

    if (!userId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, 400);
    }

    if (!categoryIds || !Array.isArray(categoryIds)) {
      return corsResponse({
        success: false,
        error: 'قائمة التصنيفات مطلوبة'
      }, 400);
    }

    // استخدام الاهتمامات المحفوظة مباشرة بدون تحويل مدمر
    const validCategoryIds = categoryIds.map((id: any) => String(id).trim()).filter((id: string) => id && id.length > 0);
    
    console.log('✅ حفظ الاهتمامات مباشرة:', {
      categoryIds: validCategoryIds
    });

    // التحقق من عدد التصنيفات
    if (validCategoryIds.length === 0) {
      return corsResponse({
        success: false,
        error: 'يجب اختيار تصنيف واحد على الأقل'
      }, 400);
    }

    if (validCategoryIds.length > 10) {
      return corsResponse({
        success: false,
        error: 'لا يمكن اختيار أكثر من 10 تصنيفات'
      }, 400);
    }

    // للمستخدمين الضيوف، نحفظ في localStorage فقط
    if (userId.startsWith('guest-')) {
      console.log('💾 حفظ تفضيلات الضيف:', { userId, categoryIds });
      return corsResponse({
        success: true,
        message: 'تم حفظ التفضيلات للمستخدم الضيف',
        data: {
          userId,
          categoryIds,
          source
        }
      });
    }

    // للمستخدمين المسجلين، نحفظ في قاعدة البيانات
    try {
      // التحقق من وجود المستخدم
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return corsResponse({
          success: false,
          error: 'المستخدم غير موجود'
        }, 404);
      }

      // حفظ أو تحديث التفضيلات في جدول user_preferences
      const preferenceData = {
        interests: validCategoryIds,
        interests_updated_at: new Date().toISOString(),
        interests_source: source
      };

      await prisma.user_preferences.upsert({
        where: {
          user_id_key: {
            user_id: userId,
            key: 'interests'
          }
        },
        update: {
          value: preferenceData,
          updated_at: new Date()
        },
        create: {
          id: `pref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          key: 'interests',
          value: preferenceData,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log('✅ تم حفظ تفضيلات المستخدم:', { userId, validCategoryIds });

      // حفظ نشاط في سجل النشاطات
      try {
        await prisma.activity_logs.create({
          data: {
            id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            action: 'update_preferences',
            metadata: {
              originalCategories: categoryIds,
              finalCategories: validCategoryIds,
              // normalizedInterests removed
              count: validCategoryIds.length,
              source
            },
            created_at: new Date()
          }
        });
      } catch (logError) {
        console.error('خطأ في حفظ سجل النشاط:', logError);
        // نتجاهل خطأ السجل ونستمر
      }

      return corsResponse({
        success: true,
        message: 'تم حفظ التفضيلات بنجاح',
        data: {
          userId,
          categoryIds,
          source
        }
      });

    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError);
      return corsResponse({
        success: false,
        error: 'حدث خطأ في حفظ التفضيلات في قاعدة البيانات'
      }, 500);
    }

  } catch (error) {
    console.error('خطأ في حفظ التفضيلات:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في معالجة الطلب'
    }, 500);
  }
}

// GET: جلب تفضيلات المستخدم
export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, 400);
    }

    // للمستخدمين الضيوف
    if (userId.startsWith('guest-')) {
      return corsResponse({
        success: true,
        categoryIds: [],
        source: 'guest'
      });
    }

    // جلب بيانات المستخدم
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return corsResponse({
        success: false,
        error: 'المستخدم غير موجود'
      }, 404);
    }

    // جلب التفضيلات من جدول user_preferences
    const preference = await prisma.user_preferences.findUnique({
      where: {
        user_id_key: {
          user_id: userId,
          key: 'interests'
        }
      }
    });

    if (!preference) {
      return corsResponse({
        success: true,
        categoryIds: [],
        source: 'none'
      });
    }

    // استخراج الاهتمامات من التفضيلات
    const preferenceData = preference.value as any || {};
    const categoryIds = preferenceData.interests || [];

    return corsResponse({
      success: true,
      categoryIds,
      source: preferenceData.interests_source || 'unknown'
    });

  } catch (error) {
    console.error('خطأ في جلب التفضيلات:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب التفضيلات'
    }, 500);
  }
} 