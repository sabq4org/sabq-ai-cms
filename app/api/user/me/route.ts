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
