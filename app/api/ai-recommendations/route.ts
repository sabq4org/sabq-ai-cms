import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RecommendedArticle {
  id: string;
  title: string;
  slug: string;
  featured_image?: string | null;
  views?: number;
  readingTime?: number;
  confidence: number;
  reason: string;
  category?: string;
  published_at?: Date | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const categoryName = searchParams.get("categoryName");
    const tags = searchParams.get("tags")?.split(",") || [];

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    // مفاتيح كاش بالذاكرة حسب المعطيات (غير شخصية)
    const cacheKey = `ai-recs:${articleId}:${categoryName || ''}:${tags.sort().join('|')}`;
    // كاش بالذاكرة في نطاق العملية (قد يستمر على الخادم)
    // eslint-disable-next-line no-var
    var globalAny: any = global as any;
    if (!globalAny.__AI_RECS_CACHE__) {
      globalAny.__AI_RECS_CACHE__ = new Map<string, { data: any; ts: number }>();
    }
    const RAM_CACHE_TTL = 5 * 60 * 1000; // 5 دقائق
    const now = Date.now();
    const cached = globalAny.__AI_RECS_CACHE__.get(cacheKey);
    if (cached && (now - cached.ts) < RAM_CACHE_TTL) {
      const res = NextResponse.json(cached.data);
      res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=1800');
      return res;
    }

    // جلب المقال الحالي
    const currentArticle = await prisma.articles.findUnique({
      where: { id: articleId },
      include: {
        categories: true,
        article_tags: {
          include: { tags: true }
        }
      }
    });

    if (!currentArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // جلب مقالات مماثلة من قاعدة البيانات
    const similarArticles = await prisma.articles.findMany({
      where: {
        AND: [
          { id: { not: articleId } },
          { status: "published" },
          {
            OR: [
              // نفس الفئة
              currentArticle.categories ? {
                categories: {
                  id: currentArticle.categories.id
                }
              } : {},
              // نفس الكلمات المفتاحية
              currentArticle.article_tags.length > 0 ? {
                article_tags: {
                  some: {
                    tag_id: {
                      in: currentArticle.article_tags.map(at => at.tag_id)
                    }
                  }
                }
              } : {},
              // مقالات شائعة
              { views: { gte: 1000 } }
            ]
          }
        ]
      },
      include: {
        categories: true,
        article_tags: {
          include: { tags: true }
        }
      },
      orderBy: [
        { views: "desc" },
        { published_at: "desc" }
      ],
      take: 10
    });

    if (similarArticles.length === 0) {
      // إذا لم نجد مقالات مماثلة، نجلب أحدث المقالات
      const latestArticles = await prisma.articles.findMany({
        where: {
          AND: [
            { id: { not: articleId } },
            { status: "published" }
          ]
        },
        include: {
          categories: true
        },
        orderBy: { published_at: "desc" },
        take: 3
      });

      const recommendations: RecommendedArticle[] = latestArticles.map(article => ({
        id: article.id,
        title: article.title || "مقال بدون عنوان",
        slug: article.slug || article.id,
        featured_image: article.featured_image,
        views: article.views || 0,
        readingTime: Math.max(1, Math.ceil((article.content?.length || 0) / 250)),
        confidence: 60,
        reason: "مقال حديث",
        category: article.categories?.name || "عام",
        published_at: article.published_at
      }));

      return NextResponse.json({
        recommendations,
        averageConfidence: 60,
        totalArticles: latestArticles.length
      });
    }

    // استخدام AI لتحليل وترتيب التوصيات (مع حد زمني صارم)
    let aiAnalyzedRecommendations: RecommendedArticle[] = [];

    if (process.env.OPENAI_API_KEY) {
      try {
        const currentTitle = currentArticle.title || "";
        const currentContent = (currentArticle.content || "").substring(0, 1000);
        const currentCategory = currentArticle.categories?.name || "";
        
        const articlesToAnalyze = similarArticles.slice(0, 5).map(article => ({
          id: article.id,
          title: article.title,
          category: article.categories?.name,
          content: (article.content || "").substring(0, 500)
        }));

        const prompt = `
أنت خبير في تحليل المحتوى العربي وإعداد التوصيات الذكية.

المقال الحالي:
العنوان: ${currentTitle}
الفئة: ${currentCategory}
المحتوى: ${currentContent}

المقالات المرشحة للتوصية:
${articlesToAnalyze.map((article, index) => `
${index + 1}. المعرف: ${article.id}
   العنوان: ${article.title}
   الفئة: ${article.category}
   المحتوى: ${article.content}
`).join('')}

يرجى تحليل المقالات وترتيبها حسب مدى ملاءمتها للقارئ الذي قرأ المقال الحالي.
أعطني النتيجة في صيغة JSON مع التقييم التالي:

{
  "recommendations": [
    {
      "id": "article_id",
      "confidence": number (من 1 إلى 100),
      "reason": "سبب التوصية باللغة العربية (مثل: مقال مرتبط، نفس الموضوع، تكملة طبيعية)",
      "relevanceScore": number (من 1 إلى 10)
    }
  ]
}

ملاحظة: رتب النتائج حسب الملاءمة الأعلى أولاً.
`;

        const aiCall = openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "أنت مساعد ذكي متخصص في تحليل المحتوى العربي وإعداد توصيات ذكية للقراء. أجب دائماً بصيغة JSON صحيحة."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        });

        // حد زمني 2500ms للتوليد؛ بعدها نسقط للمنطق التقليدي
        const completion = await Promise.race([
          aiCall,
          new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 2500))
        ]) as any;

        const aiResponse = completion.choices[0]?.message?.content;
        if (aiResponse) {
          const aiData = JSON.parse(aiResponse);
          
          aiAnalyzedRecommendations = aiData.recommendations
            .slice(0, 3)
            .map((rec: any) => {
              const article = similarArticles.find(a => a.id === rec.id);
              if (!article) return null;
              
              return {
                id: article.id,
                title: article.title || "مقال بدون عنوان",
                slug: article.slug || article.id,
                featured_image: article.featured_image,
                views: article.views || 0,
                readingTime: Math.max(1, Math.ceil((article.content?.length || 0) / 250)),
                confidence: Math.min(100, Math.max(60, rec.confidence)),
                reason: rec.reason || "مقال مقترح",
                category: article.categories?.name || "عام",
                published_at: article.published_at
              };
            })
            .filter(Boolean);
        }
      } catch (aiError) {
        console.error("AI Analysis failed:", aiError);
        // fallback إلى التوصيات التقليدية
      }
    }

    // إذا فشل AI أو لم يكن متوفراً، استخدم منطق بديل
    if (aiAnalyzedRecommendations.length === 0) {
      aiAnalyzedRecommendations = similarArticles.slice(0, 3).map((article, index) => {
        let confidence = 70;
        let reason = "مقال مقترح";

        // حساب الثقة بناءً على التشابه
        if (article.categories?.id === currentArticle.categories?.id) {
          confidence += 15;
          reason = "نفس التصنيف";
        }

        // إذا كان له مشاهدات عالية
        if (article.views && article.views > 5000) {
          confidence += 10;
          reason = reason === "نفس التصنيف" ? "مقال رائج في نفس التصنيف" : "مقال رائج";
        }

        // إذا كان حديث النشر
        if (article.published_at) {
          const daysDiff = Math.abs(new Date().getTime() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff <= 7) {
            confidence += 5;
          }
        }

        return {
          id: article.id,
          title: article.title || "مقال بدون عنوان",
          slug: article.slug || article.id,
          featured_image: article.featured_image,
          views: article.views || 0,
          readingTime: Math.max(1, Math.ceil((article.content?.length || 0) / 250)),
          confidence: Math.min(95, confidence),
          reason,
          category: article.categories?.name || "عام",
          published_at: article.published_at
        };
      });
    }

    const averageConfidence = Math.round(
      aiAnalyzedRecommendations.reduce((acc, article) => acc + article.confidence, 0) / 
      Math.max(1, aiAnalyzedRecommendations.length)
    );

    const payload = {
      recommendations: aiAnalyzedRecommendations,
      averageConfidence,
      totalArticles: similarArticles.length,
      method: process.env.OPENAI_API_KEY ? "ai-powered" : "rule-based"
    };

    // حفظ في كاش الذاكرة
    globalAny.__AI_RECS_CACHE__.set(cacheKey, { data: payload, ts: Date.now() });

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=1800');
    return res;

  } catch (error) {
    console.error("Error generating recommendations:", error);
    const res = NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
    res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
    return res;
  }
}
