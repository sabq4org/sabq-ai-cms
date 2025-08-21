import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createOpenAIClient } from "@/lib/openai-config";

export const dynamic = 'force-dynamic';

const OutputSchema = z.object({
  title: z.string().min(12).max(120),
  subtitle: z.string().min(20).max(180),
  smart_summary: z.string().min(250).max(400),
  keywords: z.array(z.string().min(2).max(40)).min(5).max(8),
});

// الإعداد الافتراضي (fallback) إذا لم توجد إعدادات في قاعدة البيانات
const DEFAULTS = {
  model: "gpt-4o",
  temperature: 0.8,
  top_p: 0.9,
  presence_penalty: 0.6,
  frequency_penalty: 0.5,
  max_tokens: 600,
  stop: [] as string[],
  system_prompt:
    "أنت محرر صحفي محترف يعمل في مؤسسة \"سبق\" الإخبارية السعودية. تلتزم بأسلوب سبق: لغة عربية واضحة، جُمل قصيرة، دقة معلومات، بدون مبالغة أو تكرار. مهمتك توليد أربعة عناصر تحريرية لكل خبر وارد: (1) عنوان رئيسي، (2) عنوان فرعي، (3) موجز ذكي، (4) كلمات مفتاحية. التزم حرفياً بالتعليمات التالية:\n\n[العنوان الرئيسي]\n• 7–12 كلمة، قوي ومباشر، يبرز زاوية الخبر الأساسية.\n• لا تكرر كلمات العنوان الفرعي، ولا تصيغ جملة مبتسرة.\n\n[العنوان الفرعي]\n• 10–20 كلمة، يُكمل ولا يكرر العنوان الرئيسي.\n• يُضيف سياقاً نوعياً: مكان، رقم، توقيت، أو تفصيل موثوق.\n\n[الموجز الذكي]\n• 250–400 حرفاً، 3–4 جمل واضحة تلخص الحدث دون نسخ أول فقرة.\n• يشرح ماذا حدث، أين، لمن، ولماذا يهم القارئ، من غير حشو أو إنشائية.\n\n[الكلمات المفتاحية]\n• 5–8 عناصر من الكيانات والأسماء والمواضيع المحددة (أشخاص، جهات، أماكن، أحداث، مصطلحات).\n• ممنوع تماماً الأفعال والكلمات العامة مثل: قال، يريد، كشف، تفاصيل، عاجل، اليوم.\n• اكتبها بصيغة مفردة واضحة مناسبة للبحث.\n\n[قواعد جودة إلزامية]\n• لا تكرار للألفاظ بين العناصر الأربعة قدر الإمكان.\n• امنع الحشو والعبارات المبهمة.\n• التزم بعلامات ترقيم عربية سليمة.\n• استخدم لغة خبرية رصينة بلا أسئلة إنشائية.\n• إذا كان الخبر رقمياً أو إحصائياً، أبرِز الرقم في العنوان أو العنوان الفرعي.\n\nأعد دائماً الناتج بصيغة JSON مطابقة تماماً للمخطط المطلوب، من دون أي شرح إضافي.",
  output_schema: {
    type: "object",
    required: ["title", "subtitle", "smart_summary", "keywords"],
    properties: {
      title: { type: "string", minLength: 12, maxLength: 120 },
      subtitle: { type: "string", minLength: 20, maxLength: 180 },
      smart_summary: { type: "string", minLength: 250, maxLength: 400 },
      keywords: {
        type: "array",
        minItems: 5,
        maxItems: 8,
        items: { type: "string", minLength: 2, maxLength: 40 },
      },
    },
    additionalProperties: false,
  },
  validation_rules: {
    forbidden_keywords: [
      "قال",
      "يقول",
      "يريد",
      "يرغب",
      "تفاصيل",
      "تابع",
      "شاهد",
      "عاجل",
      "الآن",
      "اليوم",
      "غداً",
      "حصري",
    ],
    keywords_must_be_entities: true,
    dedupe_ngrams_size: 3,
    dedupe_across_fields: true,
  },
  postprocess: {
    trim_whitespace: true,
    normalize_punctuation: "arabic",
    collapse_spaces: true,
  },
  prompt_template:
    "النص الصحفي الخام:\n---\n{{CONTENT}}\n---\nالواجب: التزم بتعليمات الأسلوب أعلاه ثم أعد فقط JSON مطابقاً لـ output_schema.",
};

async function loadGenerationDefaults() {
  try {
    const row = await prisma.site_settings.findFirst({ where: { section: "ai" } });
    const data: any = row?.data || {};
    const cfg = data?.generation?.defaults;
    if (cfg && typeof cfg === "object") return cfg;
  } catch (e) {
    console.warn("⚠️ فشل قراءة ai.generation.defaults، استخدام الافتراضي.");
  }
  return DEFAULTS;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content: string = (body?.content || "").toString();

    if (!content || content.length < 40) {
      return NextResponse.json({ error: "نص المحتوى غير صالح" }, { status: 400 });
    }

    const cfg = await loadGenerationDefaults();

    const openai = await createOpenAIClient();
    if (!openai) {
      return NextResponse.json({ error: "تعذر الاتصال بخدمة الذكاء الاصطناعي" }, { status: 500 });
    }

    const prompt = (cfg.prompt_template as string || DEFAULTS.prompt_template).replace("{{CONTENT}}", content);

    const resp = await openai.chat.completions.create({
      model: cfg.model || DEFAULTS.model,
      temperature: typeof cfg.temperature === 'number' ? cfg.temperature : DEFAULTS.temperature,
      top_p: typeof cfg.top_p === 'number' ? cfg.top_p : DEFAULTS.top_p,
      presence_penalty: typeof cfg.presence_penalty === 'number' ? cfg.presence_penalty : DEFAULTS.presence_penalty,
      frequency_penalty: typeof cfg.frequency_penalty === 'number' ? cfg.frequency_penalty : DEFAULTS.frequency_penalty,
      max_tokens: typeof cfg.max_tokens === 'number' ? cfg.max_tokens : DEFAULTS.max_tokens,
      stop: Array.isArray(cfg.stop) ? cfg.stop : DEFAULTS.stop,
      messages: [
        { role: "system", content: cfg.system_prompt || DEFAULTS.system_prompt },
        { role: "user", content: prompt },
      ],
    });

    const raw = resp.choices?.[0]?.message?.content?.trim() || "{}";

    // محاولة فك JSON بأمان
    let parsed: unknown;
    try {
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch {
      return NextResponse.json({ error: "فشل تحليل استجابة الذكاء الاصطناعي" }, { status: 502 });
    }

    const result = OutputSchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json({ error: "المخرجات لا تطابق المخطط", details: result.error.flatten() }, { status: 422 });
    }

    const out = result.data;

    // قواعد ما بعد المعالجة: كلمات محظورة
    const forbids: string[] = cfg.validation_rules?.forbidden_keywords || DEFAULTS.validation_rules.forbidden_keywords;
    const hasForbidden = [out.title, out.subtitle, out.smart_summary, ...(out.keywords || [])]
      .some((s) => forbids.some((f) => s.includes(f)));
    if (hasForbidden) {
      return NextResponse.json({ error: "المخرجات تضمنت كلمات محظورة أسلوبياً" }, { status: 422 });
    }

    return NextResponse.json(out);
  } catch (error: any) {
    console.error("❌ generate-news error:", error?.message || error);
    return NextResponse.json({ error: "GENERATION_ERROR" }, { status: 500 });
  }
}


