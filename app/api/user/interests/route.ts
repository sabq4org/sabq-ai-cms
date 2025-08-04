import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * API لإدارة اهتمامات المستخدمين
 * يدعم إضافة وإزالة اهتمامات المستخدمين
 */

// GET - جلب اهتمامات المستخدم
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح - يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // جلب اهتمامات المستخدم من قاعدة البيانات
    const userInterests = await prisma.user_interests.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            name_ar: true,
            icon: true,
          },
        },
      },
    });

    const interests = userInterests.map((ui) => ({
      interestId: ui.category_id,
      categoryName: ui.category?.name,
      categoryNameAr: ui.category?.name_ar,
      icon: ui.category?.icon,
      addedAt: ui.created_at,
    }));

    return NextResponse.json({
      success: true,
      interests: interests,
      count: interests.length,
    });
  } catch (error) {
    console.error("خطأ في جلب اهتمامات المستخدم:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// POST - إضافة أو إزالة اهتمام
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح - يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { interestId, action } = body;

    if (!interestId || !action) {
      return NextResponse.json(
        { success: false, error: "معرف الاهتمام والإجراء مطلوبان" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const categoryId = parseInt(interestId);

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

    if (action === "add") {
      // إضافة اهتمام جديد
      const existingInterest = await prisma.user_interests.findFirst({
        where: {
          user_id: userId,
          category_id: categoryId,
        },
      });

      if (existingInterest) {
        // إذا كان موجوداً، فعّله
        await prisma.user_interests.update({
          where: { id: existingInterest.id },
          data: {
            is_active: true,
            updated_at: new Date(),
          },
        });
      } else {
        // إنشاء اهتمام جديد
        await prisma.user_interests.create({
          data: {
            user_id: userId,
            category_id: categoryId,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "تم إضافة الاهتمام بنجاح",
        action: "added",
      });
    } else if (action === "remove") {
      // إزالة اهتمام (تعطيله)
      await prisma.user_interests.updateMany({
        where: {
          user_id: userId,
          category_id: categoryId,
        },
        data: {
          is_active: false,
          updated_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "تم إزالة الاهتمام بنجاح",
        action: "removed",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "إجراء غير صحيح. يجب أن يكون add أو remove" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("خطأ في تحديث اهتمامات المستخدم:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// PUT - تحديث جميع اهتمامات المستخدم دفعة واحدة
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح - يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { interests } = body;

    if (!Array.isArray(interests)) {
      return NextResponse.json(
        { success: false, error: "قائمة الاهتمامات يجب أن تكون مصفوفة" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);

    // إزالة جميع الاهتمامات الحالية
    await prisma.user_interests.updateMany({
      where: { user_id: userId },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    // إضافة الاهتمامات الجديدة
    for (const interestId of interests) {
      const categoryId = parseInt(interestId);

      // التحقق من وجود التصنيف
      const category = await prisma.categories.findUnique({
        where: { id: categoryId },
      });

      if (category) {
        const existingInterest = await prisma.user_interests.findFirst({
          where: {
            user_id: userId,
            category_id: categoryId,
          },
        });

        if (existingInterest) {
          // تفعيل الاهتمام الموجود
          await prisma.user_interests.update({
            where: { id: existingInterest.id },
            data: {
              is_active: true,
              updated_at: new Date(),
            },
          });
        } else {
          // إنشاء اهتمام جديد
          await prisma.user_interests.create({
            data: {
              user_id: userId,
              category_id: categoryId,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث الاهتمامات بنجاح",
      updatedCount: interests.length,
    });
  } catch (error) {
    console.error("خطأ في تحديث جميع اهتمامات المستخدم:", error);
    return NextResponse.json(
      { success: false, error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
