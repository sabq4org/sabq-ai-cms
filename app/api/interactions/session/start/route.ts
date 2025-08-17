import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

interface JWTPayload {
  userId: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, sessionId, deviceType } = body;

    if (!articleId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // التحقق من المستخدم (اختياري للآن)
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    const ANONYMOUS_USER_ID = "00000000-0000-0000-0000-000000000000";
    let userId: string = ANONYMOUS_USER_ID; // قيمة افتراضية آمنة بطول 36

    if (token) {
      try {
        if (process.env.JWT_SECRET) {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
          ) as JWTPayload;
          // في حالة عدم وجود userId في التوكن نستخدم المعرّف المجهول الآمن
          userId = decoded.userId || ANONYMOUS_USER_ID;
        }
      } catch (error) {
        console.log("JWT verification failed, using anonymous:", error);
      }
    }

    // التأكد من أن معرف الجلسة بطول مناسب لقاعدة البيانات (<= 36)
    const safeSessionId =
      typeof sessionId === "string" && sessionId.length <= 36
        ? sessionId
        : randomUUID();

    // إنشاء جلسة قراءة جديدة
    const readingSession = await prisma.user_reading_sessions.create({
      data: {
        id: safeSessionId, // استخدام sessionId الآمن كمعرف
        user_id: userId, // تم التأكد من وجود قيمة نصية صالحة بطول 36
        article_id: articleId,
        started_at: new Date(),
        device_type: deviceType || "desktop",
        scroll_depth: 0,
        read_percentage: 0,
        duration_seconds: 0,
      },
    });

    // تسجيل تفاعل "view" فقط للمستخدمين المسجلين
    if (userId !== "anonymous") {
      try {
        await prisma.interactions.create({
          data: {
            user_id: userId,
            article_id: articleId, // استخدام article_id
            type: "view",
            metadata: {
              sessionId,
              deviceType,
            },
          },
        });
      } catch (interactionError) {
        console.log(
          "Could not create interaction, continuing:",
          interactionError
        );
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: readingSession.id,
      message: "Reading session started",
    });
  } catch (error) {
    console.error("Error starting reading session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
