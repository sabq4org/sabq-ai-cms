import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { SABQ_NEWS_EDITOR_PROMPT } from "@/lib/ai/sabq-prompts-library";

// استخدام مفتاح OpenAI من متغيرات البيئة
const API_KEY = process.env.OPENAI_API_KEY || "";

// تحقق محسن من صحة المفتاح
const isValidKey = API_KEY && 
                  API_KEY !== 'sk-your-openai-api-key' && 
                  API_KEY.startsWith('sk-') && 
                  API_KEY.length > 40;

// ملاحظة: لو عندك طبقة خدمة، انقل المنطق هناك واستدعِها من هنا.
const openai = isValidKey ? new OpenAI({ apiKey: API_KEY }) : null;
const hasOpenAI = !!openai;

// قائمة بسيطة لتصفية الأفعال الممنوعة من keywords احتياطياً
const FORBIDDEN_VERBS = [
  "قال","يقول","ذكر","تذكر","يريد","أراد","صرّح","صرح","أوضح",
  "كشف","أكد","أفاد","أفادت","أعلنت","أعلن","أشارت","يشير","بحسب",
];

function clampSummary(summary: string) {
  // قصّ/تمديد موجز إلى 250–400 حرفاً تقريبياً بدون قطع كلمة
  const len = [...summary].length;
  if (len > 400) {
    let cut = 400;
    while (cut > 250 && summary[cut] && summary[cut] !== " ") cut--;
    return summary.slice(0, cut).trim();
  }
  if (len < 250) {
    return summary.trim();
  }
  return summary.trim();
}

function filterKeywords(keywords: string[]) {
  const set = new Set<string>();
  return keywords
    .map(k => k.trim())
    .filter(k => k.length > 1)
    .filter(k => !FORBIDDEN_VERBS.some(v => k === v || k.startsWith(v + " ")))
    .filter(k => {
      const lower = k.toLowerCase();
      if (set.has(lower)) return false;
      set.add(lower);
      return true;
    })
    .slice(0, 8);
}

function uniqBy<T>(arr: T[], key: (t: T) => string) {
  const m = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (!m.has(k)) {
      m.add(k);
      out.push(x);
    }
  }
  return out;
}

// الوظائف المحلية للتوليد الاحتياطي
function normalize(s: string) { return (s || '').replace(/\s+/g, ' ').trim(); }
function sentences(s: string) { return normalize(s).split(/[.!؟\n]+/).map(t => t.trim()).filter(t => t.length > 0); }
function clamp(s: string, max: number) { return (s.length > max ? s.slice(0, max).trim() : s.trim()); }
function extractEntities(text: string) {
  const patterns = [
    /\d+[\s\u200F]*(مليون|مليار|ألف|بالمئة|بالمائة|%)/g,
    /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g,
    /(?:الرئيس|الوزير|الأمير|الملك|الشيخ|الدكتور|المهندس|وزير|وزارة)\s+\S+/g,
    /(?:شركة|مؤسسة|هيئة|وزارة|جامعة|مدينة|قطاع|مشروع)\s+\S+/g,
    /المملكة|السعودية|رؤية\s+\d+/g,
  ];
  const found = new Set<string>();
  patterns.forEach(p => {
    const matches = text.match(p) || [];
    matches.forEach(m => {
      const cleaned = m.trim();
      if (cleaned.length > 2) found.add(cleaned);
    });
  });
  return Array.from(found);
}

// توليد بسيط للحالات الطارئة
function simpleGenerate(text: string) {
  try {
    // استخراج جمل ومعلومات مفيدة
    const sents = sentences(text);
    const entities = extractEntities(text);
    const words = text.match(/[\u0600-\u06FF]+/g)
      ?.filter(w => w.length > 3 && !FORBIDDEN_VERBS.some(v => w.includes(v)))
      .slice(0, 10) || ['أخبار'];
    
    const summary = text.substring(0, 400).trim() || 'موجز الخبر';
    
    // توليد عنوان ذكي بدلاً من نسخ الجملة الأولى كما هي
    let title = '';
    
    // البحث عن أرقام مهمة
    const numbers = text.match(/\d+\s*(مليون|مليار|ألف|%|وظيفة|ريال|مشروع|دولار)/);
    
    // البحث عن كيانات مهمة
    const importantEntities = entities.filter(e => 
      e.includes('وزارة') || e.includes('وزير') || e.includes('شركة') || 
      e.includes('جامعة') || e.includes('المملكة') || e.includes('مدينة') ||
      e.includes('رؤية') || e.includes('هيئة') || e.includes('اقتصاد') ||
      e.includes('الرئيس') || e.includes('الملك') || e.includes('الأمير')
    );
    
    // البحث عن كلمات قوية
    const strongWords = words.filter(w => 
      w === 'تطوير' || w === 'إطلاق' || w === 'تقدم' || w === 'تحقيق' || 
      w === 'إنجاز' || w === 'مشروع' || w === 'استثمار' || w === 'تمويل' ||
      w === 'توقيع' || w === 'اتفاقية' || w === 'شراكة'
    );
    
    // اختر نمط عنوان ذكي (4 أنماط مختلفة)
    // نختار نمطاً عشوائياً لتنويع العناوين
    const pattern = Math.floor(Math.random() * 4);
    
    if (numbers && numbers[0]) {
      // نمط 1: عنوان بالأرقام
      const subject = strongWords[0] || words.find(w => w.length > 3) || 'مشروع';
      if (importantEntities.length > 0) {
        title = `${numbers[0]} ${subject} ${importantEntities[0]}`;
      } else {
        title = `${numbers[0]} ${subject} في تطور جديد`;
      }
    } 
    else if (importantEntities.length > 0 && pattern <= 2) {
      // نمط 2: عنوان بالكيانات
      const actions = ['تطلق', 'تعلن عن', 'تستعرض', 'تدشن', 'تستثمر في'];
      const action = strongWords[0] || actions[Math.floor(Math.random() * actions.length)];
      const objects = ['مبادرة جديدة', 'مشروعاً استراتيجياً', 'خطة تطويرية', 'استثمارات نوعية'];
      const object = words.find(w => !importantEntities[0].includes(w) && w.length > 3) || objects[Math.floor(Math.random() * objects.length)];
      title = `${importantEntities[0]} ${action} ${object}`;
    }
    else if (strongWords.length > 0 && pattern === 3) {
      // نمط 3: عنوان يبدأ بكلمة قوية
      const prefixes = ['تطوير:', 'عاجل:', 'تقدم:', 'إنجاز:'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const mainSubject = words.filter(w => w.length > 3)[0] || 'مشروع';
      if (importantEntities.length > 0) {
        title = `${prefix} ${mainSubject} ${importantEntities[0]}`;
      } else {
        title = `${prefix} ${mainSubject} جديد يحقق نتائج إيجابية`;
      }
    }
    else if (sents.length > 0) {
      // عنوان من أول جملة مع تحسينات
      let firstSent = sents[0]?.trim() || 'خبر جديد';
      
      // إزالة أي أفعال تقريرية من بداية العنوان
      firstSent = firstSent.replace(/^(قال|أكد|صرح|يقول|ذكر|أوضح|أشار|أعلن|أفاد)[^.]*?[:]?\s*/i, '');
      
      // تقصير إلى 60 حرف كحد أقصى
      title = firstSent.substring(0, 60).trim();
      
      // إضافة بداية قوية إذا كان العنوان لا يزال طويلاً
      if (title.length > 40) {
        const mainTopic = words.filter(w => w.length > 3)[0] || 'تطوير';
        title = `عاجل: ${mainTopic} ${importantEntities[0] || 'في تطور جديد'}`;
      }
    } 
    else {
      title = 'خبر عاجل: تطورات جديدة';
    }
    
    // توليد عنوان فرعي ذكي
    let subtitle = '';
    if (sents.length > 1) {
      // استخدام الجملة الثانية مع تحسينات
      subtitle = sents[1].trim().substring(0, 80);
    } else if (importantEntities.length > 1) {
      subtitle = `${importantEntities[1]} في إطار ${words.find(w => w.length > 4) || 'التطوير'}`;
    } else {
      subtitle = `تفاصيل مهمة حول ${words.find(w => w.length > 3) || 'الموضوع'}`;
    }
    
    // الكلمات المفتاحية والوسوم
    const cleanKeywords = [...entities, ...words.slice(0, 10)]
      .filter((v, i, a) => a.indexOf(v) === i && !FORBIDDEN_VERBS.some(verb => v.includes(verb)));
    
    // عنوان SEO محسن
    const seoTitle = `${title.substring(0, 50)} | ${cleanKeywords[0] || 'آخر الأخبار'}`;
    
    return {
      title,
      subtitle,
      smart_summary: summary,
      keywords: cleanKeywords.slice(0, 10),
      slug: 'news-' + Date.now(),
      seo_title: seoTitle,
      meta_description: summary.substring(0, 160),
      tags: cleanKeywords.slice(0, 5),
    };
  } catch (error) {
    console.error("⚠️ فشل التوليد البسيط:", error);
    return {
      title: 'عاجل: تطورات مهمة في القطاع',
      subtitle: 'تفاصيل جديدة تكشف عن أحدث المستجدات',
      smart_summary: 'موجز الخبر يحتوي على أهم المعلومات والتفاصيل المتعلقة بالموضوع.',
      keywords: ['أخبار', 'تطورات', 'جديد', 'عاجل', 'مهم'],
      slug: 'khabar-jadid',
      seo_title: 'عاجل: تطورات مهمة في القطاع | آخر المستجدات',
      meta_description: 'اقرأ آخر الأخبار والتطورات الجديدة في هذا الموضوع المهم',
      tags: ['عاجل', 'جديد', 'تطورات', 'مهم', 'حصري']
    };
  }
}

export async function POST(req: NextRequest) {
  let raw_content = '';
  let title_hint = '';
  let category = '';
  let entities: any[] = [];
  let published_at = new Date().toISOString();

  try {
    const body = await req.json();
    ({ title_hint = '', raw_content = '', category = '', entities = [], published_at = published_at } = body);
    
    console.log("📥 smart-editor received:", { 
      title_hint: title_hint?.substring(0, 50), 
      content_length: raw_content?.length,
      category,
      has_openai: hasOpenAI 
    });

    if (!raw_content || (typeof raw_content === 'string' && raw_content.trim().length < 30)) {
      return NextResponse.json({ error: 'المحتوى قصير جداً' }, { status: 400 });
    }

    // استخدام البرومبت الموحد من المكتبة
    const DEFAULT_EDITOR_PROMPT = SABQ_NEWS_EDITOR_PROMPT.systemPrompt;

    async function loadAISettings() {
      try {
        const row = await prisma.site_settings.findFirst({ where: { section: 'ai' } });
        const data: any = row?.data || {};
        const aiPrompt: string = (data.default_generation_prompt || '').toString().trim();
        const aiTemp: number = typeof data.default_temperature === 'number' ? data.default_temperature : SABQ_NEWS_EDITOR_PROMPT.settings.temperature;
        return { aiPrompt: aiPrompt || DEFAULT_EDITOR_PROMPT, aiTemp };
      } catch {
        return { aiPrompt: DEFAULT_EDITOR_PROMPT, aiTemp: SABQ_NEWS_EDITOR_PROMPT.settings.temperature };
      }
    }

    const { aiPrompt, aiTemp } = await loadAISettings();

    // استخدام البرومبت الموحد
    const prompt = SABQ_NEWS_EDITOR_PROMPT.userPromptTemplate(
      raw_content,
      title_hint,
      category
    );

    console.log("🚀 بدء استدعاء OpenAI API...");

    try {
      // التحقق من وجود OpenAI client صحيح
      if (!openai) {
        console.warn("⚠️ مفتاح OpenAI غير صحيح، استخدام التوليد البسيط");
        throw new Error("OpenAI client غير متاح");
      }

      // تعديل البرومبت لتحسينه وكسر الكاش
      const enhancedPrompt = `${prompt}\n\n<!-- session: ${Date.now()} -->`;
      
      // n=3 للحصول على 3 مقترحات متنوعة بضغطة واحدة
      const completion = await openai.chat.completions.create({
        model: "gpt-4",             // أو GPT-4o/أحدث نموذج نصي عندك
        n: 3,
        messages: [
          { role: "system", content: aiPrompt },
          { role: "user", content: enhancedPrompt }
        ],
        temperature: Math.max(0.7, Math.min(aiTemp, 0.95)),          // التنويع
        top_p: 0.9,
        presence_penalty: 0.7,      // يمنع إعادة نفس التراكيب
        frequency_penalty: 0.4,     // يقلل التكرار اللفظي
      });

      console.log("✅ تم استلام نتائج OpenAI:", { choices: completion.choices.length });

      // تحويل الـ choices إلى JSON صالح + تطبيق قيود إضافية عندنا
      const drafts = completion.choices
        .map(c => {
          try {
            const text = (c.message?.content || "").trim();
            const jsonStart = text.indexOf("{");
            const jsonEnd = text.lastIndexOf("}");
            const json = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
            
            // تصفية وتلميع
            json.smart_summary = clampSummary(json.smart_summary || "");
            json.keywords = filterKeywords(Array.isArray(json.keywords) ? json.keywords : []);
            
            // ضبط طول الميتا
            if (typeof json.meta_description === "string" && json.meta_description.length > 160) {
              json.meta_description = json.meta_description.slice(0, 160).trim();
            }
            if (typeof json.seo_title === "string" && json.seo_title.length > 60) {
              json.seo_title = json.seo_title.slice(0, 60).trim();
            }
            
            return json;
          } catch (error) {
            console.warn("❌ خطأ في تحليل JSON:", error);
            return null;
          }
        })
        .filter(Boolean) as any[];

      if (drafts.length === 0) {
        console.warn("⚠️ لم يتم الحصول على مقترحات صالحة من OpenAI، استخدام التوليد البسيط");
        throw new Error("لم يتم الحصول على مقترحات صالحة");
      }

      // إزالة المقترحات المتشابهة جداً بحسب العنوان
      const uniqueDrafts = uniqBy(drafts, d => (d.title || "").trim());
      
      console.log("✅ النتيجة النهائية:", { count: uniqueDrafts.length });

      return NextResponse.json({
        count: uniqueDrafts.length,
        variants: uniqueDrafts,
        source: "openai",
        using_key: hasOpenAI ? "✓" : "✗",
        model: "gpt-4",
        time: new Date().toISOString()
      });

    } catch (apiError) {
      console.error("❌ خطأ في استدعاء OpenAI:", apiError);
      
      // استخدام التوليد البسيط عند فشل الطلب
      console.log("🔄 استخدام التوليد البسيط...");
      const fallbackVariant = simpleGenerate(raw_content);
      
      return NextResponse.json({
        count: 1,
        variants: [fallbackVariant],
        source: "simple-fallback"
      });
    }

  } catch (error: any) {
    console.error('❌ خطأ عام في smart-editor:', error);
    console.log('📊 تفاصيل الخطأ:', {
      message: error.message,
      stack: error.stack?.split('\n')[0],
      hasContent: !!raw_content,
      contentLength: raw_content?.length
    });
    
    // عودة بنتائج طارئة عند أي خطأ
    try {
      console.log("🔄 محاولة توليد بسيط في حالة الخطأ...");
      const variant = simpleGenerate(raw_content);
      return NextResponse.json({ count: 1, variants: [variant], error: true }, { status: 200 });
    } catch (fallbackError: any) {
      console.error("❌ فشل حتى التوليد البسيط:", fallbackError.message);
      
      // آخر محاولة - قيم ثابتة
      const variant = {
        title: 'خبر جديد',
        subtitle: 'تفاصيل الخبر',
        smart_summary: 'موجز الخبر يحتوي على أهم المعلومات والتفاصيل المتعلقة بالموضوع. يتضمن الخبر معلومات مهمة وتطورات جديدة في المجال المعني.',
        keywords: ['أخبار', 'تطورات', 'جديد'],
        slug: 'khabar-jadid',
        seo_title: 'خبر جديد - آخر التطورات',
        meta_description: 'اقرأ آخر الأخبار والتطورات الجديدة في هذا الموضوع المهم',
        tags: ['عاجل', 'جديد', 'تطورات']
      };
      return NextResponse.json({ count: 1, variants: [variant], error: true, fallback: true }, { status: 200 });
    }
  }
}