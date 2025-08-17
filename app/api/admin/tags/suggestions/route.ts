import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import prisma from "@/lib/prisma";

// POST /api/admin/tags/suggestions - اقتراحات ذكية للكلمات المفتاحية
export async function POST(request: NextRequest) {
  try {
    const userCheck = await requireAdmin(request);
    if (!userCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { 
      content, 
      title, 
      category,
      max_suggestions = 10,
      include_existing = false 
    } = data;

    if (!content && !title) {
      return NextResponse.json(
        { error: "يجب توفير المحتوى أو العنوان على الأقل" },
        { status: 400 }
      );
    }

    // دمج النص للتحليل
    const textToAnalyze = [title, content].filter(Boolean).join(' ');

    // استخراج الكلمات المحتملة
    const words = extractPotentialTags(textToAnalyze);
    
    // البحث عن الكلمات المفتاحية الموجودة
    const existingTags = await prisma.tags.findMany({
      where: {
        OR: [
          {
            name: {
              in: words,
              mode: 'insensitive'
            }
          },
          {
            synonyms: {
              hasSome: words
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            article_tags: true
          }
        }
      }
    });

    // اقتراحات متشابهة بناءً على الكلمات المفتاحية الموجودة
    const similarTags = await findSimilarTags(words, existingTags);

    // اقتراحات شائعة في نفس الفئة
    const categoryTags = category ? await getCategoryPopularTags(category) : [];

    // اقتراحات جديدة محتملة
    const newSuggestions = generateNewTagSuggestions(words, existingTags);

    // تصنيف الاقتراحات
    const suggestions = {
      existing_matches: include_existing ? existingTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        category: tag.category,
        usage_count: tag._count.article_tags,
        confidence: calculateConfidence(tag.name, words),
        type: 'existing'
      })) : [],
      
      similar_tags: similarTags.slice(0, max_suggestions).map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        category: tag.category,
        usage_count: tag._count.article_tags,
        confidence: tag.confidence,
        type: 'similar'
      })),
      
      category_popular: categoryTags.slice(0, 5).map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        category: tag.category,
        usage_count: tag._count.article_tags,
        type: 'category_popular'
      })),
      
      new_suggestions: newSuggestions.slice(0, max_suggestions).map(suggestion => ({
        name: suggestion.name,
        suggested_slug: suggestion.slug,
        confidence: suggestion.confidence,
        source: suggestion.source,
        type: 'new'
      }))
    };

    return NextResponse.json({
      success: true,
      data: suggestions,
      metadata: {
        total_existing: suggestions.existing_matches.length,
        total_similar: suggestions.similar_tags.length,
        total_category: suggestions.category_popular.length,
        total_new: suggestions.new_suggestions.length,
        analyzed_words_count: words.length
      }
    });

  } catch (error) {
    console.error("❌ خطأ في توليد اقتراحات الكلمات المفتاحية:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "فشل في توليد الاقتراحات",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      },
      { status: 500 }
    );
  }
}

// استخراج الكلمات المحتملة من النص
function extractPotentialTags(text: string): string[] {
  // إزالة علامات HTML والترقيم
  const cleanText = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // تقسيم النص إلى كلمات
  const words = cleanText.split(/\s+/);
  
  // فلترة الكلمات
  const filteredWords = words
    .filter(word => word.length >= 3) // كلمات أطول من 3 أحرف
    .filter(word => !isStopWord(word)) // إزالة الكلمات الشائعة
    .map(word => word.toLowerCase())
    .filter((word, index, array) => array.indexOf(word) === index); // إزالة التكرار

  return filteredWords;
}

// التحقق من الكلمات الشائعة التي يجب تجاهلها
function isStopWord(word: string): boolean {
  const arabicStopWords = [
    'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
    'التي', 'الذي', 'التي', 'كان', 'كانت', 'يكون', 'تكون', 'لكن', 'أو',
    'بعد', 'قبل', 'خلال', 'حول', 'ضد', 'بين', 'تحت', 'فوق', 'أمام', 'خلف',
    'اليوم', 'أمس', 'غدا', 'الآن', 'هنا', 'هناك', 'حيث', 'متى', 'كيف', 'لماذا',
    'ما', 'من', 'أين', 'كم', 'أي', 'بعض', 'كل', 'جميع', 'معظم', 'قليل'
  ];
  
  const englishStopWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ];

  return arabicStopWords.includes(word) || englishStopWords.includes(word);
}

// العثور على كلمات مفتاحية متشابهة
async function findSimilarTags(words: string[], existingTags: any[]): Promise<any[]> {
  const similarTags = await prisma.tags.findMany({
    where: {
      AND: [
        {
          id: {
            notIn: existingTags.map(tag => tag.id)
          }
        },
        {
          OR: words.map(word => ({
            OR: [
              {
                name: {
                  contains: word,
                  mode: 'insensitive'
                }
              },
              {
                synonyms: {
                  hasSome: [word]
                }
              }
            ]
          }))
        }
      ]
    },
    include: {
      _count: {
        select: {
          article_tags: true
        }
      }
    },
    take: 20
  });

  // حساب درجة التشابه
  return similarTags.map(tag => ({
    ...tag,
    confidence: calculateConfidence(tag.name, words)
  })).sort((a, b) => b.confidence - a.confidence);
}

// الحصول على الكلمات المفتاحية الشائعة في فئة معينة
async function getCategoryPopularTags(category: string): Promise<any[]> {
  return await prisma.tags.findMany({
    where: {
      category: {
        equals: category,
        mode: 'insensitive'
      }
    },
    include: {
      _count: {
        select: {
          article_tags: true
        }
      }
    },
    orderBy: {
      article_tags: {
        _count: 'desc'
      }
    },
    take: 10
  });
}

// توليد اقتراحات جديدة
function generateNewTagSuggestions(words: string[], existingTags: any[]): any[] {
  const existingNames = existingTags.map(tag => tag.name.toLowerCase());
  
  const suggestions = words
    .filter(word => !existingNames.includes(word.toLowerCase()))
    .filter(word => word.length >= 3)
    .map(word => ({
      name: word,
      slug: word.toLowerCase().replace(/\s+/g, '-'),
      confidence: Math.min(0.8, word.length / 10), // كلمات أطول تحصل على ثقة أعلى
      source: 'content_analysis'
    }));

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// حساب درجة الثقة
function calculateConfidence(tagName: string, words: string[]): number {
  const tagWords = tagName.toLowerCase().split(/\s+/);
  const matches = tagWords.filter(tagWord => 
    words.some(word => 
      word.includes(tagWord) || tagWord.includes(word)
    )
  );
  
  return Math.min(1, matches.length / Math.max(tagWords.length, words.length));
}
