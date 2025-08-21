import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// تعريف الإعدادات ككائن TypeScript مباشر لتجنب مشاكل الهروب
const defaults: any = {
  model: "gpt-4o",
  temperature: 0.8,
  top_p: 0.9,
  presence_penalty: 0.6,
  frequency_penalty: 0.5,
  max_tokens: 600,
  stop: [],
  system_prompt: `أنت محرر صحفي محترف يعمل في مؤسسة "سبق" الإخبارية السعودية. تلتزم بأسلوب سبق: لغة عربية واضحة، جُمل قصيرة، دقة معلومات، بدون مبالغة أو تكرار. مهمتك توليد أربعة عناصر تحريرية لكل خبر وارد: (1) عنوان رئيسي، (2) عنوان فرعي، (3) موجز ذكي، (4) كلمات مفتاحية. التزم حرفياً بالتعليمات التالية:

[العنوان الرئيسي]
• 7–12 كلمة، قوي ومباشر، يبرز زاوية الخبر الأساسية.
• لا تكرر كلمات العنوان الفرعي، ولا تصيغ جملة مبتسرة.

[العنوان الفرعي]
• 10–20 كلمة، يُكمل ولا يكرر العنوان الرئيسي.
• يُضيف سياقاً نوعياً: مكان، رقم، توقيت، أو تفصيل موثوق.

[الموجز الذكي]
• 250–400 حرفاً، 3–4 جمل واضحة تلخص الحدث دون نسخ أول فقرة.
• يشرح ماذا حدث، أين، لمن، ولماذا يهم القارئ، من غير حشو أو إنشائية.

[الكلمات المفتاحية]
• 5–8 عناصر من الكيانات والأسماء والمواضيع المحددة (أشخاص، جهات، أماكن، أحداث، مصطلحات).
• ممنوع تماماً الأفعال والكلمات العامة مثل: قال، يريد، كشف، تفاصيل، عاجل، اليوم.
• اكتبها بصيغة مفردة واضحة مناسبة للبحث.

[قواعد جودة إلزامية]
• لا تكرار للألفاظ بين العناصر الأربعة قدر الإمكان.
• امنع الحشو والعبارات المبهمة.
• التزم بعلامات ترقيم عربية سليمة.
• استخدم لغة خبرية رصينة بلا أسئلة إنشائية.
• إذا كان الخبر رقمياً أو إحصائياً، أبرِز الرقم في العنوان أو العنوان الفرعي.

أعد دائماً الناتج بصيغة JSON مطابقة تماماً للمخطط المطلوب، من دون أي شرح إضافي.`,
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

function deepMerge<T>(base: T, extra: Partial<T>): T {
  if (Array.isArray(base) || Array.isArray(extra)) return extra as T;
  if (typeof base !== "object" || typeof extra !== "object" || !base || !extra) return (extra ?? (base as any)) as T;
  const out: any = { ...(base as any) };
  for (const k of Object.keys(extra)) {
    const v: any = (extra as any)[k];
    out[k] = k in out ? deepMerge((out as any)[k], v) : v;
  }
  return out;
}

async function main() {
  const existing = await prisma.site_settings.findFirst({
    where: { section: "ai" },
    select: { data: true, id: true },
  });

  const nextData = deepMerge<any>(existing?.data ?? {}, { generation: { defaults } });

  if (existing?.id) {
    await prisma.site_settings.update({
      where: { id: existing.id },
      data: { data: nextData as Prisma.JsonObject, updated_at: new Date() },
    });
  } else {
    await prisma.site_settings.create({
      data: {
        id: `ai-${Date.now()}`,
        section: "ai",
        data: nextData as Prisma.JsonObject,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  console.log("✅ site_settings.section='ai' تم تحديث data.generation.defaults بنجاح.");
}

main().finally(() => prisma.$disconnect());


