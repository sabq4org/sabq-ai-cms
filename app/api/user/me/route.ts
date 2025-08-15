import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const JWT_FALLBACK = "your-secret-key-change-this-in-production";

export async function GET(request: NextRequest) {
  try {
    // احصل على التوكن من الكوكيز أو Authorization
    let token =
      request.cookies.get("sabq_at")?.value ||
      request.cookies.get("auth-token")?.value ||
      undefined;

    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // تحقق من التوكن
    let decoded: any;
    try {
      const verifySecret =
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || JWT_FALLBACK;
      decoded = jwt.verify(token, verifySecret);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded?.sub || decoded?.id || decoded?.userId;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // اجلب المستخدم
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_admin: true,
        is_verified: true,
        avatar: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin =
      user.is_admin === true ||
      user.role === "admin" ||
      user.role === "super_admin" ||
      user.role === "system_admin";

    // إرجاع بشكل مسطّح (Top-level) للتوافق مع الميدلوير والمكونات
    return NextResponse.json({
      success: true,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
      isAdmin,
      isVerified: user.is_verified || false,
      avatar: user.avatar,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error("/api/user/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "غير مصرح - يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    // إرجاع بيانات المستخدم مع معلومات الدور
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar_url,
      role: user.role,
      isAdmin: user.isAdmin,
      isVerified: true,
      createdAt: new Date(),
      stats: {
        articles: 0,
        likes: 0,
        savedArticles: 0,
        comments: 0,
      },
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("❌ خطأ في استرجاع بيانات المستخدم:", error);
    return NextResponse.json(
      { error: "خطأ في الخادم الداخلي" },
      { status: 500 }
    );
  }
}
