/**
 * API لتحليل الصور وإنشاء البيانات الوصفية
 * Image Analysis and Metadata Generation API
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema للتحقق من البيانات
const RequestSchema = z.object({
  imageUrl: z.string().url(),
  filename: z.string().min(1),
  mimeType: z.string().min(1)
});

interface ImageAnalysisResult {
  description: string;
  altText: string;
  suggestedTags: string[];
  category: string;
  isPortrait: boolean;
  hasText: boolean;
  colors: string[];
  confidence: number;
}

// تحليل الصورة بناءً على الاسم والنوع
function analyzeImageBasic(filename: string, mimeType: string): ImageAnalysisResult {
  const normalizedFilename = filename.toLowerCase();
  
  // تحديد نوع الصورة بناءً على الاسم
  let category = "عام";
  let suggestedTags: string[] = [];
  let description = "";
  let altText = "";

  // كشف الشخصيات المهمة
  if (normalizedFilename.includes("محمد_بن_سلمان") || 
      normalizedFilename.includes("mohammed_bin_salman") ||
      normalizedFilename.includes("mbs") ||
      normalizedFilename.includes("ولي_العهد")) {
    category = "شخصيات";
    suggestedTags = ["ولي العهد", "محمد بن سلمان", "السعودية", "قيادة"];
    description = "صورة لولي العهد الأمير محمد بن سلمان";
    altText = "ولي العهد الأمير محمد بن سلمان";
  }
  
  // كشف الملك سلمان
  else if (normalizedFilename.includes("الملك_سلمان") || 
           normalizedFilename.includes("king_salman")) {
    category = "شخصيات";
    suggestedTags = ["الملك سلمان", "السعودية", "قيادة", "ملك"];
    description = "صورة للملك سلمان بن عبدالعزيز";
    altText = "الملك سلمان بن عبدالعزيز";
  }
  
  // كشف المدن السعودية
  else if (normalizedFilename.includes("الرياض") || normalizedFilename.includes("riyadh")) {
    category = "مدن";
    suggestedTags = ["الرياض", "السعودية", "مدن", "عاصمة"];
    description = "صورة من مدينة الرياض";
    altText = "مشهد من مدينة الرياض";
  }
  
  else if (normalizedFilename.includes("جدة") || normalizedFilename.includes("jeddah")) {
    category = "مدن";
    suggestedTags = ["جدة", "السعودية", "مدن", "ساحل"];
    description = "صورة من مدينة جدة";
    altText = "مشهد من مدينة جدة";
  }
  
  else if (normalizedFilename.includes("مكة") || normalizedFilename.includes("mecca")) {
    category = "مدن مقدسة";
    suggestedTags = ["مكة", "الحرم", "الكعبة", "حج", "عمرة"];
    description = "صورة من مكة المكرمة";
    altText = "مشهد من مكة المكرمة";
  }
  
  else if (normalizedFilename.includes("المدينة") || normalizedFilename.includes("madinah")) {
    category = "مدن مقدسة";
    suggestedTags = ["المدينة المنورة", "المسجد النبوي", "السعودية"];
    description = "صورة من المدينة المنورة";
    altText = "مشهد من المدينة المنورة";
  }
  
  // كشف الرياضة
  else if (normalizedFilename.includes("كرة") || 
           normalizedFilename.includes("football") ||
           normalizedFilename.includes("soccer")) {
    category = "رياضة";
    suggestedTags = ["كرة القدم", "رياضة", "ملاعب"];
    description = "صورة رياضية";
    altText = "مشهد رياضي";
  }
  
  // كشف التقنية
  else if (normalizedFilename.includes("تقنية") || 
           normalizedFilename.includes("technology") ||
           normalizedFilename.includes("ai") ||
           normalizedFilename.includes("ذكاء")) {
    category = "تقنية";
    suggestedTags = ["تقنية", "ذكاء اصطناعي", "تطوير"];
    description = "صورة تقنية";
    altText = "مشهد تقني";
  }
  
  // كشف الاقتصاد
  else if (normalizedFilename.includes("اقتصاد") || 
           normalizedFilename.includes("economy") ||
           normalizedFilename.includes("business") ||
           normalizedFilename.includes("استثمار")) {
    category = "اقتصاد";
    suggestedTags = ["اقتصاد", "استثمار", "أعمال"];
    description = "صورة اقتصادية";
    altText = "مشهد اقتصادي";
  }
  
  // كشف نيوم
  else if (normalizedFilename.includes("نيوم") || normalizedFilename.includes("neom")) {
    category = "مشاريع";
    suggestedTags = ["نيوم", "رؤية 2030", "مشاريع", "مستقبل"];
    description = "صورة من مشروع نيوم";
    altText = "مشهد من مشروع نيوم";
  }
  
  // كشف رؤية 2030
  else if (normalizedFilename.includes("رؤية") || 
           normalizedFilename.includes("vision") ||
           normalizedFilename.includes("2030")) {
    category = "رؤية 2030";
    suggestedTags = ["رؤية 2030", "السعودية", "تطوير", "مستقبل"];
    description = "صورة متعلقة برؤية 2030";
    altText = "مشهد من رؤية السعودية 2030";
  }

  // إذا لم يتم التعرف على محتوى محدد
  if (!description) {
    description = "صورة";
    altText = filename.replace(/\.[^/.]+$/, ""); // إزالة الامتداد
    suggestedTags = ["صورة"];
  }

  // تحديد إذا كانت صورة شخصية
  const isPortrait = normalizedFilename.includes("portrait") || 
                    normalizedFilename.includes("شخصية") ||
                    category === "شخصيات";

  // كشف وجود نص في الصورة
  const hasText = normalizedFilename.includes("text") || 
                 normalizedFilename.includes("نص") ||
                 normalizedFilename.includes("logo") ||
                 normalizedFilename.includes("شعار");

  // ألوان افتراضية بناءً على التصنيف
  let colors: string[] = [];
  switch (category) {
    case "شخصيات":
      colors = ["#2563eb", "#ffffff"];
      break;
    case "مدن":
      colors = ["#0ea5e9", "#64748b"];
      break;
    case "رياضة":
      colors = ["#16a34a", "#ffffff"];
      break;
    case "تقنية":
      colors = ["#7c3aed", "#000000"];
      break;
    default:
      colors = ["#6b7280", "#ffffff"];
  }

  return {
    description,
    altText,
    suggestedTags,
    category,
    isPortrait,
    hasText,
    colors,
    confidence: 0.8 // ثقة متوسطة للتحليل البسيط
  };
}

export async function POST(request: NextRequest) {
  try {
    // قراءة البيانات
    const body = await request.json();
    
    // التحقق من صحة البيانات
    const validatedData = RequestSchema.parse(body);
    const { imageUrl, filename, mimeType } = validatedData;

    // التحقق من نوع الملف
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم" },
        { status: 400 }
      );
    }

    console.log(`Analyzing image: ${filename}`);

    // تحليل الصورة
    const analysis = analyzeImageBasic(filename, mimeType);

    console.log(`Analysis completed for ${filename}:`, analysis);

    return NextResponse.json({
      success: true,
      analysis,
      message: "تم تحليل الصورة بنجاح"
    });

  } catch (error) {
    console.error("Error in analyze-image API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "بيانات غير صحيحة",
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطأ في تحليل الصورة" },
      { status: 500 }
    );
  }
}
