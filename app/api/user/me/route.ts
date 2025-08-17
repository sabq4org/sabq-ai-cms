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
      request.cookies.get("access_token")?.value ||
      request.cookies.get("token")?.value ||
      request.cookies.get("jwt")?.value ||
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

    // تحقق من التوكن باستخدام عدة مفاتيح
    let decoded: any;
    const keys = [
      process.env.JWT_ACCESS_SECRET,
      process.env.JWT_SECRET,
      JWT_FALLBACK,
    ].filter(Boolean) as string[];
    for (const key of keys) {
      try {
        decoded = jwt.verify(token, key);
        break;
      } catch {}
    }
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded?.sub || decoded?.id || decoded?.userId || decoded?.user_id;
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
