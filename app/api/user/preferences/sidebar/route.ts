import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("✅ GET sidebar preferences called");

    // جلب التفضيلات من قاعدة البيانات
    const preferences = await prisma.user_preferences.findFirst({
      where: {
        key: 'sidebar_settings'
      }
    });

    if (preferences) {
      const settingsData = JSON.parse(preferences.value);
      console.log("📦 Retrieved from database:", settingsData);
      
      return NextResponse.json({
        sidebar_order: settingsData.sidebar_order || null,
        sidebar_hidden: settingsData.sidebar_hidden || [],
      });
    } else {
      console.log("📋 No preferences found, returning defaults");
      return NextResponse.json({
        sidebar_order: null,
        sidebar_hidden: [],
      });
    }
  } catch (error) {
    console.error("❌ Error in GET /api/user/preferences/sidebar:", error);
    return NextResponse.json({
      sidebar_order: null,
      sidebar_hidden: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("✅ POST sidebar preferences called");

    const body = await request.json();
    const { sidebar_order, sidebar_hidden } = body;

    console.log("📦 Received data:", { sidebar_order, sidebar_hidden });

    // التحقق من صحة البيانات
    if (!Array.isArray(sidebar_order)) {
      console.log("❌ Invalid sidebar_order");
      return NextResponse.json(
        { error: "ترتيب الشريط الجانبي يجب أن يكون مصفوفة" },
        { status: 400 }
      );
    }

    if (!Array.isArray(sidebar_hidden)) {
      console.log("❌ Invalid sidebar_hidden");
      return NextResponse.json(
        { error: "العناصر المخفية يجب أن تكون مصفوفة" },
        { status: 400 }
      );
    }

    // إعداد البيانات للحفظ
    const settingsData = {
      sidebar_order,
      sidebar_hidden
    };

    // حفظ التفضيلات في قاعدة البيانات
    await prisma.user_preferences.upsert({
      where: {
        key: 'sidebar_settings'
      },
      update: {
        value: JSON.stringify(settingsData),
        updated_at: new Date()
      },
      create: {
        id: `sidebar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        key: 'sidebar_settings',
        value: JSON.stringify(settingsData),
        user_id: 'admin', // يمكن تحديث هذا ليكون ID المستخدم الحقيقي
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log("✅ Preferences saved successfully to database:", settingsData);

    return NextResponse.json({
      message: "تم حفظ التفضيلات بنجاح",
      sidebar_order,
      sidebar_hidden,
    });
  } catch (error) {
    console.error("❌ Error in POST /api/user/preferences/sidebar:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log("✅ DELETE sidebar preferences called");

    // حذف التفضيلات من قاعدة البيانات
    await prisma.user_preferences.deleteMany({
      where: {
        key: 'sidebar_settings'
      }
    });

    console.log("✅ Preferences deleted successfully from database");

    return NextResponse.json({
      message: "تم حذف التفضيلات بنجاح",
      sidebar_order: null,
      sidebar_hidden: [],
    });
  } catch (error) {
    console.error("❌ Error in DELETE /api/user/preferences/sidebar:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
