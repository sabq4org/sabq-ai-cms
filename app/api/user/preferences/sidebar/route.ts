import { NextRequest, NextResponse } from "next/server";

// لأغراض الاختبار، سنحتفظ بالتفضيلات في الذاكرة مؤقتاً
let mockPreferences: {
  sidebar_order: any[] | null;
  sidebar_hidden: any[];
} = {
  sidebar_order: null,
  sidebar_hidden: [],
};

export async function GET() {
  try {
    console.log("✅ GET sidebar preferences called");
    return NextResponse.json({
      sidebar_order: mockPreferences.sidebar_order,
      sidebar_hidden: mockPreferences.sidebar_hidden,
    });
  } catch (error) {
    console.error("❌ Error in GET /api/user/preferences/sidebar:", error);
    return NextResponse.json({
      sidebar_order: null,
      sidebar_hidden: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("✅ POST sidebar preferences called");

    const body = await request.json();
    const { sidebar_order, sidebar_hidden } = body;

    console.log("📦 Received data:", { sidebar_order, sidebar_hidden });

    // التحقق من صحة البيانات
    if (!Array.isArray(sidebar_order)) {
      console.log("❌ Invalid sidebar_order");
      return NextResponse.json(
        { error: "ترتيب الشريط الجانبي يجب أن يكون مصفوفة" },
        { status: 400 }
      );
    }

    if (!Array.isArray(sidebar_hidden)) {
      console.log("❌ Invalid sidebar_hidden");
      return NextResponse.json(
        { error: "العناصر المخفية يجب أن تكون مصفوفة" },
        { status: 400 }
      );
    }

    // حفظ التفضيلات في الذاكرة مؤقتاً
    mockPreferences.sidebar_order = sidebar_order;
    mockPreferences.sidebar_hidden = sidebar_hidden;

    console.log("✅ Preferences saved successfully:", mockPreferences);

    return NextResponse.json({
      message: "تم حفظ التفضيلات بنجاح",
      sidebar_order,
      sidebar_hidden,
    });
  } catch (error) {
    console.error("❌ Error in POST /api/user/preferences/sidebar:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log("✅ DELETE sidebar preferences called");

    // إعادة تعيين التفضيلات
    mockPreferences.sidebar_order = null;
    mockPreferences.sidebar_hidden = [];

    console.log("✅ Preferences reset successfully");

    return NextResponse.json({
      message: "تم إعادة تعيين التفضيلات بنجاح",
    });
  } catch (error) {
    console.error("❌ Error in DELETE /api/user/preferences/sidebar:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
