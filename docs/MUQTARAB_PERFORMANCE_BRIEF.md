تكليف عاجل — تشخيص وتحسين أداء قسم “مُقترب”

نلاحظ بطئًا شديدًا في صفحات مُقترب (قائمة الزوايا + صفحة الزاوية + مقالة مُقترب) مقارنة بنموذج الأخبار/المقالات/التحليل العميق. المطلوب تنفيذ خطة فحص وتحسين أداء شاملة وفق البنود التالية خلال 48 ساعة، مع أرقام قبل/بعد.

1) أهداف الأداء (Definition of Done)
- TTFB لكل صفحات مُقترب ≤ 400ms (P75).
- LCP على الجوال ≤ 2.5s (P75).
- وقت عرض أولي (First Contentful Paint) ≤ 1.5s.
- لا يوجد “لودنج” متكرر أو دوّار تحميل يتجاوز 300ms إلا عند تفاعل المستخدم (Lazy regions فقط).
- تقليل حجم الجافاسكربت المرسل لصفحات مُقترب ≥ 30% مقارنة بالحالي.

2) بنود الفحص السريع (Quick Triage)
- قارن Network Waterfall بين صفحة خبر عادية (سريعة) vs صفحة زاوية/مقال مُقترب (بطيئة).
- سجّل: عدد الطلبات، الحجم الإجمالي، أطول طلب، وأي طلبات متسلسلة (chained).
- تحقق من N+1 Queries في جلب الزاوية/المقالات التابعة لها.
- راقب زمن استجابة API/DB لنداءات مُقترب (P50/P95).
- افحص الـ hydration والمكونات العميلة الثقيلة غير الضرورية.
- عطّل مؤقتًا سكربتات الطرف الثالث في مُقترب وشاهد الفرق.
- افحص الصور وlayout shifts.

3) قاعدة البيانات والاستعلامات
- راجع الاستعلامات الأساسية (قائمة الزوايا، صفحة الزاوية، مقالة مُقترب).
- الفهارس المطلوبة: slug, angle_id/section_id, published_at DESC + فهرس مركّب (section_id, published_at DESC).
- استخدم SELECT للحقول الضرورية فقط.
- LIMIT واضح (مثل 12) مع OFFSET/Keyset، وجرّب Keyset Pagination.
- ألغِ JOIN غير الضروري، وقسّم الاستعلامات الكبيرة.

4) الكاش والـ ISR/Tagging (Next.js + Redis)
- قائمة الزوايا وصفحة الزاوية: ISR مع revalidate (60–120s).
- مقالة مُقترب: Static + revalidateTag عند النشر/التحديث.
- Redis كمخزن لردود الـ API بمفاتيح واضحة:
  - moqtarab:sections:v1
  - moqtarab:section:{slug}:v1?page={n}
  - moqtarab:post:{slug}:v1
- HTTP Caching:
  - HTML: s-maxage=120, stale-while-revalidate=60
  - JSON APIs: s-maxage=300, stale-while-revalidate=600

مثال Route Handler مع Tagging (Next.js App Router)

```ts
import { unstable_cache, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const getSection = unstable_cache(
  async (slug: string, page: number) => {
    const section = await db.section.findUnique({ where: { slug }, select: { id:true, name:true, description:true }});
    const posts = await db.post findMany({
      where: { sectionSlug: slug, status:'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 12,
      skip: page * 12,
      select: { id:true, slug:true, title:true, cover:true, excerpt:true, publishedAt:true }
    });
    return { section, posts };
  },
  ['moqtarab-section'],
  { tags: (slug:string)=>[`moqtarab:section:${slug}`], revalidate: 120 }
);

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') || 0);
  const data = await getSection(params.slug, page);
  return new NextResponse(JSON.stringify(data), {
    headers: { 'Content-Type':'application/json', 'Cache-Control':'public, s-maxage=120, stale-while-revalidate=600' }
  });
}

export async function POST(req: Request) {
  const { slug } = await req.json();
  revalidateTag(`moqtarab:section:${slug}`);
  return NextResponse.json({ ok: true });
}
```

5) تقليل كلفة الـ Client Side
- Server Components قدر الإمكان.
- code-splitting وLazy لمكونات الزينة بعد ظهور المحتوى.
- إزالة state/contexts الثقيلة.
- streaming + Suspense بدل لودنج لانهائي.
- prefetch ذكي بروابط مرئية فقط.

6) الصور والوسائط
- next/image بأحجام ثابتة وplaceholder=\"blur\" وpriority للأولى فقط.
- WebP/AVIF وتهيئة deviceSizes/imageSizes.
- lazy خارج الشاشة.

7) واجهة المستخدم/UX
- Skeleton < 300ms.
- لا تعرض “جاري التحميل” إلا عند الطلب الفعلي.
- Retry للبلوكات الجزئية فقط.

8) مراقبة وقياس (Observability)
- سجّل: api_db_ms, api_total_ms, cache_hit, html_size_kb, js_kb_sent, img_kb.
- لوحات: Latency P50/P95، Cache Hit Ratio، Web Vitals للجوال.
- تقرير قبل/بعد بالأرقام ولقطات DevTools/Analytics.

9) أسباب محتملة معروفة
- N+1، فهارس مفقودة، SSR بلا كاش، مكونات عميلة ثقيلة، صور غير مضبوطة، سكربتات طرف ثالث.

10) فهارس PostgreSQL (أمثلة)
```sql
CREATE INDEX IF NOT EXISTS idx_sections_slug ON sections (slug);
CREATE INDEX IF NOT EXISTS idx_posts_section_published ON posts (section_slug, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
```

11) جدول التسليم
- T0: قياس خط الأساس + خطة الإصلاح.
- T0+1: فهارس + كاش + فصل مكونات + صور.
- T0+2: تقرير النتائج + PR نهائي + مراقبة 24 ساعة.

ملاحظات تنفيذية
- Server-first، ISR/Tagging، Redis caching، قابلية القياس.
- أي تغيير يعطّل الكاش أو يزيد JS bundle يحتاج مراجعة.
- الهدف: مُقترب بسرعة وسلاسة الأخبار/المقالات/التحليل العميق أو أسرع.
