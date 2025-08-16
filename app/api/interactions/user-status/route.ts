import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface JWTPayload {
  userId: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    // التحقق من المستخدم
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      // إرجاع حالة افتراضية للمستخدمين غير المسجلين
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
        interactions: {
          liked: false,
          saved: false,
          shared: false,
          hasComment: false,
        },
      });
    }

    let userId: string;
    try {
      if (!process.env.JWT_SECRET) {
        console.warn("JWT_SECRET not configured");
        throw new Error("JWT configuration missing");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      userId = decoded.userId;
    } catch (error) {
      console.log("JWT verification failed:", error);
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
        interactions: {
          liked: false,
          saved: false,
          shared: false,
          hasComment: false,
        },
      });
    }

    // جلب تفاعلات المستخدم مع المقال من الجدول الصحيح
    const userInteractions = await prisma.UserInteractions.findMany({
      where: {
        user_id: userId,
        article_id: articleId,
      },
      select: {
        interaction_type: true,
      },
    });

    console.log(`🔍 جلب تفاعلات المستخدم ${userId} للمقال ${articleId}:`, userInteractions);

    // تحويل التفاعلات إلى كائن
    const interactionTypes = userInteractions.map((i) => i.interaction_type);

    const result = {
      success: true,
      isAuthenticated: true,
      liked: interactionTypes.includes("like"),
      saved: interactionTypes.includes("save"), 
      hasLiked: interactionTypes.includes("like"),
      hasSaved: interactionTypes.includes("save"),
      interactions: {
        liked: interactionTypes.includes("like"),
        saved: interactionTypes.includes("save"),
        shared: interactionTypes.includes("share"),
        hasComment: interactionTypes.includes("comment"),
      },
    };

    console.log('✅ نتيجة جلب الحالة:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// دعم POST أيضاً للتوافق مع بعض المكونات القديمة
export async function POST(request: NextRequest) {
  return GET(request);
}
