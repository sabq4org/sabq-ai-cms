import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: NextRequest) {
  try {
    // التحقق من صلاحيات المستخدم
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error || "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey === "sk-your-openai-api-key" || openaiApiKey.startsWith("sk-your-")) {
      return NextResponse.json(
        { 
          valid: false,
          error: "مفتاح OpenAI API غير مضبوط أو يحتوي على قيمة وهمية",
          details: "يرجى ضبط OPENAI_API_KEY في ملف .env.local"
        },
        { status: 200 }
      );
    }

    // اختبار بسيط لصلاحية المفتاح
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const availableModels = data.data?.length || 0;
      
      return NextResponse.json({
        valid: true,
        message: "مفتاح OpenAI API صحيح ويعمل بشكل طبيعي",
        details: `يمكن الوصول إلى ${availableModels} نموذج`,
        models: data.data?.slice(0, 5).map((model: any) => model.id) || []
      });
    } else {
      const errorData = await response.text();
      let errorMessage = "مفتاح OpenAI API غير صحيح";
      
      if (response.status === 401) {
        errorMessage = "مفتاح OpenAI API غير صحيح أو منتهي الصلاحية";
      } else if (response.status === 429) {
        errorMessage = "تم تجاوز حد الاستخدام المسموح";
      } else if (response.status === 403) {
        errorMessage = "مفتاح OpenAI API لا يملك الصلاحيات المطلوبة";
      }

      return NextResponse.json({
        valid: false,
        error: errorMessage,
        details: errorData.substring(0, 200),
        status: response.status
      });
    }

  } catch (error) {
    console.error("خطأ في اختبار مفتاح OpenAI:", error);
    return NextResponse.json({
      valid: false,
      error: "حدث خطأ أثناء اختبار المفتاح",
      details: error instanceof Error ? error.message : "خطأ غير معروف"
    });
  }
}
