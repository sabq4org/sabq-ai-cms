import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentUser } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // التحقق من صلاحيات الأدمن
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "غير مصرح لك بتنفيذ هذا الإجراء" },
        { status: 403 }
      );
    }

    // مسح cache الصفحات الرئيسية
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/home-v2");
    revalidatePath("/articles");
    revalidatePath("/news");
    
    // مسح cache tags
    revalidateTag("articles");
    revalidateTag("featured-news");
    revalidateTag("news");

    console.log("✅ تم مسح الكاش بنجاح");

    return NextResponse.json({
      success: true,
      message: "تم مسح الكاش بنجاح. ستظهر الأخبار الجديدة الآن."
    });
  } catch (error) {
    console.error("❌ خطأ في مسح الكاش:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء مسح الكاش" },
      { status: 500 }
    );
  }
}
