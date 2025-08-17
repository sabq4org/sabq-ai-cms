/**
 * خدمة الذكاء الاصطناعي لتوليد المحتوى للمقالات
 * - توليد الملخصات التلقائية
 * - استخراج الاقتباسات الذكية
 * - حساب وقت القراءة
 * - تحليل المحتوى وتقييمه
 */

import OpenAI from 'openai';
import { getOpenAIKey } from '@/lib/openai-config';

// متغير لحفظ عميل OpenAI
let openaiClient: OpenAI | null = null;

// دالة للحصول على عميل OpenAI مع lazy loading
async function getOpenAIClient(): Promise<OpenAI> {
  if (!openaiClient) {
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
      throw new Error('مفتاح OpenAI غير متوفر');
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
}

interface ArticleContent {
  title: string;
  content: string;
}

interface AIGeneratedContent {
  summary: string;
  quotes: string[];
  readingTime: number;
  tags: string[];
  aiScore: number;
  title?: string;
  subtitle?: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * توليد ملخص تلقائي للمقال
 */
export async function generateArticleSummary(content: string, title: string): Promise<string> {
  try {
    const prompt = `
قم بكتابة ملخص موجز وواضح لهذا المقال الصحفي باللغة العربية:

العنوان: ${title}

المحتوى:
${content}

اكتب ملخصاً في 2-3 جمل يوضح الفكرة الرئيسية والنقاط المهمة، بأسلوب صحفي احترافي.
أعد الصياغة بصيغ متنوعة وتجنب تكرار نفس العبارات في كل محاولة.
`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "أنت محرر صحفي محترف متخصص في كتابة الملخصات الواضحة والموجزة باللغة العربية."
        },
        {
          role: "user",
          content: `${prompt}\n\nتعليمات إضافية: رقم محاولة التوليد: ${Math.floor(Math.random()*100000)}.`
        }
      ],
      max_tokens: 200,
      temperature: 0.85,
    });

    return response.choices[0]?.message?.content?.trim() || "";
    
  } catch (error) {
    console.error('خطأ في توليد الملخص:', error);
    return "";
  }
}

/**
 * استخراج الاقتباسات الذكية من المقال
 */
export async function extractSmartQuotes(content: string, title: string): Promise<string[]> {
  try {
    const prompt = `
استخرج 3-5 اقتباسات قوية ومؤثرة من هذا المقال الصحفي:

العنوان: ${title}

المحتوى:
${content}

شروط الاقتباسات:
1. كل اقتباس لا يتجاوز سطرين
2. يجب أن تكون الاقتباسات مؤثرة ومعبرة
3. تختصر الفكرة الرئيسية أو نقطة مهمة
4. مناسبة للمشاركة على وسائل التواصل

أرجع النتيجة كقائمة JSON فقط، مثال:
["الاقتباس الأول", "الاقتباس الثاني", "الاقتباس الثالث"]
`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "أنت خبير في استخراج الاقتباسات المؤثرة من النصوص العربية."
        },
        {
          role: "user",
          content: `${prompt}\n\nتعليمات إضافية: رقم محاولة التوليد: ${Math.floor(Math.random()*100000)}.`
        }
      ],
      max_tokens: 300,
      temperature: 0.9,
    });

    const result = response.choices[0]?.message?.content?.trim();
    
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        // إذا فشل JSON parsing، حاول استخراج الاقتباسات يدوياً
        const quotes = result.split('\n')
          .filter(line => line.trim().length > 10)
          .map(line => line.replace(/^["'\-\*\d\.]\s*/, '').replace(/["']$/, '').trim())
          .filter(quote => quote.length > 0 && quote.length < 200)
          .slice(0, 5);
        
        return quotes;
      }
    }
    
    return [];
    
  } catch (error) {
    console.error('خطأ في استخراج الاقتباسات:', error);
    return [];
  }
}

/**
 * توليد كلمات مفتاحية للمقال
 */
export async function generateArticleTags(content: string, title: string): Promise<string[]> {
  try {
    const prompt = `
استخرج 5-8 كلمات مفتاحية من هذا المقال:

العنوان: ${title}

المحتوى:
${content}

الكلمات المفتاحية يجب أن تكون:
1. متعلقة بالموضوع الرئيسي
2. مفيدة للبحث والتصنيف
3. باللغة العربية
4. كلمة أو كلمتين كحد أقصى

أرجع النتيجة كقائمة JSON فقط، مثال:
["السياسة", "الاقتصاد", "التكنولوجيا"]
`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "أنت خبير في تحليل النصوص واستخراج الكلمات المفتاحية."
        },
        {
          role: "user",
          content: `${prompt}\n\nتعليمات إضافية: أعد المحاولة بأسلوب مختلف، رقم المحاولة: ${Math.floor(Math.random()*100000)}.`
        }
      ],
      max_tokens: 150,
      temperature: 0.75,
    });

    const result = response.choices[0]?.message?.content?.trim();
    
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        const tags = result.split(/[,،\n]/)
          .map(tag => tag.replace(/^["'\-\*\d\.]\s*/, '').replace(/["']$/, '').trim())
          .filter(tag => tag.length > 0 && tag.length < 50)
          .slice(0, 8);
        
        return tags;
      }
    }
    
    return [];
    
  } catch (error) {
    console.error('خطأ في توليد الكلمات المفتاحية:', error);
    return [];
  }
}

/**
 * حساب وقت القراءة (بالدقائق)
 */
export function calculateReadingTime(content: string): number {
  // متوسط سرعة القراءة العربية: 200-250 كلمة في الدقيقة
  const wordsPerMinute = 225;
  
  // إزالة HTML tags وحساب الكلمات
  const cleanText = content.replace(/<[^>]*>/g, ' ');
  const wordCount = cleanText.trim().split(/\s+/).length;
  
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  
  // الحد الأدنى دقيقة واحدة
  return Math.max(1, readingTimeMinutes);
}

/**
 * حساب نقاط الجودة للمقال (AI Score)
 */
export async function calculateArticleAIScore(content: string, title: string): Promise<number> {
  try {
    // عوامل التقييم
    let score = 0;
    
    // طول المحتوى (0-20 نقطة)
    const wordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
    if (wordCount > 500) score += 20;
    else if (wordCount > 300) score += 15;
    else if (wordCount > 200) score += 10;
    else score += 5;
    
    // جودة العنوان (0-15 نقطة)
    if (title.length > 30 && title.length < 100) score += 15;
    else if (title.length > 20) score += 10;
    else score += 5;
    
    // تنوع المحتوى (0-20 نقطة)
    const paragraphs = content.split(/\n\s*\n/).length;
    if (paragraphs > 5) score += 20;
    else if (paragraphs > 3) score += 15;
    else score += 10;
    
    // استخدام الذكاء الاصطناعي للتقييم النوعي (0-45 نقطة)
    const prompt = `
قيّم جودة هذا المقال من 0 إلى 45 نقطة حسب المعايير التالية:
- وضوح الأفكار وتسلسلها (0-15)
- قوة الأسلوب واللغة (0-15) 
- القيمة المعلوماتية والفائدة (0-15)

العنوان: ${title}
المحتوى: ${content.substring(0, 1000)}...

أرجع رقماً فقط من 0 إلى 45.
`;

    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "أنت ناقد أدبي وصحفي متخصص في تقييم جودة المقالات."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const aiScore = parseInt(response.choices[0]?.message?.content?.trim() || "20");
    score += Math.min(45, Math.max(0, aiScore));
    
    // النتيجة النهائية من 100
    return Math.min(100, Math.max(0, score));
    
  } catch (error) {
    console.error('خطأ في حساب AI Score:', error);
    // إرجاع نقاط افتراضية معقولة
    return 75;
  }
}

/**
 * توليد عنوان للمقال
 */
export async function generateArticleTitle(content: string): Promise<string> {
  try {
    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "أنت محرر صحفي محترف متخصص في كتابة العناوين الجذابة والمختصرة."
        },
        {
          role: "user",
          content: `اكتب عنواناً جذاباً ومختصراً لهذا المقال (30-70 حرف):

${content.substring(0, 500)}...

العنوان يجب أن يكون:
- جذاب ومثير للاهتمام
- واضح ومباشر
- يلخص الفكرة الرئيسية
- بين 30-70 حرف

أعد العنوان فقط دون أي تفسير.`
        }
      ],
      max_tokens: 50,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error('خطأ في توليد العنوان:', error);
    return "";
  }
}

/**
 * توليد عنوان فرعي للمقال
 */
export async function generateArticleSubtitle(content: string, title: string): Promise<string> {
  try {
    const openai = await getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "أنت محرر صحفي محترف متخصص في كتابة العناوين الفرعية التوضيحية."
        },
        {
          role: "user",
          content: `اكتب عنواناً فرعياً توضيحياً لهذا المقال:

العنوان الرئيسي: ${title}
المحتوى: ${content.substring(0, 300)}...

العنوان الفرعي يجب أن:
- يضيف معلومات إضافية للعنوان الرئيسي
- يكون بين 50-100 حرف
- يوضح تفاصيل أكثر

أعد العنوان الفرعي فقط دون أي تفسير.`
        }
      ],
      max_tokens: 80,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error('خطأ في توليد العنوان الفرعي:', error);
    return "";
  }
}

/**
 * توليد جميع المحتويات الذكية للمقال
 */
export async function generateAllAIContent(article: ArticleContent): Promise<AIGeneratedContent> {
  try {
    console.log(`🤖 بدء توليد المحتوى الذكي للمقال`);
    
    // توليد العنوان أولاً إذا لم يكن موجوداً
    let title = article.title;
    if (!title || title === 'عنوان مؤقت') {
      title = await generateArticleTitle(article.content);
    }
    
    // تشغيل جميع العمليات بالتوازي لتحسين الأداء
    const [summary, quotes, tags, aiScore, subtitle] = await Promise.all([
      generateArticleSummary(article.content, title),
      extractSmartQuotes(article.content, title),
      generateArticleTags(article.content, title),
      calculateArticleAIScore(article.content, title),
      generateArticleSubtitle(article.content, title)
    ]);
    
    const readingTime = calculateReadingTime(article.content);
    
    console.log(`✅ تم توليد المحتوى الذكي بنجاح:
    - العنوان: ${title ? title.length + ' حرف' : 'لم يتم توليده'}
    - العنوان الفرعي: ${subtitle ? subtitle.length + ' حرف' : 'لم يتم توليده'}
    - الملخص: ${summary.length} حرف
    - الاقتباسات: ${quotes.length} اقتباس
    - الكلمات المفتاحية: ${tags.length} كلمة
    - وقت القراءة: ${readingTime} دقيقة
    - النقاط: ${aiScore}/100`);
    
    return {
      title: title !== article.title ? title : undefined,
      subtitle,
      summary,
      quotes,
      readingTime,
      tags,
      aiScore,
      seoTitle: title,
      seoDescription: summary
    };
    
  } catch (error) {
    console.error('❌ خطأ في توليد المحتوى الذكي:', error);
    
    // إرجاع قيم افتراضية في حالة الخطأ
    return {
      summary: `ملخص تلقائي: ${article.title}`,
      quotes: [],
      readingTime: calculateReadingTime(article.content),
      tags: [],
      aiScore: 50
    };
  }
}

/**
 * تحديث الاقتباسات في قاعدة البيانات
 */
export async function updateArticleQuotes(articleId: string, quotes: string[]) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    // حذف الاقتباسات القديمة
    await prisma.article_quotes.deleteMany({
      where: { article_id: articleId }
    });
    
    // إدراج الاقتباسات الجديدة
    if (quotes.length > 0) {
      await prisma.article_quotes.createMany({
        data: quotes.map((quote, index) => ({
          id: `quote_${Date.now()}_${index}`,
          article_id: articleId,
          quote_text: quote,
          quote_order: index + 1,
          ai_confidence: 0.9,
          is_featured: index === 0 // الاقتباس الأول مميز
        }))
      });
    }
    
    console.log(`✅ تم تحديث ${quotes.length} اقتباس للمقال ${articleId}`);
    
  } catch (error) {
    console.error('❌ خطأ في تحديث الاقتباسات:', error);
  } finally {
    await prisma.$disconnect();
  }
}