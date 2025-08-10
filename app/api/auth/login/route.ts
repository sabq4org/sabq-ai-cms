import { setAuthCookies } from "@/lib/auth-cookies";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export async function POST(request: NextRequest) {
  try {
    // التحقق من content-type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("خطأ في parsing JSON:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    console.log("محاولة تسجيل دخول:", { email });
    console.log("BODY:", body);

    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    try {
      await rateLimit(`login:${email}`, 5, 60);
    } catch (e: any) {
      return NextResponse.json(
        {
          success: false,
          error: "تم تجاوز عدد محاولات الدخول، يرجى المحاولة بعد دقيقة.",
        },
        { status: e.status || 429 }
      );
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.users.findFirst({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password_hash: true,
        role: true,
        is_verified: true,
        is_admin: true,
        created_at: true,
        updated_at: true,
      },
    });

    console.log("USER:", user);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash || ""
    );

    console.log("Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // التحقق من حالة الحساب
    if (!user.is_verified) {
      return NextResponse.json(
        { success: false, error: "يرجى تأكيد بريدك الإلكتروني أولاً" },
        { status: 403 }
      );
    }

    console.log("تسجيل دخول ناجح للمستخدم:", user.email);

    // إضافة معلومات إضافية للمستخدم
    const responseUser = {
      ...user,
      // التأكد من وجود جميع الحقول المطلوبة
      loyaltyPoints: 0, // قيمة افتراضية
      status: "active", // قيمة افتراضية
      role: user.role || "مستخدم",
      roleId: user.role,
      isVerified: user.is_verified || false,
      isAdmin: user.is_admin || false,
    };

    // إنشاء JWTs: access + refresh
    const access = jwt.sign(
      {
        sub: user.id,
        role: user.role || "user",
      },
      process.env.JWT_ACCESS_SECRET || JWT_SECRET,
      {
        expiresIn: `${process.env.JWT_ACCESS_TTL_MIN || 15}m`,
        issuer: "sabq-ai-cms",
      }
    );
    const refresh = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET || JWT_SECRET,
      {
        expiresIn: `${process.env.JWT_REFRESH_TTL_DAYS || 7}d`,
        issuer: "sabq-ai-cms",
      }
    );

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refresh, 12),
        userAgent: request.headers.get("user-agent") ?? undefined,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
        expiresAt: new Date(
          Date.now() +
            1000 * 60 * 60 * 24 * Number(process.env.JWT_REFRESH_TTL_DAYS || 7)
        ),
      },
    });

    // إنشاء response مع الكوكيز
    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: responseUser,
      token: access,
    });

    // تعيين كوكيز sabq_at & sabq_rt
    setAuthCookies(response, access, refresh);

    return response;
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في عملية تسجيل الدخول",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
