import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    let userId = "anonymous"; // قيمة افتراضية

    if (token) {
      try {
        if (process.env.JWT_SECRET) {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
          ) as JWTPayload;
          userId = decoded.userId;
        }
      } catch (error) {
        console.log("JWT verification failed, using anonymous:", error);
      }
    }

    // إنشاء جلسة قراءة جديدة
    const readingSession = await prisma.user_reading_sessions.create({
      data: {
        id: sessionId, // استخدام sessionId كمعرف
        user_id: userId, // تم التأكد من وجود القيمة
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
