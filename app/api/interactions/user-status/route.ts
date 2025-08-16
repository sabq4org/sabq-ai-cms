import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const getUserFromRequest = async (request: NextRequest) => {
  try {
    // 1) Authorization header
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    let token: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // 2) Cookies fallback
    if (!token) {
      const c = request.cookies;
      token =
        c.get("auth-token")?.value ||
        c.get("sabq_at")?.value ||
        c.get("access_token")?.value ||
        c.get("token")?.value ||
        c.get("jwt")?.value ||
        null;
    }

    if (!token) return null;

    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "your-super-secret-jwt-key";
    const decoded: any = jwt.verify(token, secret);
    const userId = decoded?.sub || decoded?.id || decoded?.userId || decoded?.user_id;
    if (!userId) return null;

    return { id: String(userId) };
  } catch {
    return null;
  }
};

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

    // التحقق من المستخدم (Authorization أولاً ثم الكوكيز)
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
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

    const userInteractions = await prisma.UserInteractions.findMany({
      where: {
        user_id: currentUser.id,
        article_id: articleId,
      },
      select: { interaction_type: true },
    });

    const interactionTypes = userInteractions.map((i) => i.interaction_type);

    return NextResponse.json({
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
    });
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
