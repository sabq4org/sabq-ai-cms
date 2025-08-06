import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// وظيفة للتحقق من اتصال قاعدة البيانات
export async function GET(request: NextRequest) {
  try {
    // محاولة استعلام بسيط للتحقق من الاتصال
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      status: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ فشل التحقق من اتصال قاعدة البيانات:", error);

    return NextResponse.json(
      {
        success: false,
        status: "disconnected",
        error: error.message || "حدث خطأ أثناء الاتصال بقاعدة البيانات",
        code: "DB_CONNECTION_ERROR",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

// وظيفة لإعادة تهيئة اتصال قاعدة البيانات
export async function POST(request: NextRequest) {
  try {
    // إغلاق الاتصال الحالي إذا كان موجودًا
    await prisma.$disconnect();

    // إعادة توصيل قاعدة البيانات
    await prisma.$connect();

    // التحقق من نجاح الاتصال
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      status: "reconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ فشل إعادة الاتصال بقاعدة البيانات:", error);

    return NextResponse.json(
      {
        success: false,
        status: "reconnection_failed",
        error: error.message || "فشل إعادة الاتصال بقاعدة البيانات",
        code: "DB_RECONNECTION_ERROR",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
