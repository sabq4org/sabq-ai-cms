import { NextResponse } from "next/server";

// تسجيل دخول تجريبي للتطوير
export async function POST() {
  // منع الوصول في بيئة الإنتاج
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: "Not Found" },
      { status: 404 }
    );
  }
  
  try {
    // إنشاء مستخدم افتراضي
    const user = {
      id: "dev-user-id",
      name: "مطور المحتوى",
      email: "dev@sabq.org",
      role: "admin",
      is_admin: true,
    };

    // إنشاء استجابة مع تعيين الكوكيز
    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user,
    });

    // تعيين كوكيز المصادقة
    response.cookies.set("auth-token", "dev-session-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // أسبوع واحد
    });

    return response;
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error);
    return NextResponse.json(
      {
        error: "خطأ في تسجيل الدخول",
      },
      { status: 500 }
    );
  }
}

// جلب بيانات المستخدم الحالي
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "يمكنك استخدام POST لتسجيل دخول تجريبي",
    note: "هذا للتطوير فقط",
  });
}
