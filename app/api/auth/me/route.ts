import { corsResponseFromRequest, handleOptionsForRequest } from "@/lib/cors";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return handleOptionsForRequest();
}

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 بدء التحقق من هوية المستخدم...");

    // محاولة الحصول على التوكن من الكوكيز أو من Authorization header
    let token =
      request.cookies.get("sabq_at")?.value ||
      request.cookies.get("auth-token")?.value ||
      request.cookies.get("access_token")?.value ||
      request.cookies.get("token")?.value ||
      request.cookies.get("jwt")?.value;

    // إذا لم يوجد في الكوكيز، جرب من Authorization header
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      // سماح بالرد الفارغ بدلاً من خطأ إذا كان المصدر غير مصرّح أو CORS منع الوصول
      return corsResponseFromRequest(
        request,
        { success: false, error: "Unauthorized" },
        401
      );
    }

    // التحقق من صحة التوكن (جرب عدة مفاتيح)
    let decoded: any;
    const keys = [
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_SECRET,
      JWT_SECRET,
    ].filter(Boolean) as string[];
    for (const key of keys) {
      try {
        decoded = jwt.verify(token, key);
        break;
      } catch {}
    }
    if (!decoded) {
      return corsResponseFromRequest(request, { success: false, error: "جلسة غير صالحة" }, 401);
    }

    // استخراج معرف المستخدم من payload (يدعم sub أو id)
    const userId = decoded?.sub || decoded?.id || decoded?.userId || decoded?.user_id;
    if (!userId || typeof userId !== "string") {
      return corsResponseFromRequest(request, { success: false, error: "جلسة غير صالحة" }, 401);
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
      return corsResponseFromRequest(request, { success: false, error: "المستخدم غير موجود" }, 404);
    }

    const isAdmin =
      user.is_admin === true ||
      user.role === "admin" ||
      user.role === "super_admin" ||
      user.role === "system_admin";

    // إرجاع استجابة متوافقة مع النظام
    return corsResponseFromRequest(request, {
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
    return corsResponseFromRequest(
      request,
      {
        success: false,
        error: "حدث خطأ في جلب بيانات المستخدم",
      },
      500
    );
  }
}
