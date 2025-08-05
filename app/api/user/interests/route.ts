import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

/**
 * API لإدارة اهتمامات المستخدمين
 * يدعم إضافة وإزالة اهتمامات المستخدمين
 */

// GET - جلب اهتمامات المستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    let userId: string;

    if (userIdParam) {
      // إذا تم تمرير userId في URL، استخدمه مباشرة
      console.log("🔍 البحث عن اهتمامات للمستخدم:", userIdParam);
      userId = userIdParam;
    } else {
      // التحقق من التوكن
      const token = request.cookies.get("auth-token")?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: "غير مصرح - يرجى تسجيل الدخول" },
          { status: 401 }
        );
      }

      const JWT_SECRET =
        process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    }

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
            icon: true,
          },
        },
      },
    });

    const interests = userInterests.map((ui) => ({
      interestId: ui.category_id,
      categoryName: ui.category?.name,
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

// POST - إضافة أو إزالة اهتمام أو حفظ قائمة اهتمامات
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    console.log("🔍 Raw Body المُستلم:", rawBody);

    const body = JSON.parse(rawBody);

    console.log("📋 تفاصيل الطلب المُستلم:", JSON.stringify(body, null, 2));
    console.log(
      "📋 نوع categoryIds في البيانات المحللة:",
      typeof body.categoryIds
    );
    console.log("📋 قيمة categoryIds في البيانات المحللة:", body.categoryIds);
    console.log("📋 هل categoryIds مصفوفة؟", Array.isArray(body.categoryIds));

    // إذا كان الطلب من صفحة التفضيلات (يحتوي على userId و categoryIds)
    if (body.userId && body.categoryIds) {
      const { userId, categoryIds, source } = body;

      console.log("🔄 حفظ اهتمامات من صفحة التفضيلات:", {
        userId,
        categoryIds,
        categoryIdsType: typeof categoryIds,
        categoryIdsLength: Array.isArray(categoryIds)
          ? categoryIds.length
          : "not array",
        source,
      });

      console.log("🚀 بدء عملية التحقق من التصنيفات...");

      // التحقق من صحة معرفات التصنيفات أولاً
      console.log("🔄 بدء التحقق من صحة معرفات التصنيفات...");
      const validCategories = await prisma.categories.findMany({
        where: { is_active: true },
        select: { id: true },
      });
      console.log("✅ تم جلب التصنيفات الصحيحة من قاعدة البيانات");

      const validCategoryIds = validCategories.map((cat) => cat.id);
      console.log("🔍 معرفات التصنيفات الصحيحة:", validCategoryIds);

      // فلترة المعرفات الصحيحة فقط
      const filteredCategoryIds = Array.isArray(categoryIds)
        ? categoryIds.filter((id) => validCategoryIds.includes(id))
        : validCategoryIds.includes(categoryIds)
        ? [categoryIds]
        : [];

      console.log("✅ معرفات التصنيفات بعد الفلترة:", filteredCategoryIds);

      if (filteredCategoryIds.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "لا توجد معرفات تصنيفات صحيحة",
            details: `المعرفات المُرسلة: ${JSON.stringify(
              categoryIds
            )}, المعرفات الصحيحة: ${JSON.stringify(validCategoryIds)}`,
          },
          { status: 400 }
        );
      }

      // حذف الاهتمامات السابقة للمستخدم أولاً
      await prisma.user_interests.deleteMany({
        where: {
          user_id: userId,
        },
      });

      // إضافة الاهتمامات الجديدة
      for (const categoryId of filteredCategoryIds) {
        const existingInterest = await prisma.user_interests.findFirst({
          where: { user_id: userId, category_id: categoryId.toString() },
        });

        if (existingInterest) {
          await prisma.user_interests.update({
            where: { id: existingInterest.id },
            data: { is_active: true, updated_at: new Date() },
          });
        } else {
          await prisma.user_interests.create({
            data: {
              user_id: userId,
              category_id: categoryId.toString(),
              is_active: true,
            },
          });
        }
      }

      // 🆕 تحديث user_preferences أيضاً لضمان التزامن
      console.log("🔄 تحديث user_preferences مع التصنيفات المُنظفة...");
      const preferenceData = {
        interests: filteredCategoryIds,
        interests_updated_at: new Date().toISOString(),
        interests_source: source || "user_interests_api",
      };

      await prisma.user_preferences.upsert({
        where: {
          user_id_key: {
            user_id: userId,
            key: "interests",
          },
        },
        update: {
          value: preferenceData,
          updated_at: new Date(),
        },
        create: {
          id: `pref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          key: "interests",
          value: preferenceData,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      console.log("✅ تم تحديث user_preferences بنجاح مع التصنيفات المُنظفة");

      return NextResponse.json({
        success: true,
        message: "تم حفظ الاهتمامات بنجاح",
        count: filteredCategoryIds.length,
        filteredCategories: filteredCategoryIds,
      });
    }

    // الطريقة القديمة للـ token authentication
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح - يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    const JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const { interestId, action } = body;

    if (!interestId || !action) {
      return NextResponse.json(
        { success: false, error: "معرف الاهتمام والإجراء مطلوبان" },
        { status: 400 }
      );
    }

    const userId = decoded.id;
    const categoryId = interestId.toString();

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
      { success: false, error: "خطأ في الخادم", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - تحديث جميع اهتمامات المستخدم دفعة واحدة
export async function PUT(request: NextRequest) {
  try {
    // التحقق من التوكن
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح - يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    const JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const body = await request.json();
    const { interests } = body;

    if (!Array.isArray(interests)) {
      return NextResponse.json(
        { success: false, error: "قائمة الاهتمامات يجب أن تكون مصفوفة" },
        { status: 400 }
      );
    }

    const userId = decoded.id;

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
      const categoryId = interestId.toString();

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
