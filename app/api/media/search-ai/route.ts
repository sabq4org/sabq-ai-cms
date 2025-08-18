import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";

export const runtime = "nodejs";

// استخراج الكلمات المفتاحية والكيانات من النص
function extractKeywords(text: string, language: string = "ar"): string[] {
  // تنظيف النص
  const cleanText = text
    .replace(/<[^>]*>/g, "") // إزالة HTML
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // الاحتفاظ بالحروف والأرقام فقط
    .toLowerCase()
    .trim();

  // كلمات الإيقاف العربية الشائعة
  const arabicStopWords = [
    "في", "من", "إلى", "على", "هذا", "هذه", "ذلك", "التي", "الذي",
    "كان", "كانت", "هو", "هي", "نحن", "أنا", "أنت", "هم", "لكن",
    "مع", "عن", "بعد", "قبل", "عند", "لقد", "قد", "كل", "بعض",
  ];

  // كلمات الإيقاف الإنجليزية
  const englishStopWords = [
    "the", "is", "at", "which", "on", "and", "a", "an", "as",
    "are", "was", "were", "be", "have", "has", "had", "been",
    "of", "in", "to", "for", "with", "by", "from", "about",
  ];

  const stopWords = language === "ar" ? arabicStopWords : englishStopWords;

  // استخراج الكلمات
  const words = cleanText.split(/\s+/).filter(word => {
    return word.length > 2 && !stopWords.includes(word);
  });

  // إزالة التكرارات وترتيب حسب التكرار
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // الحصول على أعلى 10 كلمات
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// البحث عن الكيانات (أسماء، أماكن، مؤسسات)
function extractEntities(text: string): string[] {
  const entities: string[] = [];
  
  // أنماط للكيانات العربية
  const patterns = [
    // أسماء الأشخاص (كلمتين أو أكثر تبدأ بحرف كبير)
    /[A-Z\u0600-\u06FF][a-z\u0600-\u06FF]+ [A-Z\u0600-\u06FF][a-z\u0600-\u06FF]+/g,
    // المدن والدول المعروفة
    /(الرياض|جدة|مكة|المدينة|الدمام|السعودية|مصر|الإمارات|قطر|الكويت|البحرين|عمان|الأردن|لبنان|سوريا|العراق)/g,
    // المؤسسات
    /(وزارة|هيئة|مؤسسة|شركة|جامعة|مستشفى|بنك|صندوق)\s+[\u0600-\u06FF]+/g,
  ];

  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.push(...matches);
    }
  });

  return [...new Set(entities)];
}

// POST /api/media/search-ai - البحث الذكي بناءً على محتوى النص
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { contentText, language = "ar" } = await request.json();

    if (!contentText || contentText.trim().length < 10) {
      return NextResponse.json({
        items: [],
        reason: "النص قصير جداً للحصول على اقتراحات",
      });
    }

    // استخراج الكلمات المفتاحية والكيانات
    const keywords = extractKeywords(contentText, language);
    const entities = extractEntities(contentText);
    const allTerms = [...keywords, ...entities];

    if (allTerms.length === 0) {
      return NextResponse.json({
        items: [],
        reason: "لم يتم العثور على كلمات مفتاحية في النص",
      });
    }

    // البحث في قاعدة البيانات
    const searchConditions = allTerms.map(term => ({
      OR: [
        { title: { contains: term, mode: "insensitive" as any } },
        { alt: { contains: term, mode: "insensitive" as any } },
        { description: { contains: term, mode: "insensitive" as any } },
        { tags: { has: term } },
      ],
    }));

    // البحث مع ترتيب النتائج حسب الملاءمة
    const results = await prisma.media.findMany({
      where: {
        OR: searchConditions,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { usageCount: "asc" }, // الأقل استخداماً أولاً
        { createdAt: "desc" }, // الأحدث
      ],
      take: 50,
    });

    // حساب درجة الملاءمة لكل نتيجة
    const scoredResults = results.map(media => {
      let score = 0;
      
      // حساب النقاط بناءً على التطابقات
      allTerms.forEach(term => {
        const termLower = term.toLowerCase();
        if (media.title?.toLowerCase().includes(termLower)) score += 3;
        if (media.alt?.toLowerCase().includes(termLower)) score += 2;
        if (media.description?.toLowerCase().includes(termLower)) score += 1;
        if (media.tags.some(tag => tag.toLowerCase().includes(termLower))) score += 2;
      });

      // مكافأة للصور قليلة الاستخدام
      if (media.usageCount < 5) score += 2;
      if (media.usageCount === 0) score += 3;

      // مكافأة للصور الحديثة
      const daysSinceCreated = (Date.now() - new Date(media.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) score += 2;
      if (daysSinceCreated < 30) score += 1;

      return { ...media, relevanceScore: score };
    });

    // ترتيب حسب درجة الملاءمة وأخذ أفضل 24
    const sortedResults = scoredResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 24)
      .map(({ relevanceScore, ...media }) => media);

    return NextResponse.json({
      items: sortedResults,
      reason: `تم العثور على ${sortedResults.length} صورة مطابقة للمحتوى`,
      keywords: keywords.slice(0, 5),
      entities: entities.slice(0, 5),
    });
  } catch (error) {
    console.error("خطأ في البحث الذكي:", error);
    return NextResponse.json(
      { error: "حدث خطأ في البحث الذكي" },
      { status: 500 }
    );
  }
}
