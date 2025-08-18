import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ملاحظة: لو عندك طبقة خدمة، انقل المنطق هناك واستدعِها من هنا.
const API_KEY = process.env.OPENAI_API_KEY;
const hasOpenAI = !!(API_KEY && API_KEY.length > 10);
const openai = hasOpenAI ? new OpenAI({ apiKey: API_KEY! }) : null as any;

// قائمة بسيطة لتصفية الأفعال الممنوعة من keywords احتياطياً
const FORBIDDEN_VERBS = [
  'قال','يقول','ذكر','تذكر','يريد','أراد','صرّح','صرح','أوضح',
  'كشف','أكد','أفاد','أفادت','أعلنت','أعلن','أشارت','يشير','بحسب',
];

function clampSummary(summary: string) {
  // قصّ/تمديد موجز إلى 380–420 حرفاً تقريبياً بدون قطع كلمة
  const len = [...summary].length;
  if (len > 420) {
    // اقصص عند أقرب مسافة قبل 420
    let cut = 420;
    while (cut > 380 && summary[cut] && summary[cut] !== ' ') cut--;
    return summary.slice(0, cut).trim();
  }
  if (len < 380) {
    // ما نمدد مصطنعاً هنا؛ نترك الموديل يلتزم. مجرد إعادة.
    return summary.trim();
  }
  return summary.trim();
}

function filterKeywords(keywords: string[]) {
  const set = new Set<string>();
  return keywords
    .map(k => k.trim())
    .filter(k => k.length > 1)
    .filter(k => !FORBIDDEN_VERBS.some(v => k === v || k.startsWith(v + ' ')))
    .filter(k => {
      const lower = k.toLowerCase();
      if (set.has(lower)) return false;
      set.add(lower);
      return true;
    })
    .slice(0, 10);
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title_hint = '', raw_content = '', category = '', entities = [], published_at = '' } = body;

    if (!raw_content || (typeof raw_content === 'string' && raw_content.trim().length < 30)) {
      return NextResponse.json({ error: 'المحتوى قصير جداً' }, { status: 400 });
    }

    // دوال مساعدة للتوليد المحلي الذكي عند غياب OpenAI
    const normalize = (s: string) => (s || '').replace(/\s+/g, ' ').trim();
    const sentences = (s: string) => normalize(s).split(/[.!؟\n]+/).map(t => t.trim()).filter(t => t.length > 0);
    const clamp = (s: string, max: number) => (s.length > max ? s.slice(0, max).trim() : s.trim());
    const stripStart = (s: string) => s.replace(/^(في|من|على|إلى|مع|عن|حول|ضد|بعد|قبل|أثناء|خلال)\s+/i, '').trim();
    const AR_STOP = new Set(['في','من','إلى','على','و','ثم','أو','بل','لكن','كما','عن','مع','قد','قد','هذا','هذه','ذلك','تلك','التي','الذي','الذين','اللاتي','اللواتي','هناك','هنا','كان','كانت','يكون','تم','قد','قد','ما','لم','لن','إن','أن','أو']);
    const tokenize = (s: string) => s
      .replace(/[^\u0600-\u06FFA-Za-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 1 && !AR_STOP.has(w));
    const freqKeywords = (s: string, minLen = 3) => {
      const f: Record<string, number> = {};
      for (const w of tokenize(s)) {
        if (w.length < minLen) continue;
        f[w] = (f[w] || 0) + 1;
      }
      return Object.entries(f).sort((a,b) => b[1]-a[1]).map(([w]) => w);
    };
    const buildLocalTitle = (text: string, hint: string) => {
      const sents = sentences(text);
      let title = stripStart(sents[0] || hint || '');
      if (title.length === 0) title = 'تقرير إخباري';
      return clamp(title, 70);
    };
    const buildLocalSummary = (text: string) => {
      const sents = sentences(text);
      let acc = '';
      for (const s of sents) {
        if ((acc + ' ' + s).length <= 420) acc = (acc ? acc + ' ' : '') + s;
        if (acc.length >= 380) break;
      }
      if (acc.length < 380) acc = clamp(text, 420);
      if (acc.length > 420) acc = clamp(acc, 420);
      return acc;
    };
    const buildLocalKeywords = (text: string) => {
      const base = filterKeywords(freqKeywords(text).slice(0, 12));
      return base.slice(0, 10);
    };
    const buildLocalTags = (kws: string[]) => kws.slice(0, Math.min(8, Math.max(5, kws.length)));
    const buildLocalSeoTitle = (title: string) => clamp(title, 60);
    const buildLocalMeta = (summary: string) => clamp(summary, 160);
    const buildLocalSlug = (title: string) => normalize(title)
      .replace(/["'`،,؛:]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const buildLocalVariant = () => {
      const title = buildLocalTitle(raw_content, title_hint);
      const smart_summary = buildLocalSummary(raw_content);
      const keywords = buildLocalKeywords(raw_content);
      const tags = buildLocalTags(keywords);
      return {
        title,
        smart_summary,
        keywords,
        slug: buildLocalSlug(title),
        seo_title: buildLocalSeoTitle(title !== title_hint ? title : `${title}`),
        meta_description: buildLocalMeta(smart_summary),
        tags,
      } as any;
    };

    // في حال عدم توفر OpenAI، أعد مخرجات محلية ذكية
    if (!hasOpenAI) {
      const variant = buildLocalVariant();
      return NextResponse.json({ count: 1, variants: [variant], local: true });
    }

    const prompt = `
أنت محرر أخبار عربي محترف داخل نظام إدارة محتوى صحفي. مطلوب إخراج منظّم بصيغة JSON فقط دون أي شرح إضافي.

قيود صارمة:
- العنوان على نمط "ثريد": جملة قصيرة مكثّفة بالمعلومة، بلا نقطتين، بلا فواصل متتابعة، بلا علامات تعجب متكررة.
- العنوان غني بالكلمات المفتاحية الجوهرية للخبر، ويمنع استخدام أفعال تقريرية مثل: قال، يريد، صرّح، أكد، كشف، ذكرت، أفادت، أو مرادفاتها.
- استخدم لغة عربية فصحى سهلة وسليمة.
- الموجز الذكي يجب أن يكون بين 380 و420 حرفاً (وليس كلمة). إذا تعدّى 420 فاختصره بدون فقدان المعلومة.
- الكلمات المفتاحية: أسماء كيانات، مواقع، مواضيع، مصطلحات بحثية؛ يمنع الأفعال. 5–10 كلمات/عبارات كحد أقصى.
- امنع التكرار داخل العنوان والكلمات المفتاحية والموجز.
- لا تستخدم إيموجي أو رموز ASCII.
- أعد صياغة أي نص وارد بحيث لا ينتج خروجاً مطابقاً لمحاولات سابقة.

مدخلات الخبر:
- العنوان المقترح (اختياري): ${title_hint}
- النص الخام/ملخص المادة: ${raw_content}
- التصنيف/القسم: ${category}
- الكيانات المعروفة (اختياري): ${JSON.stringify(entities)}
- تاريخ النشر (ISO): ${published_at}

مهمة الإخراج:
أنتج مقترحاً واحداً وفق الصيغة التالية (JSON فقط):
{
  "title": "<عنوان ثريد قصير غني بالمعلومة والكلمات المفتاحية، بلا أفعال تقريرية>",
  "smart_summary": "<موجز ذكي 380-420 حرفاً يقدّم أهم النقاط والسياق والأثر>",
  "keywords": ["<كلمة/عبارة>", "..."],  // 5-10 عناصر، أسماء وكيانات وموضوعات فقط
  "slug": "<سلاق عربي-لاتيني قصير مبني على العنوان>",
  "seo_title": "<عنوان SEO ≤ 60 حرفاً، غير مطابق تماماً للعنوان، ويحتوي كلمتين مفتاحيتين>",
  "meta_description": "<وصف ميتا ≤ 160 حرفاً، مكثّف ومغري للنقر>",
  "tags": ["<وسم>", "..."]  // 5-8 وسوم مشتقة من الموضوع والكيانات
}

تعليمات التنويع القوية:
- ابتعد عن التركيبات الشائعة والمكررة.
- غيّر البناء اللغوي في كل مرة رغم ثبات الحقائق.
- قدّم زاوية مختلفة: سبب/أثر/خلفية/أرقام/مقارنة/سياق إقليمي.
- إذا كانت هناك أرقام أو تواريخ، أدخلها في العنوان عند ملاءمتها.

التدقيق قبل الإخراج:
- احسب طول "smart_summary" بالحروف العربية واللاتينية. إن كان <380 زد التفصيل، وإن كان >420 فاختصره.
- تأكد أن "keywords" لا تتضمن أفعالاً من القائمة الممنوعة.
- لا تطبع أي نص خارج JSON. لا تعليقات. لا أسطر زائدة بعد القوس الأخير.
`.trim();

    // n=3 للحصول على 3 مقترحات متنوعة بضغطة واحدة
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // أو GPT-4o/أحدث نموذج نصي
      n: 3,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.92, // التنويع
      top_p: 0.9,
      presence_penalty: 0.7, // يمنع إعادة نفس التراكيب
      frequency_penalty: 0.4, // يقلل التكرار اللفظي
    });

    // تحويل الـ choices إلى JSON صالح + تطبيق قيود إضافية عندنا
    const drafts = completion.choices
      .map((c) => {
        try {
          const text = (c.message?.content || '').trim();
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}');
          const json = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
          // تصفية وتلميع
          json.smart_summary = clampSummary(json.smart_summary || '');
          json.keywords = filterKeywords(Array.isArray(json.keywords) ? json.keywords : []);
          // ضبط طول الميتا
          if (typeof json.meta_description === 'string' && json.meta_description.length > 160) {
            json.meta_description = json.meta_description.slice(0, 160).trim();
          }
          if (typeof json.seo_title === 'string' && json.seo_title.length > 60) {
            json.seo_title = json.seo_title.slice(0, 60).trim();
          }
          return json;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as any[];

    // إزالة المقترحات المتشابهة جداً بحسب العنوان
    const uniqueDrafts = uniqBy(drafts, (d: any) => (d.title || '').trim());

    // إن فشل النموذج بإرجاع JSON صالح، ضمن نتيجة واحدة على الأقل محلياً
    const variants = uniqueDrafts.length > 0 ? uniqueDrafts : [buildLocalVariant()];
    return NextResponse.json({ count: variants.length, variants });
  } catch (error: any) {
    console.error('❌ خطأ في smart-editor:', error);
    // عودة محلية ذكية عند أي خطأ
    const variant = {
      title: 'تقرير إخباري',
      smart_summary: 'ملخص موجز للمحتوى قيد المعالجة.',
      keywords: [],
      slug: 'taqrir-ikhbari',
      seo_title: 'تقرير إخباري',
      meta_description: 'ملخص موجز للمحتوى',
      tags: []
    };
    return NextResponse.json({ count: 1, variants: [variant], error: true }, { status: 200 });
  }
}