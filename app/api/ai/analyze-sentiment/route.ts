import { NextRequest, NextResponse } from "next/server";

// تحليل اتجاه المحتوى باستخدام خوارزمية بسيطة
function analyzeSentimentBasic(
  content: string,
  title: string
): "neutral" | "positive" | "critical" {
  const text = `${title} ${content}`.toLowerCase();

  // كلمات إيجابية
  const positiveWords = [
    "ممتاز",
    "رائع",
    "مذهل",
    "نجاح",
    "تطور",
    "تحسن",
    "إنجاز",
    "فخر",
    "سعادة",
    "أمل",
    "تقدم",
    "ازدهار",
    "نمو",
    "إبداع",
    "ابتكار",
    "تميز",
    "انتصار",
    "إنجاز",
    "تحقيق",
    "استثمار",
    "فرصة",
    "مستقبل",
    "حلم",
    "excellent",
    "great",
    "amazing",
    "success",
    "progress",
    "achievement",
  ];

  // كلمات نقدية
  const criticalWords = [
    "مشكلة",
    "خطأ",
    "فشل",
    "أزمة",
    "تراجع",
    "انخفاض",
    "سوء",
    "ضعف",
    "قلق",
    "خوف",
    "تحدي",
    "صعوبة",
    "عقبة",
    "مخاطر",
    "تهديد",
    "انتقاد",
    "اعتراض",
    "رفض",
    "استياء",
    "غضب",
    "احتجاج",
    "مقاومة",
    "معارضة",
    "problem",
    "error",
    "failure",
    "crisis",
    "decline",
    "criticism",
  ];

  // كلمات تحليلية تشير للنقد البناء
  const analyticalWords = [
    "تحليل",
    "دراسة",
    "بحث",
    "تقييم",
    "مراجعة",
    "فحص",
    "اختبار",
    "analysis",
    "study",
    "research",
    "evaluation",
    "review",
    "examination",
  ];

  // حساب النقاط
  let positiveScore = 0;
  let criticalScore = 0;
  let analyticalScore = 0;

  positiveWords.forEach((word) => {
    const matches = text.split(word).length - 1;
    positiveScore += matches;
  });

  criticalWords.forEach((word) => {
    const matches = text.split(word).length - 1;
    criticalScore += matches;
  });

  analyticalWords.forEach((word) => {
    const matches = text.split(word).length - 1;
    analyticalScore += matches;
  });

  // تحديد الاتجاه
  if (criticalScore > positiveScore && criticalScore > 2) {
    return "critical";
  } else if (positiveScore > criticalScore && positiveScore > 2) {
    return "positive";
  } else if (analyticalScore > 3) {
    return "critical"; // التحليل العميق غالباً يكون نقدياً
  } else {
    return "neutral";
  }
}

// محاكاة تحليل متقدم بالذكاء الاصطناعي (يمكن ربطه لاحقاً بـ OpenAI أو Claude)
async function analyzeSentimentAI(
  content: string,
  title: string
): Promise<{
  sentiment: "neutral" | "positive" | "critical";
  confidence: number;
  keywords: string[];
  summary: string;
}> {
  // هنا يمكن إضافة استدعاء لـ OpenAI API أو أي خدمة ذكاء اصطناعي أخرى
  // const response = await openai.chat.completions.create({...});

  // حالياً نستخدم التحليل الأساسي
  const sentiment = analyzeSentimentBasic(content, title);

  // استخراج الكلمات المفتاحية (بسيط)
  const words = content
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 &&
        ![
          "على",
          "في",
          "من",
          "إلى",
          "عن",
          "مع",
          "هذا",
          "هذه",
          "التي",
          "الذي",
        ].includes(word)
    );

  const wordCount: { [key: string]: number } = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const keywords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  // توليد ملخص بسيط
  const summaries = {
    positive: "يحتوي المقال على محتوى إيجابي ومحفز",
    critical: "يتضمن المقال تحليلاً نقدياً أو يطرح تحديات",
    neutral: "المقال متوازن ويعرض المعلومات بحيادية",
  };

  return {
    sentiment,
    confidence: 0.75, // نسبة ثقة افتراضية
    keywords,
    summary: summaries[sentiment],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { content, title } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "محتوى المقال مطلوب للتحليل" },
        { status: 400 }
      );
    }

    // إضافة تأخير صغير لمحاكاة المعالجة
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const analysis = await analyzeSentimentAI(content, title || "");

    return NextResponse.json({
      success: true,
      sentiment: analysis.sentiment,
      confidence: analysis.confidence,
      keywords: analysis.keywords,
      summary: analysis.summary,
      analysis: {
        contentLength: content.length,
        wordCount: content.split(/\s+/).length,
        readingTime: Math.ceil(content.split(/\s+/).length / 200),
      },
    });
  } catch (error) {
    console.error("خطأ في تحليل الاتجاه:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحليل اتجاه المحتوى" },
      { status: 500 }
    );
  }
}
