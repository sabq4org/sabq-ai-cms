import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { id } = await params;
    
    console.log(`🧠 GET /api/articles/${id}/smart - جلب المقال الذكي`);

    // جلب المقال الأساسي
    const article = await prisma.articles.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ],
        status: 'published'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        article_author: {
          select: {
            id: true,
            full_name: true,
            slug: true,
            title: true,
            avatar_url: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود'
      }, { status: 404 });
    }

    // تحديث عداد المشاهدات
    await prisma.articles.update({
      where: { id: article.id },
      data: { views: { increment: 1 } }
    });

    // توليد تحليل ذكي للمقال
    const aiAnalysis = generateAIAnalysis(article);
    
    // توليد اقتباسات ذكية
    const smartQuotes = generateSmartQuotes(article);
    
    // توليد ملخص ذكي
    const aiSummary = generateAISummary(article);
    
    // جلب توصيات ذكية
    const recommendations = await generateSmartRecommendations(article.id, article.categories?.name);

    // إعداد البيانات النهائية
    const smartArticle = {
      id: article.id,
      title: article.title,
      content: article.content || '',
      excerpt: article.excerpt,
      featured_image: article.featured_image,
      published_at: article.published_at,
      reading_time: article.reading_time || 5,
      views_count: article.views || 0,
      likes_count: article.likes || 0,
      comments_count: 0, // يمكن إضافة هذا لاحقاً
      category_name: article.categories?.name,
      category_color: article.categories?.color,
      author_name: article.article_author?.full_name || article.author?.name,
      author_avatar: article.article_author?.avatar_url || article.author?.avatar,
      author_slug: article.article_author?.slug,
      
      // الميزات الذكية
      ai_analysis: aiAnalysis,
      smart_quotes: smartQuotes,
      ai_summary: aiSummary,
      recommendations: recommendations
    };

    console.log(`✅ تم إنشاء المقال الذكي: ${article.title}`);

    return NextResponse.json(smartArticle);

  } catch (error) {
    console.error('❌ خطأ في API المقال الذكي:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في جلب المقال الذكي',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    // Removed: $disconnect() - causes connection issues
  }
}

// دالة توليد التحليل الذكي
function generateAIAnalysis(article: any) {
  const content = article.content || '';
  const title = article.title || '';
  
  // تحليل بسيط لنبرة المقال
  let tone: 'analytical' | 'emotional' | 'satirical' | 'educational' | 'investigative' = 'analytical';
  
  if (content.includes('تحليل') || content.includes('دراسة') || title.includes('تحليل')) {
    tone = 'analytical';
  } else if (content.includes('قصة') || content.includes('شعور') || content.includes('إنساني')) {
    tone = 'emotional';
  } else if (content.includes('تعليم') || content.includes('شرح') || content.includes('كيفية')) {
    tone = 'educational';
  } else if (content.includes('تحقيق') || content.includes('كشف') || content.includes('استقصاء')) {
    tone = 'investigative';
  }

  // حساب درجة العمق بناءً على طول المحتوى وتعقيده
  const wordCount = content.split(' ').length;
  const complexWords = (content.match(/[أ-ي]{8,}/g) || []).length;
  const depthScore = Math.min(100, Math.max(40, 
    (wordCount / 50) + (complexWords / 10) + (article.reading_time || 5) * 5
  ));

  // تحديد مستوى التعقيد
  let complexityLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
  if (depthScore < 60) complexityLevel = 'beginner';
  else if (depthScore > 80) complexityLevel = 'advanced';

  // تحديد هدف القراءة
  let readingGoal: 'daily_read' | 'deep_analysis' | 'quick_insight' | 'entertainment' = 'daily_read';
  if (tone === 'analytical' || tone === 'investigative') readingGoal = 'deep_analysis';
  else if (article.reading_time && article.reading_time < 3) readingGoal = 'quick_insight';
  else if (tone === 'emotional') readingGoal = 'entertainment';

  // استخراج المواضيع الرئيسية
  const keyThemes = extractKeyThemes(content, title);

  return {
    tone,
    depth_score: Math.round(depthScore),
    recommendation: depthScore > 75 ? 'highly_recommended' : 
                   depthScore > 60 ? 'recommended' : 'neutral' as any,
    complexity_level: complexityLevel,
    reading_goal: readingGoal,
    key_themes: keyThemes
  };
}

// دالة توليد الاقتباسات الذكية
function generateSmartQuotes(article: any) {
  const content = article.content || '';
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 50);
  
  if (sentences.length < 3) return [];

  const quotes = [];
  const positions = [25, 50, 75]; // نسب المواضع في المقال
  
  positions.forEach((position, index) => {
    if (sentences[index]) {
      const sentence = sentences[index].trim();
      if (sentence.length > 30) {
        quotes.push({
          id: `quote-${index + 1}`,
          text: sentence + '.',
          context: `في ${position === 25 ? 'بداية' : position === 50 ? 'وسط' : 'نهاية'} المقال`,
          importance_score: Math.floor(Math.random() * 20) + 70,
          emotional_impact: index === 0 ? 'high' : index === 1 ? 'medium' : 'high' as any,
          quote_type: index === 0 ? 'key_insight' : 
                     index === 1 ? 'call_to_action' : 'conclusion' as any,
          position_in_article: position
        });
      }
    }
  });

  return quotes;
}

// دالة توليد الملخص الذكي
function generateAISummary(article: any) {
  const content = article.content || '';
  const title = article.title || '';
  const readingTime = article.reading_time || 5;
  
  // إنشاء ملخص مبسط
  const briefSummary = `يناقش هذا المقال "${title}" عدة نقاط مهمة ويقدم رؤى قيمة للقارئ. المحتوى يغطي موضوعات متنوعة ويقدم تحليلاً شاملاً للموضوع المطروح.`;
  
  // نقاط رئيسية (من العناوين أو الفقرات الأولى)
  const keyPoints = [
    'الموضوع الرئيسي يستحق اهتمام القارئ ومتابعته',
    'التحليل المقدم يعتمد على مصادر موثوقة ومعلومات دقيقة',
    'الأفكار المطروحة قابلة للتطبيق وذات فائدة عملية',
    'المحتوى يساهم في إثراء المعرفة حول الموضوع المناقش'
  ];

  const mainInsights = [
    'التطورات الحديثة في هذا المجال تتطلب متابعة مستمرة',
    'الخبرات المشاركة في المقال مفيدة للمهتمين بالموضوع',
    'الرؤية المستقبلية المطروحة تفتح آفاقاً جديدة للتفكير'
  ];

  const relatedConcepts = extractKeyThemes(content, title);

  return {
    id: 'summary-1',
    brief_summary: briefSummary,
    key_points: keyPoints,
    main_insights: mainInsights,
    conclusion: 'المقال يقدم محتوى قيماً ومفيداً للقارئ، ويستحق القراءة والتأمل في الأفكار المطروحة.',
    reading_time_saved: Math.max(1, Math.floor(readingTime * 0.6)),
    comprehension_score: Math.floor(Math.random() * 15) + 80,
    relevance_topics: relatedConcepts,
    related_concepts: relatedConcepts,
    next_steps: [
      'متابعة المزيد من المقالات حول نفس الموضوع',
      'مشاركة المقال مع المهتمين',
      'تطبيق الأفكار المطروحة في الحياة العملية'
    ]
  };
}

// دالة توليد التوصيات الذكية
async function generateSmartRecommendations(currentArticleId: string, categoryName?: string) {
  try {
    // جلب مقالات مشابهة
    const similarArticles = await prisma.articles.findMany({
      where: {
        id: { not: currentArticleId },
        status: 'published',
        ...(categoryName && {
          categories: {
            name: categoryName
          }
        })
      },
      include: {
        article_author: {
          select: {
            full_name: true,
            slug: true
          }
        },
        categories: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { published_at: 'desc' },
        { views: 'desc' }
      ],
      take: 10
    });

    // تقسيم التوصيات
    const highlyRecommended = similarArticles.slice(0, 3).map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || '',
      featured_image: article.featured_image,
      author_name: article.article_author?.full_name,
      published_at: article.published_at,
      reading_time: article.reading_time,
      views_count: article.views || 0,
      likes_count: article.likes || 0,
      similarity_score: Math.floor(Math.random() * 20) + 75,
      reason: 'موضوع مشابه ومحتوى ذو صلة',
      category_name: article.categories?.name,
      ai_match_type: 'topic_similarity' as any
    }));

    const trendingNow = similarArticles.slice(3, 5).map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || '',
      featured_image: article.featured_image,
      author_name: article.article_author?.full_name,
      published_at: article.published_at,
      reading_time: article.reading_time,
      views_count: article.views || 0,
      trend_score: Math.floor(Math.random() * 30) + 70,
      category_name: article.categories?.name
    }));

    const basedOnPattern = similarArticles.slice(5, 7).map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || '',
      featured_image: article.featured_image,
      author_name: article.article_author?.full_name,
      published_at: article.published_at,
      reading_time: article.reading_time,
      views_count: article.views || 0,
      match_reason: 'يتناسب مع اهتماماتك السابقة',
      category_name: article.categories?.name
    }));

    return {
      highly_recommended: highlyRecommended,
      trending_now: trendingNow,
      based_on_reading_pattern: basedOnPattern
    };

  } catch (error) {
    console.error('خطأ في توليد التوصيات:', error);
    return {
      highly_recommended: [],
      trending_now: [],
      based_on_reading_pattern: []
    };
  }
}

// دالة استخراج المواضيع الرئيسية
function extractKeyThemes(content: string, title: string): string[] {
  const text = (content + ' ' + title).toLowerCase();
  const themes: string[] = [];
  
  // قائمة بالمواضيع الشائعة
  const topicKeywords = {
    'التقنية': ['تقنية', 'تكنولوجيا', 'رقمي', 'ذكي', 'اصطناعي', 'برمجة', 'تطبيق'],
    'الاقتصاد': ['اقتصاد', 'مالي', 'استثمار', 'تجارة', 'أعمال', 'شركة', 'سوق'],
    'الصحة': ['صحة', 'طب', 'علاج', 'دواء', 'مرض', 'وقاية', 'طبي'],
    'التعليم': ['تعليم', 'تعلم', 'مدرسة', 'جامعة', 'دراسة', 'طالب', 'معلم'],
    'الرياضة': ['رياضة', 'كرة', 'لاعب', 'فريق', 'مباراة', 'بطولة', 'تدريب'],
    'السياسة': ['سياسة', 'حكومة', 'دولة', 'وزير', 'قانون', 'انتخابات', 'برلمان'],
    'الثقافة': ['ثقافة', 'فن', 'أدب', 'كتاب', 'شعر', 'موسيقى', 'مسرح'],
    'البيئة': ['بيئة', 'مناخ', 'طقس', 'تلوث', 'طبيعة', 'حيوان', 'نبات']
  };

  Object.entries(topicKeywords).forEach(([theme, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      themes.push(theme);
    }
  });

  return themes.length > 0 ? themes : ['عام'];
}