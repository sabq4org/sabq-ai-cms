import { corsResponse, handleOptions } from "@/lib/cors";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return handleOptions();
}

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 بدء التحقق من هوية المستخدم...");

    // محاولة الحصول على التوكن من الكوكيز أو من Authorization header
    let token =
      request.cookies.get("sabq_at")?.value ||
      request.cookies.get("auth-token")?.value;

    // إذا لم يوجد في الكوكيز، جرب من Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return corsResponse(
        { success: false, error: "لم يتم العثور على معلومات المصادقة" },
        401
      );
    }

    // التحقق من صحة التوكن
    let decoded: any;
    try {
      const verifySecret =
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || JWT_SECRET;
      decoded = jwt.verify(token, verifySecret);
    } catch (error) {
      return corsResponse({ success: false, error: "جلسة غير صالحة" }, 401);
    }

    // استخراج معرف المستخدم من payload (يدعم sub أو id)
    const userId = decoded?.sub || decoded?.id;
    if (!userId || typeof userId !== "string") {
      return corsResponse({ success: false, error: "جلسة غير صالحة" }, 401);
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
        avatar: true,
        is_admin: true,
      },
    });

    if (!user) {
      return corsResponse({ success: false, error: "المستخدم غير موجود" }, 404);
    }

    const isAdmin =
      user.is_admin === true ||
      user.role === "admin" ||
      user.role === "super_admin" ||
      user.role === "system_admin";

    // إرجاع استجابة متوافقة مع النظام
    return corsResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
        is_admin: isAdmin,
        isAdmin: isAdmin,
        is_verified: user.is_verified || false,
        isVerified: user.is_verified || false,
        avatar: user.avatar,
        created_at: user.created_at,
        updated_at: user.updated_at,
        status: "active",
        loyaltyPoints: 0,
        interests: [],
      },
    });
  } catch (error: any) {
    console.error("خطأ في جلب بيانات المستخدم:", error);
    return corsResponse(
      {
        success: false,
        error: "حدث خطأ في جلب بيانات المستخدم",
      },
      500
    );
  }
}
