import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// دالة CORS بسيطة
function createCorsResponse(data: any, status: number = 200) {
  const response = NextResponse.json(data, { status });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return createCorsResponse({ message: 'OK' });
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

    console.log('🔑 التوكن المستخرج:', token ? `...${token.slice(-4)}` : 'غير موجود');

    if (!token) {
      // محاولة من Authorization header
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log('🔑 تم العثور على التوكن في Header');
      }
    }

    if (!token) {
      console.log('❌ لا يوجد توكن - إرجاع 401');
      return createCorsResponse({
        success: false,
        error: "No authentication token found",
        debug: {
          cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value, httpOnly: c.httpOnly, secure: c.secure, sameSite: c.sameSite })),
          headers: {
            authorization: !!request.headers.get("authorization"),
            cookieHeader: !!request.headers.get("cookie"),
            host: request.headers.get("host"),
            referer: request.headers.get("referer"),
          }
        }
      }, { status: 401 });
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
      return createCorsResponse({ success: false, error: "جلسة غير صالحة" }, 401);
    }

    // استخراج معرف المستخدم من payload (يدعم sub أو id)
    const userId = decoded?.sub || decoded?.id || decoded?.userId || decoded?.user_id;
    if (!userId || typeof userId !== "string") {
      return createCorsResponse({ success: false, error: "جلسة غير صالحة" }, 401);
    }

    // البحث عن المستخدم في قاعدة البيانات
    let user: any = null;
    try {
      user = await prisma.users.findUnique({
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
    } catch (dbErr) {
      // في حال فشل قاعدة البيانات، استخدم fallback من Cookie
      const userCookie = request.cookies.get('user')?.value;
      if (userCookie) {
        try {
          const decoded = JSON.parse(decodeURIComponent(userCookie));
          if (decoded && decoded.id) {
            user = {
              id: decoded.id,
              email: decoded.email || '',
              name: decoded.name || 'مستخدم',
              role: decoded.role || 'user',
              is_verified: !!decoded.is_verified,
              created_at: decoded.created_at || null,
              updated_at: decoded.updated_at || null,
              avatar: decoded.avatar || null,
              is_admin: !!decoded.is_admin,
            };
          }
        } catch {}
      }
    }

    if (!user) {
      return createCorsResponse({ success: false, error: "المستخدم غير موجود" }, 404);
    }

    const isAdmin =
      user.is_admin === true ||
      user.role === "admin" ||
      user.role === "super_admin" ||
      user.role === "system_admin";

    // إرجاع استجابة متوافقة مع النظام
    return createCorsResponse({
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
    return createCorsResponse(
      {
        success: false,
        error: "حدث خطأ في جلب بيانات المستخدم",
      },
      500
    );
  }
}
