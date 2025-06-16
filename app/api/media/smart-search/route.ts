import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleTitle, articleId } = body;

    if (!articleTitle) {
      return NextResponse.json({ error: 'Article title is required' }, { status: 400 });
    }

    // محاكاة تحليل ذكي لعنوان المقال
    const smartAnalysis = analyzeArticleTitle(articleTitle);
    
    // البحث في قاعدة البيانات بناءً على التحليل
    const suggestions = await searchMediaByAnalysis(smartAnalysis);
    
    return NextResponse.json({
      success: true,
      suggestions,
      keywords: smartAnalysis.keywords,
      entities: smartAnalysis.entities,
      confidence: smartAnalysis.confidence
    });

  } catch (error) {
    console.error('Error in smart search:', error);
    return NextResponse.json({ error: 'Smart search failed' }, { status: 500 });
  }
}

// تحليل عنوان المقال باستخدام الذكاء الاصطناعي (محاكاة)
function analyzeArticleTitle(title: string) {
  const titleLower = title.toLowerCase();
  
  // قاموس الكيانات والكلمات المفتاحية
  const entityPatterns = {
    personalities: [
      { pattern: ['الملك', 'خادم الحرمين'], entity: 'الملك سلمان بن عبدالعزيز' },
      { pattern: ['ولي العهد', 'الأمير محمد'], entity: 'ولي العهد محمد بن سلمان' },
      { pattern: ['وزير التعليم'], entity: 'وزير التعليم' },
      { pattern: ['وزير الصحة'], entity: 'وزير الصحة' }
    ],
    locations: [
      { pattern: ['الرياض'], entity: 'الرياض' },
      { pattern: ['جدة'], entity: 'جدة' },
      { pattern: ['مكة'], entity: 'مكة المكرمة' },
      { pattern: ['المدينة'], entity: 'المدينة المنورة' },
      { pattern: ['نيوم'], entity: 'مدينة نيوم' }
    ],
    events: [
      { pattern: ['اليوم الوطني'], entity: 'اليوم الوطني السعودي' },
      { pattern: ['رؤية 2030'], entity: 'رؤية المملكة 2030' },
      { pattern: ['كأس العالم'], entity: 'كأس العالم FIFA' }
    ],
    topics: [
      { pattern: ['تعليم', 'جامعة', 'مدرسة'], entity: 'التعليم' },
      { pattern: ['صحة', 'طب', 'مستشفى'], entity: 'الصحة' },
      { pattern: ['اقتصاد', 'استثمار', 'سوق'], entity: 'الاقتصاد' },
      { pattern: ['تقنية', 'ذكاء اصطناعي', 'رقمي'], entity: 'التقنية' }
    ]
  };

  const detectedEntities: string[] = [];
  const keywords: string[] = [];
  let confidence = 0.5;

  // تحليل الشخصيات
  entityPatterns.personalities.forEach(({ pattern, entity }) => {
    if (pattern.some(p => titleLower.includes(p))) {
      detectedEntities.push(entity);
      keywords.push(entity);
      confidence += 0.2;
    }
  });

  // تحليل المواقع
  entityPatterns.locations.forEach(({ pattern, entity }) => {
    if (pattern.some(p => titleLower.includes(p))) {
      detectedEntities.push(entity);
      keywords.push(entity);
      confidence += 0.15;
    }
  });

  // تحليل الأحداث
  entityPatterns.events.forEach(({ pattern, entity }) => {
    if (pattern.some(p => titleLower.includes(p))) {
      detectedEntities.push(entity);
      keywords.push(entity);
      confidence += 0.25;
    }
  });

  // تحليل المواضيع
  entityPatterns.topics.forEach(({ pattern, entity }) => {
    if (pattern.some(p => titleLower.includes(p))) {
      detectedEntities.push(entity);
      keywords.push(entity);
      confidence += 0.1;
    }
  });

  // إضافة كلمات مفتاحية إضافية
  const additionalKeywords = extractKeywords(title);
  keywords.push(...additionalKeywords);

  return {
    entities: [...new Set(detectedEntities)],
    keywords: [...new Set(keywords)],
    confidence: Math.min(confidence, 1.0),
    classification: determineClassification(detectedEntities)
  };
}

// استخراج كلمات مفتاحية إضافية
function extractKeywords(title: string): string[] {
  const commonWords = ['من', 'في', 'على', 'إلى', 'مع', 'عن', 'أن', 'هذا', 'هذه', 'التي', 'التي', 'الذي'];
  const words = title.split(/\s+/).filter(word => 
    word.length > 2 && !commonWords.includes(word.toLowerCase())
  );
  return words.slice(0, 5); // أهم 5 كلمات
}

// تحديد التصنيف بناءً على الكيانات المكتشفة
function determineClassification(entities: string[]): string {
  if (entities.some(e => e.includes('الملك') || e.includes('ولي العهد') || e.includes('وزير'))) {
    return 'شخصيات';
  }
  if (entities.some(e => e.includes('الرياض') || e.includes('نيوم') || e.includes('مكة'))) {
    return 'مباني';
  }
  if (entities.some(e => e.includes('اليوم الوطني') || e.includes('رؤية 2030'))) {
    return 'فعاليات';
  }
  return 'أخرى';
}

// البحث في قاعدة البيانات بناءً على التحليل (محاكاة)
async function searchMediaByAnalysis(analysis: any) {
  // محاكاة نتائج البحث الذكي
  const mockResults = [
    {
      id: '1',
      filename: 'king-salman-official.jpg',
      original_name: 'الملك-سلمان-رسمي.jpg',
      file_url: '/uploads/images/king-salman-official.jpg',
      mime_type: 'image/jpeg',
      file_size: 2048576,
      media_type: 'image',
      width: 1920,
      height: 1080,
      title: 'صورة رسمية لخادم الحرمين الشريفين الملك سلمان',
      description: 'صورة رسمية حديثة لخادم الحرمين الشريفين الملك سلمان بن عبدالعزيز',
      alt_text: 'الملك سلمان بن عبدالعزيز',
      tags: ['ملكي', 'رسمي', 'قيادة'],
      classification: 'شخصيات',
      source_type: 'داخلي',
      uploaded_by: '1',
      usage_count: 25,
      ai_entities: ['الملك سلمان بن عبدالعزيز', 'القصر الملكي'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      filename: 'riyadh-skyline.jpg',
      original_name: 'الرياض-أفق.jpg',
      file_url: '/uploads/images/riyadh-skyline.jpg',
      mime_type: 'image/jpeg',
      file_size: 1536000,
      media_type: 'image',
      width: 1600,
      height: 900,
      title: 'أفق مدينة الرياض الحديث',
      description: 'منظر بانورامي لأفق مدينة الرياض يُظهر ناطحات السحاب الحديثة',
      alt_text: 'أفق مدينة الرياض',
      tags: ['الرياض', 'عمارة', 'مدينة'],
      classification: 'مباني',
      source_type: 'مصور متعاون',
      uploaded_by: '2',
      usage_count: 18,
      ai_entities: ['الرياض', 'ناطحات السحاب'],
      created_at: '2024-01-10T14:30:00Z',
      updated_at: '2024-01-10T14:30:00Z'
    }
  ];

  // فلترة النتائج بناءً على التحليل
  const filteredResults = mockResults.filter(item => {
    // البحث في العناصر المكتشفة
    const entityMatch = analysis.entities.some((entity: string) => 
      item.ai_entities?.some(aiEntity => aiEntity.includes(entity)) ||
      item.title.includes(entity) ||
      item.tags.some(tag => entity.includes(tag))
    );
    
    // البحث في الكلمات المفتاحية
    const keywordMatch = analysis.keywords.some((keyword: string) =>
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.description?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );

    // التطابق مع التصنيف
    const classificationMatch = item.classification === analysis.classification;

    return entityMatch || keywordMatch || classificationMatch;
  });

  return filteredResults;
}
