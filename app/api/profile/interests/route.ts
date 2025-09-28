import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/app/lib/auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// Schema للتحقق من البيانات
const UpdateInterestsSchema = z.object({
  categoryIds: z.array(z.string()).max(100),
});

/**
 * GET /api/profile/interests
 * جلب اهتمامات المستخدم الحالي مع منع الكاش
 */
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await requireAuth();
    
    // Headers لمنع الكاش على جميع المستويات
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store",
    };

    // جلب الاهتمامات النشطة من قاعدة البيانات
    const userInterests = await prisma.user_interests.findMany({
      where: {
        user_id: user.id,
        is_active: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            name_ar: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // تنسيق البيانات للإرجاع
    const formattedInterests = userInterests.map((interest) => ({
      categoryId: interest.category_id,
      category: {
        id: interest.category.id,
        name: interest.category.name_ar || interest.category.name,
        slug: interest.category.slug,
        icon: interest.category.icon || "📌",
        color: interest.category.color || "#6B7280",
      },
      isActive: interest.is_active,
      createdAt: interest.created_at,
    }));

    // إرجاع البيانات مع معلومات إضافية
    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        interests: formattedInterests,
        categoryIds: userInterests.map((i) => i.category_id),
        count: userInterests.length,
        timestamp: new Date().toISOString(),
      },
      { headers }
    );
  } catch (error: any) {
    console.error("❌ Error in GET /api/profile/interests:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "غير مصرح بالوصول" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "فشل في جلب الاهتمامات" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/interests
 * تحديث اهتمامات المستخدم بالكامل (استبدال)
 */
export async function PUT(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await requireAuth();
    
    // قراءة وتحقق البيانات
    const body = await request.json();
    const { categoryIds } = UpdateInterestsSchema.parse(body);
    
    console.log(`📝 Updating interests for user ${user.id}:`, categoryIds);

    // التحقق من وجود التصنيفات
    const validCategories = await prisma.categories.findMany({
      where: {
        id: { in: categoryIds },
        is_active: true,
      },
      select: { id: true },
    });

    const validCategoryIds = validCategories.map((c) => c.id);
    
    if (validCategoryIds.length !== categoryIds.length) {
      console.warn("⚠️ بعض التصنيفات غير صحيحة:", {
        requested: categoryIds,
        valid: validCategoryIds,
      });
    }

    // تنفيذ التحديث في transaction واحدة
    const result = await prisma.$transaction(async (tx) => {
      // 1. حذف جميع الاهتمامات القديمة
      await tx.user_interests.deleteMany({
        where: { user_id: user.id },
      });

      // 2. إضافة الاهتمامات الجديدة
      if (validCategoryIds.length > 0) {
        await tx.user_interests.createMany({
          data: validCategoryIds.map((categoryId) => ({
            user_id: user.id,
            category_id: categoryId,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          })),
          skipDuplicates: true,
        });
      }

      // 3. تحديث timestamp المستخدم
      await tx.users.update({
        where: { id: user.id },
        data: { 
          updated_at: new Date(),
          // حفظ الاهتمامات في حقل interests أيضاً للتوافقية
          interests: validCategoryIds,
        },
      });

      return { count: validCategoryIds.length };
    });

    console.log(`✅ Successfully updated ${result.count} interests for user ${user.id}`);

    // تنظيف الكاش - إذا كان Redis متاحاً
    try {
      // إذا كان لديك Redis client
      // await redis.del(`interests:${user.id}`);
      // await redis.del(`profile:${user.id}`);
      // await redis.del(`user:${user.id}:*`);
    } catch (cacheError) {
      console.warn("⚠️ Could not clear cache:", cacheError);
    }

    // إعادة التحقق من الصفحات المرتبطة
    revalidateTag(`profile:${user.id}`);
    revalidateTag(`interests:${user.id}`);
    revalidateTag("interests");

    // Headers لمنع الكاش
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    };

    return NextResponse.json(
      {
        success: true,
        message: "تم تحديث الاهتمامات بنجاح",
        userId: user.id,
        categoryIds: validCategoryIds,
        count: result.count,
        timestamp: new Date().toISOString(),
      },
      { headers }
    );
  } catch (error: any) {
    console.error("❌ Error in PUT /api/profile/interests:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "غير مصرح بالوصول" },
        { status: 401 }
      );
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "بيانات غير صحيحة", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "فشل في حفظ الاهتمامات" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/interests
 * إضافة/إزالة اهتمام واحد (للتوافقية)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { categoryId, action = "toggle" } = body;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "معرف التصنيف مطلوب" },
        { status: 400 }
      );
    }

    // التحقق من وجود التصنيف
    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "التصنيف غير موجود" },
        { status: 404 }
      );
    }

    // البحث عن الاهتمام الحالي
    const existing = await prisma.user_interests.findUnique({
      where: {
        user_id_category_id: {
          user_id: user.id,
          category_id: categoryId,
        },
      },
    });

    let result;
    if (action === "add" || (action === "toggle" && !existing)) {
      // إضافة أو تفعيل
      result = await prisma.user_interests.upsert({
        where: {
          user_id_category_id: {
            user_id: user.id,
            category_id: categoryId,
          },
        },
        update: {
          is_active: true,
          updated_at: new Date(),
        },
        create: {
          user_id: user.id,
          category_id: categoryId,
          is_active: true,
        },
      });
    } else {
      // إزالة أو تعطيل
      if (existing) {
        result = await prisma.user_interests.update({
          where: { id: existing.id },
          data: {
            is_active: false,
            updated_at: new Date(),
          },
        });
      }
    }

    // تنظيف الكاش
    revalidateTag(`profile:${user.id}`);
    revalidateTag(`interests:${user.id}`);

    return NextResponse.json(
      {
        success: true,
        action: result?.is_active ? "added" : "removed",
        categoryId,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in POST /api/profile/interests:", error);
    return NextResponse.json(
      { success: false, error: "فشل في تحديث الاهتمام" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/interests
 * حذف جميع الاهتمامات
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    await prisma.user_interests.deleteMany({
      where: { user_id: user.id },
    });

    // تنظيف الكاش
    revalidateTag(`profile:${user.id}`);
    revalidateTag(`interests:${user.id}`);

    return NextResponse.json(
      {
        success: true,
        message: "تم حذف جميع الاهتمامات",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in DELETE /api/profile/interests:", error);
    return NextResponse.json(
      { success: false, error: "فشل في حذف الاهتمامات" },
      { status: 500 }
    );
  }
}
