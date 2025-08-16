import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/app/lib/auth";

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

    // التحقق من المستخدم عبر الطلب (Authorization أولاً)
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) {
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

    // جلب تفاعلات المستخدم مع المقال من الجدول الصحيح
    const userInteractions = await prisma.UserInteractions.findMany({
      where: {
        user_id: currentUser.id,
        article_id: articleId,
      },
      select: {
        interaction_type: true,
      },
    });

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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
