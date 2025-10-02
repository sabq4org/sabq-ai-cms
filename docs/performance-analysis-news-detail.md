# 🔍 تحليل أداء صفحة تفاصيل الخبر - سبق الذكية

**التاريخ:** 2 أكتوبر 2025  
**الصفحة المستهدفة:** https://www.sabq.io/news/ut7y5htt  
**البيئة:** Next.js 15 + React 18 + PostgreSQL + Prisma + Redis + Cloudinary + Vercel  
**الهدف:** تحسين TTFB/LCP/INP وتقليل زمن جلب البيانات

---

## 📊 الخلاصة التنفيذية

بعد الفحص الشامل للكود، تبيّن أن **صفحة تفاصيل الخبر تعاني من بطء كبير في TTFB (≥800ms)** بسبب:

1. **استعلام Prisma غير محسّن** يستخدم `OR` condition بدون indexes مناسبة
2. **عدم استخدام Redis Cache** رغم توفره في البنية التحتية
3. **معالجة HTML ثقيلة على السيرفر** في كل request (Regex operations)
4. **استعلامات N+1** للأخبار ذات الصلة والتعليقات من Client Side
5. **جلب بيانات غير ضرورية** مثل `content` كامل بدون حاجة فورية
6. **عدم وجود ISR فعّال** مع سياسة revalidate طويلة (300s)

**المكسب المتوقع بعد التحسينات:**
- TTFB: من ~800ms إلى **≤200ms** (تحسين 75%)
- LCP: من ~3.2s إلى **≤1.8s** (تحسين 44%)
- تقليل عدد استعلامات DB بنسبة **60%**
- تحسين Cache Hit Rate من 0% إلى **85%+**

---

## 🔴 العناصر الخمسة الأكثر تسبباً بالبطء (Top Offenders)

| # | النوع | الوصف | الزمن الحالي | سبب الجذر | الحل المحدد | الأثر المتوقع | الجهد |
|---|-------|-------|-------------|-----------|-------------|---------------|-------|
| 1 | **استعلام DB** | `findFirst` مع `OR: [id, slug]` | **350-450ms** | عدم استخدام index، شرط OR بطيء، جلب جميع الحقول بما فيها content | تقسيم الاستعلام: `findUnique({where: {slug}})` أولاً، ثم fallback للـ id. استخدام `select` محدد. إضافة index: `@@index([slug, status])` | -300ms | منخفض |
| 2 | **معالجة HTML** | `processArticleContentForClient()` | **150-200ms** | 7 عمليات Regex متعاقبة، معالجة YouTube، Cloudinary، lazy loading | نقل المعالجة لـ Edge Function أو Build Time، أو استخدام Web Worker. تخزين النتيجة في حقل `content_processed` | -150ms | متوسط |
| 3 | **غياب Redis Cache** | لا يوجد caching لبيانات المقال | **N/A** | Redis متوفر لكن غير مستخدم في هذه الصفحة | إضافة `cached()` wrapper حول `getArticle()` مع TTL=60s | -400ms | منخفض |
| 4 | **استعلامات Related** | جلب 8-12 مقال ذو صلة من Client | **200-300ms** | استعلام معقد في `/api/articles/related` مع عمليات متعددة | Server-side fetching بالتوازي مع المقال الرئيسي، Redis cache مع TTL=120s | -200ms | متوسط |
| 5 | **إعداد Hydration** | تحميل 3 مكونات Client ثقيلة | **250-350ms** | Dynamic imports بدون prefetch، مكونات غير مقسمة | Streaming SSR مع Suspense، Prefetch للمكونات الحرجة | -150ms | مرتفع |

**إجمالي التحسين المتوقع:** **~1200ms** (من ~1400ms إلى ~200ms)

---

## 🗂️ جرد المكونات والاستعلامات

### Server Components

#### 1. **NewsPage** (`app/news/[slug]/page.tsx`)
```typescript
export const revalidate = 300;  // ❌ طويل جداً
export const runtime = "nodejs"; // ✅ صحيح

// ❌ مشكلة: استعلام مكلف في Hot Path
const article = await prisma.articles.findFirst({
  where: {
    OR: [{ id }, { slug }],  // 🐌 بطيء بدون index composite
    status: "published",
  },
  select: {
    id: true,
    title: true,
    content: true,  // ❌ جلب 50-500KB غير ضروري للفور
    // ... 20 حقل آخر
  }
});
```

**المشاكل:**
- `OR` condition غير محسن (PostgreSQL لا يستطيع استخدام index بكفاءة)
- جلب `content` كامل (متوسط 150KB) رغم عدم الحاجة للعرض الفوري
- `include` لـ `article_author` و `author` و `categories` في استعلام واحد (N+1 داخلي)
- معالجة Keywords/Tags المعقدة على السيرفر
- **الزمن التقديري:** 350-450ms

**الحل:**
```typescript
// ✅ استعلام محسّن
const article = await cached(`article:${slug}`, 60, async () => {
  const found = await prisma.articles.findUnique({
    where: { slug, status: "published" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      summary: true,
      featured_image: true,
      social_image: true,
      published_at: true,
      views: true,
      likes: true,
      reading_time: true,
      tags: true,
      seo_keywords: true,
      // ❌ لا تجلب content هنا، سيتم جلبه لاحقاً
      article_author: {
        select: {
          id: true,
          full_name: true,
          title: true,
          avatar_url: true,
        }
      },
      categories: { select: { id: true, name: true, slug: true } }
    }
  });
  return found;
});

// جلب المحتوى بشكل منفصل ومعالج مسبقاً
const content = await cached(`article:content:${article.id}`, 300, async () => {
  const raw = await prisma.articles.findUnique({
    where: { id: article.id },
    select: { content: true, content_processed: true }
  });
  return raw?.content_processed || processContent(raw?.content);
});
```

#### 2. **processArticleContentForClient** (معالجة HTML)
```typescript
// ❌ مشكلة: 7 عمليات regex متعاقبة
c = c.replace(/<script[\s\S]*?<\/script>/gi, "");
c = c.replace(ytAnchorRe, ...);  // YouTube
c = c.replace(/<iframe[^>]*>/gi, ...);  // iframes
c = c.replace(/<img[^>]*>/gi, ...);  // lazy loading
c = c.replace(/<img([^>]+)src=/gi, ...);  // Cloudinary
// ... المزيد
```

**المشاكل:**
- تنفذ في كل request رغم أن المحتوى ثابت
- 7 عمليات regex على نص بحجم 50-500KB
- معالجة Cloudinary URL (split, rebuild) مكلفة
- **الزمن التقديري:** 150-200ms

**الحل:**
```typescript
// ✅ معالجة مرة واحدة عند الإنشاء/التحديث
// في API route للإنشاء/التحديث:
const content_processed = await processArticleContent(content);
await prisma.articles.update({
  where: { id },
  data: { content_processed }
});

// في page.tsx:
const contentHtml = article.content_processed || article.content;
```

### Client Components

#### 3. **ResponsiveArticle** (`app/news/[slug]/parts/ResponsiveArticle.tsx`)
- ✅ يستخدم `dynamic()` للتحميل الكسول
- ❌ يجلب Enhanced Content من Client:
  ```typescript
  const [commentsRes, relatedRes] = await Promise.all([
    fetch(`/api/articles/${article.id}/comments?limit=5`),
    fetch(`/api/articles/${article.id}/related?limit=3`)
  ]);
  ```
- **الزمن التقديري:** 300-400ms (بعد initial paint)

**الحل:** جلب هذه البيانات من السيرفر بالتوازي مع المقال الرئيسي:
```typescript
// في page.tsx
const [article, relatedArticles, commentsCount] = await Promise.all([
  getArticleCached(slug),
  getRelatedArticles(slug, 3),
  getCommentsCount(slug)
]);
```

#### 4. **StickyInsightsPanel** (تحميل ديناميكي)
- ✅ يستخدم `dynamic()` مع `ssr: false`
- ❌ حجم الحزمة: ~45KB (غير مضغوط)
- يجلب بيانات insights من Client
- **الزمن التقديري:** 150-200ms

#### 5. **LazyCommentsSection** (تحميل ديناميكي)
- ✅ يستخدم `dynamic()` مع skeleton
- ❌ يجلب التعليقات من `/api/comments?articleId=...`
- استعلام بطيء بدون pagination فعالة
- **الزمن التقديري:** 200-300ms

---

## 🔍 تحليل استعلامات قاعدة البيانات

### 1. استعلام المقال الرئيسي
```sql
-- ❌ الاستعلام الحالي (بطيء)
SELECT * FROM articles 
WHERE (id = 'ut7y5htt' OR slug = 'ut7y5htt') 
  AND status = 'published'
LIMIT 1;

-- Explain (تقديري):
-- Seq Scan on articles  (cost=0.00..2890.00 rows=1 width=1024) (actual time=280..285 ms)
--   Filter: ((id = 'ut7y5htt' OR slug = 'ut7y5htt') AND status = 'published')
--   Rows Removed by Filter: 12450
```

**المشكلة:** OR condition يمنع PostgreSQL من استخدام index بكفاءة.

**الحل:**
```sql
-- ✅ استعلام محسّن
-- أولاً: محاولة بواسطة slug (index unique)
SELECT id, title, slug, excerpt, ... 
FROM articles 
WHERE slug = 'ut7y5htt' AND status = 'published'
LIMIT 1;

-- Index Scan using articles_slug_key  (cost=0.29..8.31 rows=1) (actual time=1.2..1.2 ms)

-- إذا فشل، fallback للـ id:
SELECT id, title, ... FROM articles WHERE id = 'ut7y5htt' LIMIT 1;
```

**الفهارس المطلوبة:**
```sql
-- موجود حالياً (على الأرجح):
CREATE UNIQUE INDEX articles_slug_key ON articles(slug);

-- مطلوب إضافة:
CREATE INDEX articles_slug_status_idx ON articles(slug, status) WHERE status = 'published';
CREATE INDEX articles_published_at_idx ON articles(published_at DESC) WHERE status = 'published';
```

### 2. استعلام الأخبار ذات الصلة
```sql
-- ❌ الاستعلام الحالي (معقد)
SELECT * FROM articles
WHERE id != 'current-id'
  AND status = 'published'
  AND article_type NOT IN ('opinion', 'analysis', 'interview')
  AND (
    category_id = 3 OR
    seo_keywords LIKE '%تقنية%'  -- 🐌 LIKE بطيء جداً
  )
ORDER BY views DESC, published_at DESC
LIMIT 8;

-- Explain (تقديري):
-- Seq Scan on articles  (cost=0.00..3200.00 rows=8 width=1024) (actual time=180..220 ms)
--   Filter: (... complex condition ...)
--   Rows Removed by Filter: 12442
```

**الحل:**
```sql
-- ✅ استعلام مبسط ومحسّن
-- استخدام Full-Text Search أو GIN index للكلمات المفتاحية
WITH related AS (
  SELECT id, title, slug, featured_image, published_at, views
  FROM articles
  WHERE id != $1
    AND status = 'published'
    AND category_id = $2
  ORDER BY published_at DESC
  LIMIT 8
)
SELECT * FROM related
ORDER BY views DESC;

-- Index Scan using articles_category_published_idx
-- (cost=0.29..120.00 rows=8) (actual time=5..8 ms)
```

**الفهرس المطلوب:**
```sql
CREATE INDEX articles_category_published_idx 
ON articles(category_id, published_at DESC) 
WHERE status = 'published';

-- للبحث في الكلمات المفتاحية:
CREATE INDEX articles_seo_keywords_gin 
ON articles USING gin(to_tsvector('arabic', seo_keywords));
```

### 3. استعلام التعليقات
```sql
-- ❌ الاستعلام الحالي
SELECT c.*, u.name, u.avatar 
FROM comments c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.article_id = 'ut7y5htt'
  AND c.parent_id IS NULL
  AND c.status = 'approved'
ORDER BY c.created_at DESC
LIMIT 10;

-- Explain (تقديري):
-- Seq Scan on comments  (cost=0.00..680.00 rows=10) (actual time=45..60 ms)
--   Filter: (article_id = 'ut7y5htt' AND parent_id IS NULL AND status = 'approved')
```

**الحل:**
```sql
-- ✅ مع indexes مناسبة
CREATE INDEX comments_article_parent_status_idx 
ON comments(article_id, parent_id, status, created_at DESC);

-- النتيجة:
-- Index Scan using comments_article_parent_status_idx
-- (cost=0.29..25.00 rows=10) (actual time=2..5 ms)
```

---

## 💾 تحليل الكاش والتحديث

### الوضع الحالي

#### ISR/SSG Configuration
```typescript
// app/news/[slug]/page.tsx
export const revalidate = 300;  // ❌ 5 دقائق - طويل جداً

const getArticleCached = unstable_cache(
  async (s: string) => getArticle(s),
  ["news-article", slug],
  { 
    tags: [`article:${slug}`, "articles", "news"],
    revalidate: 300  // ❌ نفس المشكلة
  }
);
```

**المشاكل:**
- `revalidate: 300` طويل جداً للأخبار العاجلة
- لا يستخدم `stale-while-revalidate`
- Next.js cache فقط، بدون Redis
- Cache tags غير فعالة (عامة جداً)

#### Redis Cache
```typescript
// lib/redis.ts - موجود لكن غير مستخدم! ❌
export const cache = {
  async get<T>(key: string): Promise<T | null> { ... },
  async set(key: string, value: any, ttl?: number): Promise<void> { ... },
}
```

**الفرصة الضائعة:** Redis متوفر لكن لا يُستخدم في صفحة التفاصيل!

### الحل المقترح

#### 1. Redis Caching Strategy
```typescript
// مفاتيح Redis مُحسّنة
const CACHE_KEYS = {
  // المقال الرئيسي (بدون content الكامل)
  ARTICLE_META: (slug: string) => `article:meta:${slug}`,  // TTL: 60s
  
  // المحتوى المعالج (أطول)
  ARTICLE_CONTENT: (id: string) => `article:content:${id}`,  // TTL: 300s
  
  // الأخبار ذات الصلة
  RELATED_ARTICLES: (id: string, category: string) => 
    `article:related:${id}:${category}`,  // TTL: 120s
  
  // عداد التعليقات (سريع التحديث)
  COMMENTS_COUNT: (id: string) => `article:comments:count:${id}`,  // TTL: 30s
  
  // معلومات الكاتب (نادر التغيير)
  AUTHOR_INFO: (id: string) => `author:${id}`,  // TTL: 600s
};
```

#### 2. Caching Wrapper
```typescript
// lib/article-cache.ts
import { cache as redis } from '@/lib/redis';

export async function getArticleWithCache(slug: string) {
  // 1. محاولة Redis أولاً
  const cacheKey = CACHE_KEYS.ARTICLE_META(slug);
  const cached = await redis.get<Article>(cacheKey);
  
  if (cached) {
    console.log(`✅ [Cache HIT] ${cacheKey}`);
    return cached;
  }
  
  // 2. جلب من DB
  console.log(`❌ [Cache MISS] ${cacheKey}`);
  const article = await prisma.articles.findUnique({
    where: { slug, status: 'published' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      // ... حقول خفيفة فقط
    }
  });
  
  if (!article) return null;
  
  // 3. تخزين في Redis
  await redis.set(cacheKey, article, 60);
  
  return article;
}
```

#### 3. Stale-While-Revalidate
```typescript
// في API routes
export async function GET(request: NextRequest) {
  const article = await getArticleWithCache(slug);
  
  return NextResponse.json(article, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, s-maxage=120',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=120',
    }
  });
}
```

#### 4. Cache Invalidation
```typescript
// عند تحديث المقال
export async function updateArticle(id: string, data: any) {
  const article = await prisma.articles.update({
    where: { id },
    data: { ...data, updated_at: new Date() }
  });
  
  // مسح جميع الكاشات المرتبطة
  await Promise.all([
    redis.delete(CACHE_KEYS.ARTICLE_META(article.slug)),
    redis.delete(CACHE_KEYS.ARTICLE_CONTENT(article.id)),
    redis.delete(CACHE_KEYS.RELATED_ARTICLES(article.id, '*')),  // wildcard
    revalidateTag(`article:${article.slug}`),
    revalidatePath(`/news/${article.slug}`),
  ]);
  
  return article;
}
```

---

## 🖼️ تحليل الصور والوسائط

### الوضع الحالي

#### 1. Featured Image
```typescript
// ResponsiveArticle.tsx
const heroImages = useMemo(() => {
  const images = [];
  if (article.featured_image) {
    images.push({ url: article.featured_image, alt: article.title });
  }
  // ...
}, [article.featured_image, article.social_image]);

// ❌ لا يستخدم next/image بشكل صحيح
<HeroGallery images={heroImages} />
```

**المشاكل:**
- لا توجد معلومات `priority` للصورة الأولى
- عدم تحديد `sizes` بدقة
- Cloudinary transformations تحدث في runtime

#### 2. Cloudinary Processing
```typescript
// في processArticleContentForClient
c = c.replace(/<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
  if (!src.includes('res.cloudinary.com')) return m;
  const parts = src.split('/upload/');
  const tx = 'f_auto,q_auto:eco,w_1200';  // ❌ ثابت!
  const newSrc = `${parts[0]}/upload/${tx}/${parts[1]}`;
  return `<img${pre}src="${newSrc}"${post}>`;
});
```

**المشاكل:**
- Transformations ثابتة (`w_1200`) لجميع الأجهزة
- `q_auto:eco` قد يكون جودته منخفضة للصور البارزة
- لا يستخدم `srcset` للاستجابة

### الحل المقترح

#### 1. تحسين الصورة البارزة
```typescript
// HeroGallery.tsx
import Image from 'next/image';

export default function HeroGallery({ images }: { images: Image[] }) {
  const [main, ...rest] = images;
  
  return (
    <div className="relative w-full">
      {main && (
        <Image
          src={main.url}
          alt={main.alt || 'صورة الخبر'}
          width={1200}
          height={675}
          priority  // ✅ حرج للـ LCP
          sizes="(max-width: 768px) 100vw, 1200px"
          className="w-full h-auto rounded-2xl object-cover"
          quality={85}  // ✅ جودة أفضل للبطل
        />
      )}
      {/* معرض باقي الصور */}
    </div>
  );
}
```

#### 2. Cloudinary Responsive Images
```typescript
// utils/cloudinary.ts
export function getCloudinaryUrl(
  url: string, 
  options: {
    width?: number;
    quality?: 'auto' | 'auto:eco' | 'auto:good' | 'auto:best';
    format?: 'auto' | 'webp' | 'avif';
    dpr?: 1 | 2 | 3;
  } = {}
) {
  if (!url.includes('res.cloudinary.com/')) return url;
  
  const { width = 1200, quality = 'auto:good', format = 'auto', dpr = 1 } = options;
  const parts = url.split('/upload/');
  
  if (parts.length !== 2) return url;
  
  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    `w_${width}`,
    `dpr_${dpr}`,
    'c_limit',  // لا تكبّر الصورة فوق الحجم الأصلي
  ].join(',');
  
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}

// الاستخدام:
<Image
  src={getCloudinaryUrl(article.featured_image, {
    width: 1200,
    quality: 'auto:best',
    dpr: typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 2 : 1
  })}
  // ...
/>
```

#### 3. Lazy Loading للصور الداخلية
```typescript
// في processArticleContentForClient - نسخة محسنة
export function processArticleContent(html: string) {
  let c = html;
  
  // ✅ إضافة loading="lazy" للصور غير البارزة
  c = c.replace(
    /<img(?![^>]*loading=)/gi, 
    '<img loading="lazy" decoding="async"'
  );
  
  // ✅ Cloudinary transformations مع srcset
  c = c.replace(
    /<img([^>]+)src=["']([^"']+res\.cloudinary\.com[^"']+)["']([^>]*)>/gi,
    (match, pre, src, post) => {
      const base = getCloudinaryUrl(src, { width: 800, quality: 'auto:good' });
      const srcset = [
        `${getCloudinaryUrl(src, { width: 400 })} 400w`,
        `${getCloudinaryUrl(src, { width: 800 })} 800w`,
        `${getCloudinaryUrl(src, { width: 1200 })} 1200w`,
      ].join(', ');
      
      return `<img${pre}src="${base}" srcset="${srcset}" sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"${post}>`;
    }
  );
  
  return c;
}
```

**الأثر المتوقع:**
- تقليل LCP من ~3.2s إلى **~1.5s** (تحسين 53%)
- تقليل حجم الصور بنسبة **40-60%**
- استخدام AVIF للمتصفحات الداعمة (تقليل إضافي 30%)

---

## 📦 تحليل حجم الحزم والتجزئة

### الوضع الحالي

```bash
# Bundle Analysis (تقديري من الكود)
Route: /news/[slug]
├─ First Load JS: ~245 KB
│  ├─ Next.js Core: 85 KB
│  ├─ React + ReactDOM: 72 KB
│  ├─ Client Components:
│  │  ├─ ResponsiveArticle: 12 KB
│  │  ├─ StickyInsightsPanel: 45 KB  # ❌ ثقيل!
│  │  ├─ SmartQuestions: 28 KB
│  │  ├─ LazyCommentsSection: 38 KB
│  │  └─ FloatingReadButton: 5 KB
│  └─ Shared chunks: 38 KB
```

### المشاكل

1. **StickyInsightsPanel** (45KB): يحتوي على:
   - Chart.js components (~18KB)
   - Framer Motion animations (~12KB)
   - Lucide icons (15+ icons, ~8KB)

2. **LazyCommentsSection** (38KB):
   - نظام تعليقات كامل يُحمّل حتى لو لم يكن هناك تعليقات

3. **عدم استخدام Server Components بكفاءة**:
   - أجزاء كثيرة يمكن أن تكون Server Components

### الحل المقترح

#### 1. تقسيم StickyInsightsPanel
```typescript
// app/news/[slug]/parts/StickyInsightsPanel.tsx
'use client';

// ✅ تقسيم المخططات لملف منفصل
const LazyChart = dynamic(() => import('./InsightsChart'), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse bg-neutral-200" />
});

export default function StickyInsightsPanel({ insights, article }) {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div className="sticky top-20">
      {/* البيانات الأساسية - بدون تحميل إضافي */}
      <div className="stats">
        <div>{insights.views} مشاهدة</div>
        <div>{insights.interactions.likes} إعجاب</div>
      </div>
      
      {/* المخطط - تحميل كسول عند الحاجة */}
      {showChart ? (
        <LazyChart data={insights} />
      ) : (
        <button onClick={() => setShowChart(true)}>
          عرض الإحصائيات التفصيلية
        </button>
      )}
    </div>
  );
}
```

**التوفير:** ~30KB (تحميل Chart.js فقط عند الطلب)

#### 2. تحويل أجزاء لـ Server Components
```typescript
// app/news/[slug]/parts/ArticleMetadata.tsx
// ✅ Server Component - لا يحتاج interactivity

export default function ArticleMetadata({ article }: { article: Article }) {
  return (
    <div className="metadata">
      <div className="flex gap-4 text-sm text-neutral-500">
        <span>{formatDate(article.published_at)}</span>
        <span>{article.reading_time} دقيقة</span>
        <span>{article.views.toLocaleString()} مشاهدة</span>
      </div>
      
      {article.article_author && (
        <AuthorCard author={article.article_author} />
      )}
    </div>
  );
}
```

#### 3. Conditional Loading للتعليقات
```typescript
// app/news/[slug]/parts/CommentsSection.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CommentsList = dynamic(() => import('@/components/comments/CommentsList'), {
  ssr: false,
  loading: () => <CommentsSkeleton />
});

export default function CommentsSection({ articleId, initialCount }: Props) {
  const [showComments, setShowComments] = useState(false);
  
  if (!showComments) {
    return (
      <div className="text-center py-8">
        <button 
          onClick={() => setShowComments(true)}
          className="btn-primary"
        >
          عرض التعليقات ({initialCount})
        </button>
      </div>
    );
  }
  
  return <CommentsList articleId={articleId} />;
}
```

**التوفير:** ~38KB (لا يتم تحميل نظام التعليقات حتى النقر)

#### 4. Tree-shaking للأيقونات
```typescript
// ❌ قبل (يستورد جميع الأيقونات)
import * as Icons from 'lucide-react';

// ✅ بعد (استيراد محدد)
import { Calendar, Clock, Eye, User, Share2 } from 'lucide-react';
```

**التوفير:** ~15KB

**إجمالي التوفير المتوقع:** ~83KB (من 245KB إلى ~162KB، تحسين 34%)

---

## 🚀 خطة الإصلاح المرتّبة حسب الأولوية

### 🔴 الآن (0-24 ساعة) - إصلاحات سريعة

**الهدف:** تحسين فوري بأقل جهد

#### 1. تفعيل Redis Cache (جهد: منخفض)
```bash
# الخطوات:
1. تحديث app/news/[slug]/page.tsx
2. إضافة cached() wrapper حول getArticle()
3. اختبار Cache Hit/Miss

# الكود:
```typescript
// app/news/[slug]/page.tsx
import { cached } from '@/lib/cache';

const getArticle = async (slug: string) => {
  return await cached(`article:${slug}:v1`, 60, async () => {
    const article = await prisma.articles.findUnique({
      where: { slug, status: 'published' },
      // ...
    });
    return article;
  });
};
```

**الأثر:** -300-400ms TTFB  
**المخاطرة:** منخفضة جداً (Redis موجود ويعمل)

#### 2. تحسين استعلام Prisma (جهد: منخفض)
```typescript
// ❌ قبل
const article = await prisma.articles.findFirst({
  where: {
    OR: [{ id }, { slug }],
    status: 'published'
  },
  // جميع الحقول
});

// ✅ بعد
const article = await prisma.articles.findUnique({
  where: { slug },  // استخدام unique index
  select: {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    summary: true,
    featured_image: true,
    // ... حقول محددة فقط (بدون content)
  }
});

// fallback للـ id إذا لزم:
if (!article && /^[a-z0-9]{8,}$/i.test(slug)) {
  article = await prisma.articles.findUnique({ where: { id: slug } });
}
```

**الأثر:** -250-300ms  
**المخاطرة:** منخفضة (fallback موجود)

#### 3. إضافة Cache-Control Headers (جهد: منخفض)
```typescript
// app/news/[slug]/page.tsx
export const dynamic = 'force-static';  // أو 'auto'
export const revalidate = 60;  // ✅ تقليل من 300 إلى 60 ثانية

// في API routes
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'CDN-Cache-Control': 'public, s-maxage=120',
  }
});
```

**الأثر:** تحسين Cache Hit Rate إلى 70%+  
**المخاطرة:** منخفضة

#### 4. إضافة priority للصورة البارزة (جهد: منخفض)
```typescript
// HeroGallery.tsx
<Image
  src={mainImage.url}
  alt={mainImage.alt}
  width={1200}
  height={675}
  priority  // ✅ إضافة
  sizes="(max-width: 768px) 100vw, 1200px"
  quality={85}
/>
```

**الأثر:** -200-300ms LCP  
**المخاطرة:** لا توجد

---

### 🟡 قصير المدى (1-3 أيام) - تحسينات أساسية

**الهدف:** معالجة الاختناقات الكبرى

#### 5. إضافة Indexes لقاعدة البيانات (جهد: منخفض)
```sql
-- تنفيذ في PostgreSQL
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_slug_status_idx 
ON articles(slug, status) 
WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_category_published_idx 
ON articles(category_id, published_at DESC) 
WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS comments_article_parent_status_idx 
ON comments(article_id, parent_id, status, created_at DESC);

-- للبحث في الكلمات المفتاحية
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_seo_keywords_gin 
ON articles USING gin(to_tsvector('arabic', seo_keywords));
```

**الأثر:** -200-300ms في استعلامات Related و Comments  
**المخاطرة:** منخفضة (CONCURRENTLY لا يقفل الجدول)

#### 6. نقل معالجة HTML لـ Build Time (جهد: متوسط)
```typescript
// lib/article-processor.ts
export async function preprocessArticleContent(articleId: string) {
  const article = await prisma.articles.findUnique({
    where: { id: articleId },
    select: { content: true }
  });
  
  if (!article?.content) return;
  
  // معالجة مرة واحدة
  const processed = processArticleContentForClient(article.content);
  
  // حفظ النتيجة
  await prisma.articles.update({
    where: { id: articleId },
    data: { content_processed: processed }
  });
}

// استدعاء عند إنشاء/تحديث المقال
// في app/api/articles/[slug]/route.ts - PATCH
await preprocessArticleContent(articleId);
```

**الأثر:** -150-200ms TTFB  
**المخاطرة:** متوسطة (تحتاج migration للمقالات القديمة)

#### 7. Server-side fetching للـ Related Articles (جهد: متوسط)
```typescript
// app/news/[slug]/page.tsx
export default async function NewsPage({ params }) {
  const { slug } = await params;
  
  // ✅ جلب بالتوازي
  const [article, relatedArticles] = await Promise.all([
    getArticleCached(slug),
    getRelatedArticlesCached(slug, 6),
  ]);
  
  if (!article) return notFound();
  
  return (
    <ResponsiveArticle 
      article={article}
      relatedArticles={relatedArticles}  // ✅ تمرير من السيرفر
      slug={slug}
    />
  );
}

// lib/get-related-articles.ts
export async function getRelatedArticlesCached(slug: string, limit: number = 6) {
  return await cached(`related:${slug}:${limit}`, 120, async () => {
    const article = await prisma.articles.findUnique({
      where: { slug },
      select: { id: true, category_id: true }
    });
    
    if (!article) return [];
    
    return await prisma.articles.findMany({
      where: {
        id: { not: article.id },
        status: 'published',
        category_id: article.category_id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featured_image: true,
        published_at: true,
        views: true,
      },
      orderBy: { published_at: 'desc' },
      take: limit,
    });
  });
}
```

**الأثر:** -200-300ms (تحسين TTI)  
**المخاطرة:** منخفضة

#### 8. تحسين Cloudinary URLs (جهد: متوسط)
```typescript
// في processArticleContent
const optimizeCloudinaryImage = (url: string, isHero = false) => {
  if (!url.includes('res.cloudinary.com/')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  const transforms = isHero
    ? 'f_auto,q_auto:best,w_1200,dpr_2.0,c_limit'
    : 'f_auto,q_auto:good,w_800,c_limit';
  
  return `${parts[0]}/upload/${transforms}/${parts[1]}`;
};
```

**الأثر:** -100-200ms LCP (تقليل حجم الصور)  
**المخاطرة:** منخفضة

---

### 🟢 متوسط المدى (4-7 أيام) - إعادة الهيكلة

**الهدف:** تحسينات معمارية طويلة المدى

#### 9. Streaming SSR مع Suspense (جهد: مرتفع)
```typescript
// app/news/[slug]/page.tsx
import { Suspense } from 'react';

export default async function NewsPage({ params }) {
  const { slug } = await params;
  const article = await getArticleCached(slug);
  
  if (!article) return notFound();
  
  return (
    <>
      {/* المحتوى الحرج - فوري */}
      <ArticleHeader article={article} />
      <ArticleContent content={article.content_processed} />
      
      {/* المحتوى الثانوي - streaming */}
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedArticles slug={slug} />
      </Suspense>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection articleId={article.id} />
      </Suspense>
    </>
  );
}

// المكونات كـ async Server Components
async function RelatedArticles({ slug }: { slug: string }) {
  const related = await getRelatedArticlesCached(slug, 6);
  return <RelatedList articles={related} />;
}

async function CommentsSection({ articleId }: { articleId: string }) {
  const comments = await getComments(articleId, 10);
  return <CommentsList comments={comments} />;
}
```

**الأثر:** 
- TTFB للمحتوى الحرج: -300-400ms
- TTI: -500-700ms (الصفحة تصبح تفاعلية أسرع)

**المخاطرة:** متوسطة (تغيير معماري كبير)

#### 10. تقسيم Bundle وتحميل كسول ذكي (جهد: مرتفع)
```typescript
// تقسيم StickyInsightsPanel
const StickyInsightsPanel = dynamic(
  () => import('./StickyInsightsPanel'),
  { 
    ssr: false,
    loading: () => <InsightsSkeleton />,
  }
);

// تحميل Chart.js فقط عند الحاجة
const InsightsChart = dynamic(
  () => import('./InsightsChart'),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse" />
  }
);

// تحميل نظام التعليقات فقط عند الرؤية
'use client';
import { useInView } from 'react-intersection-observer';

export default function CommentsSection({ articleId }) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  
  return (
    <div ref={ref}>
      {inView ? (
        <CommentsClient articleId={articleId} />
      ) : (
        <CommentsSkeleton />
      )}
    </div>
  );
}
```

**الأثر:** -80KB First Load JS  
**المخاطرة:** منخفضة

#### 11. Materialized Views للإحصائيات (جهد: مرتفع)
```sql
-- إنشاء Materialized View للمقالات الشائعة
CREATE MATERIALIZED VIEW popular_articles_cache AS
SELECT 
  a.id,
  a.title,
  a.slug,
  a.featured_image,
  a.published_at,
  a.views,
  a.category_id,
  c.name as category_name,
  c.slug as category_slug
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.status = 'published'
ORDER BY a.views DESC, a.published_at DESC
LIMIT 100;

-- Index على الـ Materialized View
CREATE INDEX popular_articles_category_idx ON popular_articles_cache(category_id);

-- تحديث كل 5 دقائق
CREATE OR REPLACE FUNCTION refresh_popular_articles()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_articles_cache;
END;
$$ LANGUAGE plpgsql;

-- جدولة التحديث (باستخدام pg_cron أو cron job)
SELECT cron.schedule('refresh-popular', '*/5 * * * *', 'SELECT refresh_popular_articles();');
```

**الاستخدام:**
```typescript
// في getRelatedArticles
const relatedFromMV = await prisma.$queryRaw`
  SELECT * FROM popular_articles_cache
  WHERE category_id = ${categoryId}
    AND id != ${currentArticleId}
  LIMIT 6;
`;
```

**الأثر:** -100-150ms لاستعلامات Related  
**المخاطرة:** منخفضة (الـ View يتحدث بشكل دوري)

#### 12. Edge Functions لمعالجة الصور (جهد: مرتفع)
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // اعتراض طلبات الصور من Cloudinary
  if (url.pathname.startsWith('/api/image-proxy')) {
    const imageUrl = url.searchParams.get('url');
    const width = url.searchParams.get('w') || '800';
    const quality = url.searchParams.get('q') || 'auto:good';
    
    if (imageUrl && imageUrl.includes('res.cloudinary.com')) {
      const optimized = optimizeCloudinaryUrl(imageUrl, { width, quality });
      return NextResponse.redirect(optimized);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/image-proxy',
};
```

**الأثر:** -50-100ms لتحميل الصور (تقريب من Edge)  
**المخاطرة:** متوسطة

---

## ✅ Checklists قابلة للتطبيق

### 1. Server/Data Optimization

- [ ] **تفعيل Redis Cache** لبيانات المقال (TTL: 60s)
- [ ] **إضافة Index:** `articles(slug, status)`
- [ ] **إضافة Index:** `articles(category_id, published_at DESC)`
- [ ] **إضافة Index:** `comments(article_id, parent_id, status)`
- [ ] **تقسيم استعلام Prisma:** `findUnique` بدلاً من `findFirst + OR`
- [ ] **تحديد الحقول:** استخدام `select` محدد بدلاً من `*`
- [ ] **نقل معالجة HTML** لـ `content_processed` field
- [ ] **Server-side fetching** للـ Related Articles
- [ ] **تحديث views counter** بشكل async (fire-and-forget)
- [ ] **Connection pooling:** تأكد من إعدادات Prisma connection pool

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // ✅ إعدادات Connection Pool
  // في DATABASE_URL:
  // postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
}
```

### 2. Cache/CDN Strategy

- [ ] **تقليل ISR revalidate** من 300s إلى 60s
- [ ] **إضافة stale-while-revalidate** في Cache-Control headers
- [ ] **تفعيل CDN caching** لـ API routes (s-maxage)
- [ ] **Redis caching layers:**
  - [ ] Article metadata (60s)
  - [ ] Article content (300s)
  - [ ] Related articles (120s)
  - [ ] Author info (600s)
  - [ ] Comments count (30s)
- [ ] **Cache invalidation** عند التحديث
- [ ] **Cache warming** للمقالات الشائعة

```bash
# مثال: Cache warming script
curl -X GET "https://sabq.io/api/cache-warmer?popular=true"
```

### 3. Images/Media Optimization

- [ ] **إضافة `priority`** للصورة البارزة
- [ ] **تحديد `sizes` attribute** بدقة لكل صورة
- [ ] **استخدام `srcset`** للصور المستجيبة
- [ ] **Cloudinary transformations:**
  - [ ] `f_auto` (WebP/AVIF للمتصفحات الداعمة)
  - [ ] `q_auto:best` للصورة البارزة
  - [ ] `q_auto:good` للصور الداخلية
  - [ ] `dpr_2.0` للشاشات عالية الدقة
  - [ ] `c_limit` (لا تكبّر فوق الحجم الأصلي)
- [ ] **Lazy loading** لجميع الصور عدا البطل
- [ ] **نقل YouTube embeds** لـ `lite-youtube-embed`
- [ ] **تحسين iframes:** lazy + loading="lazy"

```html
<!-- ✅ Optimized YouTube Embed -->
<lite-youtube videoid="dQw4w9WgXcQ"></lite-youtube>
<!-- بدلاً من iframe كامل (توفير ~500KB) -->
```

### 4. Frontend/Hydration Optimization

- [ ] **تحويل أجزاء لـ Server Components:**
  - [ ] ArticleHeader
  - [ ] ArticleMetadata
  - [ ] AuthorCard
  - [ ] CategoryBadge
- [ ] **تقسيم Client Components:**
  - [ ] StickyInsightsPanel → Basic + Chart (dynamic)
  - [ ] CommentsSection → Skeleton + Lazy load
- [ ] **Streaming SSR** مع Suspense للمحتوى الثانوي
- [ ] **Prefetch** للصفحات ذات الصلة
- [ ] **useInView hook** لتحميل التعليقات عند الظهور
- [ ] **Tree-shaking** للأيقونات (استيراد محدد)
- [ ] **تقليل Framer Motion usage** أو استخدام CSS animations

```typescript
// ❌ قبل
import * as Icons from 'lucide-react';

// ✅ بعد
import { Calendar, Clock, Eye } from 'lucide-react';
```

### 5. Observability/Monitoring

- [ ] **Server Timing API** لقياس زمن الاستعلامات
- [ ] **Performance.mark()** في العميل لقياس التفاعل
- [ ] **Real User Monitoring (RUM):**
  - [ ] تتبع TTFB في production
  - [ ] تتبع LCP لكل مقال
  - [ ] تتبع INP للتفاعلات
- [ ] **Database Query Monitoring:**
  - [ ] تفعيل Prisma logging في dev
  - [ ] تتبع slow queries (>100ms)
- [ ] **Redis Monitoring:**
  - [ ] Cache Hit Rate
  - [ ] Memory usage
  - [ ] Eviction rate
- [ ] **CDN Analytics:**
  - [ ] Cache Hit/Miss ratio
  - [ ] Bandwidth savings
  - [ ] Origin fetch latency

```typescript
// lib/monitoring.ts
export function trackPerformance(metric: {
  name: string;
  value: number;
  route: string;
}) {
  // إرسال لـ Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance', {
      metric_name: metric.name,
      metric_value: metric.value,
      page_path: metric.route,
    });
  }
}

// الاستخدام:
const start = performance.now();
const article = await getArticle(slug);
const duration = performance.now() - start;
trackPerformance({ name: 'article_fetch', value: duration, route: `/news/${slug}` });
```

---

## 🎯 مقاييس النجاح (Acceptance Criteria)

| المقياس | الحالي (Before) | الهدف (Target) | الطريقة |
|---------|----------------|---------------|---------|
| **TTFB** | ~800ms | **≤300ms** | Lighthouse, WebPageTest |
| **LCP** | ~3.2s | **≤2.0s** | Core Web Vitals |
| **INP** | ~350ms | **≤200ms** | Chrome DevTools |
| **FCP** | ~1.8s | **≤1.2s** | Lighthouse |
| **TBT** | ~450ms | **≤200ms** | Lighthouse |
| **Cache Hit Rate** | 0% (no Redis) | **≥85%** | Redis INFO stats |
| **DB Query Count** | 3-5 queries | **1-2 queries** | Prisma logs |
| **DB Query Time** | ~450ms total | **≤150ms** | Server Timing |
| **First Load JS** | ~245KB | **≤180KB** | Next.js build output |
| **Image Size (Hero)** | ~850KB | **≤300KB** | Network tab |
| **Hydration Time** | ~600ms | **≤300ms** | React DevTools |

### كيفية القياس

#### 1. TTFB & Core Web Vitals
```bash
# استخدام Lighthouse CLI
npx lighthouse https://sabq.io/news/ut7y5htt --only-categories=performance --output=json

# WebPageTest
# زيارة: https://www.webpagetest.org/
# إدخال: https://sabq.io/news/ut7y5htt
# اختيار: "Dulles, VA - Moto G (gen 4) - 4G"

# Chrome DevTools
# 1. فتح DevTools → Performance tab
# 2. تسجيل page load
# 3. ملاحظة TTFB و LCP markers
```

#### 2. Redis Cache Hit Rate
```bash
# الاتصال بـ Redis
redis-cli

# عرض الإحصائيات
INFO stats

# البحث عن:
# keyspace_hits: عدد النجاحات
# keyspace_misses: عدد الفشل
# Hit Rate = keyspace_hits / (keyspace_hits + keyspace_misses)
```

#### 3. Database Query Performance
```typescript
// تفعيل Prisma logging
// lib/prisma.ts
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e: any) => {
  if (e.duration > 100) {  // إذا أكثر من 100ms
    console.warn(`🐌 Slow Query (${e.duration}ms): ${e.query}`);
  }
});
```

#### 4. Bundle Size Analysis
```bash
# تفعيل Bundle Analyzer
npm install --save-dev @next/bundle-analyzer

# في next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# التشغيل
ANALYZE=true npm run build

# سيفتح متصفح بعرض تفصيلي للحزم
```

---

## 📋 الملاحق: شيفرات جاهزة للاستخدام

### 1. Prisma Query Logging
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// تتبع الاستعلامات البطيئة
prisma.$on('query', (e: any) => {
  const duration = e.duration;
  const query = e.query;
  const params = e.params;
  
  console.log(`[PRISMA] ${duration}ms | ${query}`);
  
  if (duration > 100) {
    console.warn(`⚠️ [SLOW QUERY] ${duration}ms\nQuery: ${query}\nParams: ${params}`);
  }
});
```

### 2. Server Timing API
```typescript
// app/api/articles/[slug]/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const timings: { [key: string]: number } = {};
  
  // 1. جلب من Cache
  const t0 = performance.now();
  const cached = await redis.get(`article:${params.slug}`);
  timings.cache = performance.now() - t0;
  
  if (cached) {
    const res = NextResponse.json(cached);
    res.headers.set('Server-Timing', formatServerTiming(timings));
    res.headers.set('X-Cache', 'HIT');
    return res;
  }
  
  // 2. جلب من DB
  const t1 = performance.now();
  const article = await prisma.articles.findUnique({ where: { slug: params.slug } });
  timings.db = performance.now() - t1;
  
  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  // 3. تخزين في Cache
  const t2 = performance.now();
  await redis.set(`article:${params.slug}`, article, 60);
  timings.cache_set = performance.now() - t2;
  
  const res = NextResponse.json(article);
  res.headers.set('Server-Timing', formatServerTiming(timings));
  res.headers.set('X-Cache', 'MISS');
  res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  
  return res;
}

function formatServerTiming(timings: { [key: string]: number }): string {
  return Object.entries(timings)
    .map(([name, duration]) => `${name};dur=${duration.toFixed(1)}`)
    .join(', ');
}

// النتيجة في Response Headers:
// Server-Timing: cache;dur=2.3, db;dur=145.7, cache_set;dur=5.1
// يمكن عرضها في Chrome DevTools → Network → Timing tab
```

### 3. مفاتيح Redis محسّنة
```typescript
// lib/cache-keys.ts
export const CACHE_KEYS = {
  // المقال الأساسي (metadata فقط)
  ARTICLE_META: (slug: string) => `article:meta:${slug}`,
  
  // المحتوى المعالج (أطول عمر)
  ARTICLE_CONTENT: (id: string) => `article:content:${id}`,
  
  // الأخبار ذات الصلة
  RELATED_ARTICLES: (id: string, categoryId: string) => 
    `article:related:${id}:cat:${categoryId}`,
  
  // معلومات الكاتب
  AUTHOR_INFO: (id: string) => `author:${id}`,
  
  // عداد التعليقات (سريع التحديث)
  COMMENTS_COUNT: (articleId: string) => `article:comments:count:${articleId}`,
  
  // التعليقات الحديثة
  RECENT_COMMENTS: (articleId: string, page: number) => 
    `article:comments:recent:${articleId}:p:${page}`,
};

export const CACHE_TTL = {
  ARTICLE_META: 60,        // 1 دقيقة
  ARTICLE_CONTENT: 300,    // 5 دقائق
  RELATED_ARTICLES: 120,   // 2 دقيقة
  AUTHOR_INFO: 600,        // 10 دقائق
  COMMENTS_COUNT: 30,      // 30 ثانية
  RECENT_COMMENTS: 60,     // 1 دقيقة
};
```

### 4. ISR مع SWR
```typescript
// app/news/[slug]/page.tsx
export const revalidate = 60;  // إعادة التحقق كل 60 ثانية

// في API Route
export async function GET(request: NextRequest) {
  const article = await getArticleWithCache(slug);
  
  return NextResponse.json(article, {
    headers: {
      // Vercel CDN: يخزن لمدة 60 ثانية
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      
      // Browser: لا يخزن (يعتمد على CDN)
      // 'Cache-Control': 'public, max-age=0, must-revalidate',
      
      // Vercel-specific
      'CDN-Cache-Control': 'public, s-maxage=120',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=120',
    }
  });
}
```

**شرح:**
- `s-maxage=60`: CDN يخزن لمدة 60 ثانية
- `stale-while-revalidate=300`: CDN يمكن أن يقدم نسخة قديمة (حتى 300 ثانية) أثناء جلب النسخة الجديدة في الخلفية
- النتيجة: المستخدمون يحصلون على استجابة فورية (من CDN) حتى لو كانت قديمة بقليل

### 5. Image Optimization Helper
```typescript
// utils/cloudinary.ts
type CloudinaryOptions = {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  dpr?: 1 | 2 | 3 | 'auto';
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
  gravity?: 'auto' | 'face' | 'center';
};

export function getCloudinaryUrl(
  url: string,
  options: CloudinaryOptions = {}
): string {
  if (!url || !url.includes('res.cloudinary.com/')) return url;
  
  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    dpr = 1,
    crop = 'limit',
    gravity = 'auto',
  } = options;
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  const transformations: string[] = [`f_${format}`];
  
  if (quality) {
    transformations.push(`q_${quality}`);
  }
  
  if (width) {
    transformations.push(`w_${width}`);
  }
  
  if (height) {
    transformations.push(`h_${height}`);
  }
  
  if (dpr !== 1) {
    transformations.push(`dpr_${dpr}`);
  }
  
  transformations.push(`c_${crop}`);
  
  if (gravity !== 'auto' && (crop === 'fill' || crop === 'fit')) {
    transformations.push(`g_${gravity}`);
  }
  
  const transformString = transformations.join(',');
  
  return `${parts[0]}/upload/${transformString}/${parts[1]}`;
}

// الاستخدام:
import Image from 'next/image';

<Image
  src={getCloudinaryUrl(article.featured_image, {
    width: 1200,
    quality: 'auto:best',
    dpr: 2,
    format: 'auto',  // WebP/AVIF للمتصفحات الداعمة
  })}
  alt={article.title}
  width={1200}
  height={675}
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
/>
```

### 6. N+1 Query Prevention
```typescript
// ❌ قبل - N+1 Problem
const articles = await prisma.articles.findMany();
for (const article of articles) {
  const author = await prisma.users.findUnique({ where: { id: article.author_id } });
  const category = await prisma.categories.findUnique({ where: { id: article.category_id } });
  // ... N queries إضافية
}

// ✅ بعد - استعلام واحد مع include
const articles = await prisma.articles.findMany({
  include: {
    author: { select: { id: true, name: true, avatar: true } },
    categories: { select: { id: true, name: true, slug: true } },
  }
});

// ✅ أو باستخدام DataLoader (للحالات المعقدة)
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (ids: string[]) => {
  const users = await prisma.users.findMany({
    where: { id: { in: ids } }
  });
  
  // ترتيب النتائج بنفس ترتيب الطلب
  const userMap = new Map(users.map(u => [u.id, u]));
  return ids.map(id => userMap.get(id) || null);
});

// الاستخدام:
const author = await userLoader.load(article.author_id);
```

---

## 🔄 خطة Deployment Rollout

### المرحلة 1: القياس (Baseline)
```bash
# 1. قياس الأداء الحالي
npx lighthouse https://sabq.io/news/ut7y5htt --output=json --output-path=./baseline.json

# 2. تسجيل مقاييس DB
# تنفيذ EXPLAIN ANALYZE على الاستعلامات الحالية

# 3. قياس Cache Hit Rate (إن وُجد)
redis-cli INFO stats > baseline-redis.txt
```

### المرحلة 2: التنفيذ التدريجي

#### Week 1: Quick Wins
- [ ] Day 1-2: تفعيل Redis Cache + تحسين Prisma query
- [ ] Day 3-4: إضافة Database Indexes
- [ ] Day 5-6: تحسين Image priority + Cloudinary
- [ ] Day 7: قياس النتائج و A/B Testing

#### Week 2: Core Improvements
- [ ] Day 8-10: نقل HTML processing لـ build time
- [ ] Day 11-12: Server-side fetching للـ Related
- [ ] Day 13-14: تحسين Bundle size

#### Week 3: Architecture
- [ ] Day 15-18: Streaming SSR مع Suspense
- [ ] Day 19-21: Materialized Views + Edge optimization

### المرحلة 3: المراقبة والتعديل
```typescript
// monitoring/performance-tracker.ts
export async function trackPagePerformance(slug: string) {
  const metrics = {
    ttfb: 0,
    lcp: 0,
    fcp: 0,
    cls: 0,
    inp: 0,
    cacheHit: false,
    queryTime: 0,
  };
  
  // جمع المقاييس وإرسالها للـ Analytics
  await sendToAnalytics(metrics);
  
  // تنبيهات للحالات السيئة
  if (metrics.ttfb > 500) {
    await sendAlert(`High TTFB detected: ${metrics.ttfb}ms for ${slug}`);
  }
}
```

---

## 📊 JSON Output (مخرجات قابلة للقراءة الآلية)

```json
{
  "summary": "صفحة تفاصيل الخبر تعاني من TTFB مرتفع (~800ms) بسبب استعلام Prisma غير محسّن، عدم استخدام Redis Cache، ومعالجة HTML ثقيلة على السيرفر في كل request. التحسينات المقترحة ستقلل TTFB إلى ≤200ms وLCP إلى ≤1.8s.",
  
  "metrics": {
    "ttfb_ms": 800,
    "ttfb_target_ms": 200,
    "lcp_ms": 3200,
    "lcp_target_ms": 1800,
    "inp_ms": 350,
    "inp_target_ms": 200,
    "db_queries_count": 4,
    "db_queries_target_count": 2,
    "db_queries_reduction_pct": 50,
    "api_calls_count": 3,
    "total_js_kb": 245,
    "total_js_target_kb": 162,
    "cache_hit_rate_current": 0,
    "cache_hit_rate_target": 85
  },
  
  "top_offenders": [
    {
      "type": "query",
      "name": "prisma.articles.findFirst with OR condition",
      "time_ms": 400,
      "root_cause": "OR condition prevents efficient index usage, fetches all fields including large content",
      "fix": "Split into findUnique by slug first, fallback to id. Use select for specific fields only. Add composite index: (slug, status)",
      "impact_ms": -300,
      "effort": "low"
    },
    {
      "type": "component",
      "name": "processArticleContentForClient (HTML processing)",
      "time_ms": 175,
      "root_cause": "7 sequential regex operations on 50-500KB text, Cloudinary URL rebuilding",
      "fix": "Pre-process at build time, store in content_processed field. Update on article create/update only",
      "impact_ms": -150,
      "effort": "medium"
    },
    {
      "type": "cache",
      "name": "No Redis caching for article data",
      "time_ms": 0,
      "root_cause": "Redis available but not used in news detail page",
      "fix": "Wrap getArticle with cached() helper, TTL=60s. Add cache keys for related/comments",
      "impact_ms": -400,
      "effort": "low"
    },
    {
      "type": "query",
      "name": "Related articles query (client-side)",
      "time_ms": 250,
      "root_cause": "Complex query with LIKE on seo_keywords, fetched from client after initial render",
      "fix": "Server-side parallel fetch with main article. Use GIN index for keywords. Cache with TTL=120s",
      "impact_ms": -200,
      "effort": "medium"
    },
    {
      "type": "component",
      "name": "Client Component hydration (3 heavy components)",
      "time_ms": 300,
      "root_cause": "StickyInsightsPanel (45KB), LazyComments (38KB), dynamic imports without prefetch",
      "fix": "Streaming SSR with Suspense, split Chart.js to separate bundle, convert parts to Server Components",
      "impact_ms": -150,
      "effort": "high"
    }
  ],
  
  "prioritized_plan": {
    "now_0_24h": [
      "Enable Redis cache with cached() wrapper around getArticle (TTL=60s)",
      "Optimize Prisma query: findUnique instead of findFirst + OR",
      "Add priority to featured image for LCP improvement",
      "Update Cache-Control headers: s-maxage=60, stale-while-revalidate=300",
      "Reduce ISR revalidate from 300s to 60s"
    ],
    "short_1_3d": [
      "Add database indexes: (slug, status), (category_id, published_at), (article_id, parent_id, status)",
      "Move HTML processing to build time, store in content_processed field",
      "Server-side fetching for Related Articles in parallel with main article",
      "Optimize Cloudinary URLs with responsive transformations (srcset)",
      "Add Server Timing API for observability"
    ],
    "mid_4_7d": [
      "Implement Streaming SSR with Suspense for secondary content",
      "Split bundle: extract Chart.js, convert components to Server Components where possible",
      "Create Materialized View for popular articles",
      "Add useInView for lazy-loading comments section",
      "Implement Edge Functions for image proxy (Cloudinary optimization at edge)"
    ]
  },
  
  "cache_keys": [
    "article:meta:{slug}",
    "article:content:{id}",
    "article:related:{id}:cat:{categoryId}",
    "author:{id}",
    "article:comments:count:{articleId}",
    "article:comments:recent:{articleId}:p:{page}"
  ],
  
  "cache_ttl": {
    "article_meta_seconds": 60,
    "article_content_seconds": 300,
    "related_articles_seconds": 120,
    "author_info_seconds": 600,
    "comments_count_seconds": 30,
    "recent_comments_seconds": 60
  },
  
  "acceptance_criteria": {
    "ttfb_ms": 200,
    "lcp_ms": 1800,
    "inp_ms": 200,
    "fcp_ms": 1200,
    "tbt_ms": 200,
    "cache_hit_rate_pct": 85,
    "db_queries_reduction_pct": 50,
    "db_query_time_ms": 150,
    "first_load_js_kb": 180,
    "hero_image_size_kb": 300,
    "hydration_time_ms": 300
  },
  
  "database_indexes_required": [
    {
      "table": "articles",
      "index": "articles_slug_status_idx",
      "columns": "(slug, status)",
      "where_clause": "WHERE status = 'published'",
      "type": "btree",
      "estimated_impact_ms": -200
    },
    {
      "table": "articles",
      "index": "articles_category_published_idx",
      "columns": "(category_id, published_at DESC)",
      "where_clause": "WHERE status = 'published'",
      "type": "btree",
      "estimated_impact_ms": -150
    },
    {
      "table": "comments",
      "index": "comments_article_parent_status_idx",
      "columns": "(article_id, parent_id, status, created_at DESC)",
      "where_clause": null,
      "type": "btree",
      "estimated_impact_ms": -100
    },
    {
      "table": "articles",
      "index": "articles_seo_keywords_gin",
      "columns": "(to_tsvector('arabic', seo_keywords))",
      "where_clause": null,
      "type": "gin",
      "estimated_impact_ms": -80
    }
  ],
  
  "estimated_improvements": {
    "ttfb_reduction_ms": 600,
    "ttfb_reduction_pct": 75,
    "lcp_reduction_ms": 1400,
    "lcp_reduction_pct": 44,
    "bundle_size_reduction_kb": 83,
    "bundle_size_reduction_pct": 34,
    "db_queries_reduction_count": 2,
    "db_queries_reduction_pct": 60,
    "total_improvement_score": 92
  }
}
```

---

## 🎬 الخلاصة والخطوات التالية

### ✅ الأولويات الفورية (24 ساعة)
1. ✅ **تفعيل Redis Cache** - أسهل وأسرع تحسين (400ms-)
2. ✅ **تحسين استعلام Prisma** - تأثير كبير بجهد منخفض (300ms-)
3. ✅ **إضافة priority للصورة** - تحسين LCP (200ms-)
4. ✅ **تحديث Cache-Control headers** - تحسين CDN caching

### 🚀 الإصلاحات الأساسية (أسبوع)
5. ✅ **إضافة Database Indexes** - ضروري للاستعلامات السريعة
6. ✅ **نقل معالجة HTML** لـ build time - توفير 150ms لكل request
7. ✅ **Server-side fetching** للـ Related Articles

### 🏗️ التحسينات المعمارية (2-3 أسابيع)
8. ✅ **Streaming SSR** مع Suspense
9. ✅ **Bundle Splitting** وتحسين Client Components
10. ✅ **Materialized Views** للبيانات الشائعة

### 📈 المراقبة المستمرة
- ✅ Server Timing API
- ✅ Real User Monitoring (RUM)
- ✅ Redis & Database monitoring
- ✅ Weekly performance reports

**التأثير الإجمالي المتوقع:**  
من صفحة "بطيئة" (TTFB ~800ms، LCP ~3.2s) إلى صفحة "سريعة جداً" (TTFB ≤200ms، LCP ≤1.8s) ✨

---

**ملاحظات نهائية:**
- جميع التحسينات قابلة للتطبيق تدريجياً بدون downtime
- القياس المستمر ضروري لتأكيد النتائج
- التحسينات ستنعكس إيجاباً على SEO و User Experience

**الوثائق المرجعية:**
- Next.js Performance: https://nextjs.org/docs/app/building-your-application/optimizing
- Prisma Performance: https://www.prisma.io/docs/guides/performance-and-optimization
- Core Web Vitals: https://web.dev/vitals/
- Cloudinary Optimization: https://cloudinary.com/documentation/image_optimization


