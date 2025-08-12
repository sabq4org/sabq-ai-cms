/**
 * API لتحليل المحتوى واقتراح الصور المناسبة
 * Content Analysis and Image Suggestion API
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema للتحقق من البيانات
const RequestSchema = z.object({
  content: z.string().min(1).max(10000),
  title: z.string().min(1).max(500).optional(),
  availableImages: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    originalName: z.string(),
    metadata: z.object({
      altText: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional()
    }).optional(),
    tags: z.array(z.string()).optional()
  }))
});

interface ImageSuggestion {
  assetId: string;
  relevanceScore: number; // 0-1
  reasons: string[];
  confidence: number; // 0-1
}

interface ContentAnalysis {
  mainTopics: string[];
  entities: string[];
  keywords: string[];
  category: string;
  tone: string;
  language: string;
}

// تحليل المحتوى باستخدام خوارزمية بسيطة
async function analyzeContent(content: string, title?: string): Promise<ContentAnalysis> {
  try {
    // استخراج الكلمات المفتاحية
    const arabicWords = content.match(/[\u0600-\u06FF]+/g) || [];
    const keywords = [...new Set(arabicWords)]
      .filter(word => word.length > 2)
      .slice(0, 15);

    // استخراج الكيانات (الكلمات المكتوبة بالأحرف الكبيرة أو المسبوقة بـ "الـ")
    const entities = content.match(/(?:الـ)?[أ-ي]+\s+[أ-ي]+/g) || [];
    
    // تحديد المواضيع الرئيسية بناءً على الكلمات المفتاحية
    const mainTopics: string[] = [];
    if (content.includes("محمد بن سلمان") || content.includes("ولي العهد")) {
      mainTopics.push("ولي العهد");
    }
    if (content.includes("السعودية") || content.includes("المملكة")) {
      mainTopics.push("السعودية");
    }
    if (content.includes("رؤية 2030")) {
      mainTopics.push("رؤية 2030");
    }
    if (content.includes("الرياض") || content.includes("جدة")) {
      mainTopics.push("المدن السعودية");
    }

    // تحديد التصنيف
    let category = "عام";
    if (content.includes("اقتصاد") || content.includes("استثمار")) {
      category = "اقتصاد";
    } else if (content.includes("سياسة") || content.includes("حكومة")) {
      category = "سياسة";
    } else if (content.includes("رياضة") || content.includes("كرة")) {
      category = "رياضة";
    } else if (content.includes("تقنية") || content.includes("ذكاء اصطناعي")) {
      category = "تقنية";
    }

    return {
      mainTopics,
      entities: [...new Set(entities)].slice(0, 10),
      keywords,
      category,
      tone: "خبري",
      language: "ar"
    };

  } catch (error) {
    console.error("Error analyzing content:", error);
    // fallback analysis
    return {
      mainTopics: [],
      entities: [],
      keywords: content.split(/\s+/).slice(0, 10),
      category: "عام",
      tone: "خبري",
      language: "ar"
    };
  }
}

// مطابقة الصور مع المحتوى
function matchImagesWithContent(
  analysis: ContentAnalysis,
  availableImages: any[]
): ImageSuggestion[] {
  const suggestions: ImageSuggestion[] = [];

  for (const image of availableImages) {
    let relevanceScore = 0;
    const reasons: string[] = [];
    let matchCount = 0;

    // جمع كل النصوص المتعلقة بالصورة
    const imageTexts = [
      image.filename,
      image.originalName,
      image.metadata?.altText || "",
      image.metadata?.description || "",
      ...(image.metadata?.tags || []),
      ...(image.tags || [])
    ].filter(Boolean).map(text => text.toLowerCase());

    const imageTextCombined = imageTexts.join(" ");

    // فحص المواضيع الرئيسية
    for (const topic of analysis.mainTopics) {
      if (imageTextCombined.includes(topic.toLowerCase())) {
        relevanceScore += 0.3;
        matchCount++;
        reasons.push(`متعلق بموضوع: ${topic}`);
      }
    }

    // فحص الكيانات
    for (const entity of analysis.entities) {
      if (imageTextCombined.includes(entity.toLowerCase())) {
        relevanceScore += 0.25;
        matchCount++;
        reasons.push(`يحتوي على: ${entity}`);
      }
    }

    // فحص الكلمات المفتاحية
    for (const keyword of analysis.keywords) {
      if (imageTextCombined.includes(keyword.toLowerCase())) {
        relevanceScore += 0.1;
        matchCount++;
        if (reasons.length < 5) {
          reasons.push(`كلمة مفتاحية: ${keyword}`);
        }
      }
    }

    // فحص التصنيف
    if (imageTextCombined.includes(analysis.category.toLowerCase())) {
      relevanceScore += 0.2;
      matchCount++;
      reasons.push(`من نفس التصنيف: ${analysis.category}`);
    }

    // تطبيق الحد الأقصى للنقاط
    relevanceScore = Math.min(relevanceScore, 1.0);

    // حساب مستوى الثقة
    const confidence = matchCount > 0 ? Math.min(matchCount / 3, 1.0) : 0;

    // إضافة فقط الصور ذات الصلة
    if (relevanceScore > 0.1 && reasons.length > 0) {
      suggestions.push({
        assetId: image.id,
        relevanceScore,
        reasons: reasons.slice(0, 3), // أعلى 3 أسباب
        confidence
      });
    }
  }

  // ترتيب حسب النقاط
  return suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20); // أعلى 20 اقتراح
}

export async function POST(request: NextRequest) {
  try {
    // قراءة البيانات
    const body = await request.json();
    
    // التحقق من صحة البيانات
    const validatedData = RequestSchema.parse(body);
    const { content, title, availableImages } = validatedData;

    if (availableImages.length === 0) {
      return NextResponse.json({
        suggestions: [],
        analysis: null,
        message: "لا توجد صور متاحة للتحليل"
      });
    }

    // تحليل المحتوى
    console.log("Analyzing content...");
    const analysis = await analyzeContent(content, title);

    // مطابقة الصور
    console.log("Matching images with content...");
    const suggestions = matchImagesWithContent(analysis, availableImages);

    console.log(`Found ${suggestions.length} relevant images`);

    return NextResponse.json({
      suggestions,
      analysis,
      message: suggestions.length > 0 
        ? `تم العثور على ${suggestions.length} صورة مناسبة`
        : "لم يتم العثور على صور مناسبة"
    });

  } catch (error) {
    console.error("Error in suggest-images API:", error);

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
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
