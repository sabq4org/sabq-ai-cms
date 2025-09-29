import { NextRequest, NextResponse } from 'next/server';
import { generateDeepAnalysis, initializeOpenAI } from '@/lib/services/deepAnalysisService';
import { GenerateAnalysisRequest } from '@/types/deep-analysis';
import { getOpenAIKey } from '@/lib/openai-config';
import prisma from '@/lib/prisma';











export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Deep Analysis Generation Request:', {
      prompt: body.prompt,
      title: body.title,
      creationType: body.creationType,
      categories: body.categories
    });
    
    // التحقق من وجود النص المكتوب من المستخدم
    if (!body.prompt || body.prompt.trim() === '') {
      return NextResponse.json(
        { 
          error: 'يرجى كتابة وصف للمحتوى المطلوب في حقل "وصف المحتوى المطلوب من GPT"',
          details: 'لم يتم العثور على نص في الطلب'
        },
        { status: 400 }
      );
    }
    
    // الحصول على مفتاح OpenAI من المصدر الموحد
    const apiKey = await getOpenAIKey();
    
    // التحقق من وجود API key
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        { 
          error: 'يرجى إضافة مفتاح OpenAI من إعدادات الذكاء الاصطناعي',
          details: 'لم يتم العثور على مفتاح API في قاعدة البيانات أو متغيرات البيئة'
        },
        { status: 401 }
      );
    }
    
    // تهيئة OpenAI
    initializeOpenAI(apiKey);
    
    // فرض الوضع السريع دائماً لتجنب timeout
    const fast = true; // مؤقتاً: فرض الوضع السريع دائماً

    // تحضير طلب التوليد - التركيز على النص المكتوب من المستخدم
    const generateRequest: GenerateAnalysisRequest = {
      sourceType: body.creationType === 'from_article' ? 'article' : 
                  body.creationType === 'external_link' ? 'external' : 'topic',
      topic: body.title || 'تحليل عميق', // عنوان عام فقط
      category: body.categories?.[0],
      // هذا هو الأهم: النص الفعلي المكتوب من المستخدم
      customPrompt: body.prompt, // هنا يجب أن يكون النص الأساسي للتحليل
      language: 'ar',
      tone: 'professional',
      length: fast ? 'short' : 'medium', // تعديل الطول لتجنب الخروج عن الموضوع
      externalUrl: body.externalLink,
      sourceId: body.sourceArticleId || body.articleUrl
    };

    // إذا كان المصدر مقالة وتم تمرير معرف/سلاج، نجلب محتوى المقال لإعطائه للنموذج
    if (generateRequest.sourceType === 'article' && generateRequest.sourceId) {
      try {
        const article = await prisma.articles.findFirst({
          where: {
            OR: [
              { id: generateRequest.sourceId },
              { slug: generateRequest.sourceId }
            ]
          },
          select: { title: true, content: true, excerpt: true, published_at: true }
        });
        if (article) {
          const plain = typeof article.content === 'string' ? article.content : JSON.stringify(article.content);
          generateRequest.sourceId = `${article.title || ''}\n\n${plain}`.slice(0, 8000); // حدد الحد لتقليل زمن الاستجابة
        }
      } catch (e) {
        console.warn('⚠️ تعذر جلب محتوى المقال للمصدر التحليلي:', (e as any)?.message);
      }
    }

    // توليد التحليل مع timeout صارم 25 ثانية
    const generatePromise = generateDeepAnalysis(generateRequest, { fast });
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Generation timeout')), 25000)
    );
    
    let result;
    try {
      result = await Promise.race([generatePromise, timeoutPromise]);
    } catch (timeoutError) {
      console.error('⏱️ Timeout reached, returning partial result');
      // إرجاع نتيجة افتراضية في حالة التايم آوت
      return NextResponse.json({
        title: body.title || 'تحليل عميق',
        summary: 'تم إنشاء هذا التحليل بواسطة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى للحصول على تحليل أكثر تفصيلاً.',
        content: '<h2>مقدمة</h2><p>حدث تأخير في توليد التحليل الكامل. يرجى المحاولة مرة أخرى أو تقليل حجم المحتوى المطلوب.</p>',
        tags: [],
        categories: body.categories || [],
        qualityScore: 50,
        readingTime: 2
      });
    }

    if (result.success && result.analysis) {
      // تحويل محتوى JSON إلى HTML منسق لمحرر Tiptap
      const formattedContent = formatAnalysisContent(result.analysis.content);
      
      // تسجيل معلومات التشخيص
      console.log('Analysis quality score:', result.analysis.qualityScore);
      console.log('Analysis content sections:', result.analysis.content?.sections?.length);
      
      return NextResponse.json({
        title: result.analysis.title,
        summary: result.analysis.summary,
        content: formattedContent, // إرسال النص المنسق مباشرة
        rawContent: result.analysis.content, // الاحتفاظ بالمحتوى الخام إذا احتجناه
        tags: extractTagsFromContent(result.analysis.content),
        categories: body.categories || [body.category].filter(Boolean),
        qualityScore: Math.round(result.analysis.qualityScore || 0),
        readingTime: result.analysis.estimatedReadingTime
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'فشل في توليد التحليل' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error generating analysis:', error);
    
    // معالجة أخطاء OpenAI المحددة
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'مفتاح OpenAI API غير صحيح. يرجى التحقق من المفتاح في الإعدادات.' },
          { status: 401 }
        );
      }
      if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// دالة تحويل محتوى JSON إلى HTML منسق لمحرر Tiptap
function formatAnalysisContent(content: any): string {
  if (!content || typeof content !== 'object') {
    return typeof content === 'string' ? content : '';
  }

  const parts: string[] = [];

  // الفهرس
  if (Array.isArray(content.tableOfContents) && content.tableOfContents.length) {
    parts.push('<h2>الفهرس</h2>');
    parts.push('<ul>');
    content.tableOfContents.forEach((item: any) => {
      // التحقق من نوع العنصر وتحويله إلى نص
      const title = typeof item === 'string' ? item : 
                   (item.title || item.name || item.text || 'قسم');
      parts.push(`<li>${title}</li>`);
    });
    parts.push('</ul>');
  }

  // الأقسام الرئيسية
  if (Array.isArray(content.sections)) {
    content.sections.forEach((section: any) => {
      if (section.title) {
        parts.push(`<h2>${section.title}</h2>`);
      }
      if (section.content) {
        // تقسيم المحتوى إلى فقرات
        const paragraphs = section.content.split('\n\n').filter((p: string) => p.trim());
        paragraphs.forEach((paragraph: string) => {
          // التحقق من القوائم
          if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
            const items = paragraph.split('\n').filter((item: string) => item.trim());
            parts.push('<ul>');
            items.forEach((item: string) => {
              const cleanItem = item.replace(/^[-•]\s*/, '');
              parts.push(`<li>${cleanItem}</li>`);
            });
            parts.push('</ul>');
          } else if (paragraph.trim().match(/^\d+\.\s/)) {
            // قوائم مرقمة
            const items = paragraph.split('\n').filter((item: string) => item.trim());
            parts.push('<ol>');
            items.forEach((item: string) => {
              const cleanItem = item.replace(/^\d+\.\s*/, '');
              parts.push(`<li>${cleanItem}</li>`);
            });
            parts.push('</ol>');
          } else {
            // فقرة عادية
            parts.push(`<p>${paragraph}</p>`);
          }
        });
      }
      
      // نقاط فرعية إن وجدت
      if (Array.isArray(section.points)) {
        parts.push('<ul>');
        section.points.forEach((point: string) => {
          parts.push(`<li>${point}</li>`);
        });
        parts.push('</ul>');
      }
    });
  }

  // الرؤى الرئيسية
  if (Array.isArray(content.keyInsights) && content.keyInsights.length) {
    parts.push('<h2>أبرز الرؤى</h2>');
    parts.push('<ul>');
    content.keyInsights.forEach((insight: string) => {
      parts.push(`<li>${insight}</li>`);
    });
    parts.push('</ul>');
  }

  // التوصيات
  if (Array.isArray(content.recommendations) && content.recommendations.length) {
    parts.push('<h2>التوصيات</h2>');
    parts.push('<ul>');
    content.recommendations.forEach((rec: string) => {
      parts.push(`<li>${rec}</li>`);
    });
    parts.push('</ul>');
  }

  // نقاط البيانات
  if (Array.isArray(content.dataPoints) && content.dataPoints.length) {
    parts.push('<h2>نقاط البيانات</h2>');
    parts.push('<ul>');
    content.dataPoints.forEach((dp: any) => {
      if (dp.label && dp.value) {
        parts.push(`<li><strong>${dp.label}:</strong> ${dp.value}</li>`);
      } else if (typeof dp === 'string') {
        parts.push(`<li>${dp}</li>`);
      }
    });
    parts.push('</ul>');
  }

  // الخاتمة إن وجدت
  if (content.conclusion) {
    parts.push('<h2>الخاتمة</h2>');
    const conclusionParagraphs = content.conclusion.split('\n\n').filter((p: string) => p.trim());
    conclusionParagraphs.forEach((paragraph: string) => {
      parts.push(`<p>${paragraph}</p>`);
    });
  }

  return parts.join('\n');
}

// استخراج الوسوم من المحتوى
function extractTagsFromContent(content: any): string[] {
  const tags: string[] = [];
  
  // استخراج الكلمات المفتاحية من الأقسام
  if (content.sections) {
    content.sections.forEach((section: any) => {
      // استخراج كلمات مهمة من العناوين
      const titleWords = section.title.split(' ')
        .filter((word: string) => word.length > 3)
        .slice(0, 2);
      tags.push(...titleWords);
    });
  }
  
  // استخراج من التوصيات
  if (content.recommendations) {
    tags.push(...content.recommendations
      .map((rec: string) => rec.split(' ')[0])
      .filter((word: string) => word.length > 3)
      .slice(0, 3)
    );
  }
  
  // إزالة التكرارات
  return [...new Set(tags)].slice(0, 10);
} 