# 🚀 دليل البدء السريع - تحسين أداء صفحة تفاصيل الخبر

هذا الدليل يوضح كيفية تطبيق التحسينات خطوة بخطوة لتحسين أداء صفحة تفاصيل الخبر.

---

## 📋 المتطلبات الأساسية

- ✅ Next.js 15 + React 18
- ✅ PostgreSQL 15+
- ✅ Redis (مُفعّل)
- ✅ صلاحيات CREATE INDEX على قاعدة البيانات
- ✅ Node.js 18+

---

## 🎯 التطبيق السريع (24 ساعة)

### الخطوة 1: تطبيق Database Indexes (⏱️ 5-10 دقائق)

```bash
# 1. التأكد من توفر DATABASE_URL
echo $DATABASE_URL

# 2. تطبيق Indexes
./scripts/apply-performance-indexes.sh

# أو يدوياً:
psql "$DATABASE_URL" -f prisma/migrations/20251002_add_performance_indexes.sql
```

**الأثر المتوقع:** -200-300ms في استعلامات DB

---

### الخطوة 2: تحديث صفحة التفاصيل لاستخدام Redis Cache (⏱️ 15 دقيقة)

افتح ملف: `app/news/[slug]/page.tsx`

```typescript
// ❌ قبل
import prisma from '@/lib/prisma';

const getArticle = async (slug: string) => {
  const article = await prisma.articles.findFirst({
    where: {
      OR: [{ id: slug }, { slug }],
      status: 'published'
    },
    // ...
  });
  return article;
};

// ✅ بعد
import { getArticleWithCache } from '@/lib/article-cache-optimized';

const getArticle = async (slug: string) => {
  return await getArticleWithCache(slug);
};
```

**الأثر المتوقع:** -400ms TTFB (عند Cache Hit)

---

### الخطوة 3: تحديث revalidate (⏱️ 2 دقيقة)

في نفس الملف `app/news/[slug]/page.tsx`:

```typescript
// ❌ قبل
export const revalidate = 300;  // 5 دقائق

// ✅ بعد
export const revalidate = 60;   // 1 دقيقة
```

**الأثر المتوقع:** محتوى أحدث، Cache Hit Rate أفضل

---

### الخطوة 4: إضافة priority للصورة البارزة (⏱️ 5 دقائق)

افتح: `app/news/[slug]/parts/HeroGallery.tsx` (أو المكون المناسب)

```typescript
import Image from 'next/image';

// ✅ إضافة priority
<Image
  src={heroImage.url}
  alt={heroImage.alt || 'صورة الخبر'}
  width={1200}
  height={675}
  priority  // ✅ جديد
  sizes="(max-width: 768px) 100vw, 1200px"
  quality={85}
/>
```

**الأثر المتوقع:** -200-300ms LCP

---

### الخطوة 5: اختبار التحسينات (⏱️ 10 دقائق)

```bash
# 1. إعادة تشغيل التطبيق
npm run build
npm run start

# 2. اختبار Cache
curl -v https://localhost:3000/api/articles/test-slug

# تحقق من Headers:
# X-Cache: HIT أو MISS

# 3. قياس الأداء
npx lighthouse http://localhost:3000/news/test-article --view
```

---

## 📊 القياس والمراقبة

### 1. Redis Cache Monitoring

```bash
# الاتصال بـ Redis
redis-cli

# عرض الإحصائيات
INFO stats

# البحث عن:
# keyspace_hits: عدد النجاحات
# keyspace_misses: عدد الفشل
# Hit Rate = hits / (hits + misses) * 100
```

### 2. Database Query Performance

```sql
-- عرض Indexes المُنشأة
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'articles'
ORDER BY indexname;

-- عرض استخدام Indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'articles'
ORDER BY idx_scan DESC;

-- اختبار استعلام محسّن
EXPLAIN ANALYZE
SELECT * FROM articles 
WHERE slug = 'test-article' AND status = 'published';

-- يجب أن ترى: Index Scan using articles_slug_status_idx
```

### 3. Lighthouse Performance

```bash
# قياس Core Web Vitals
npx lighthouse https://sabq.io/news/ut7y5htt \
  --only-categories=performance \
  --output=json \
  --output-path=./performance-report.json

# عرض النتائج
cat performance-report.json | jq '.audits["metrics"].details.items[0]'
```

---

## 🔧 تحسينات إضافية (اختيارية)

### A. Server-side Fetching للـ Related Articles

في `app/news/[slug]/page.tsx`:

```typescript
import { getArticleWithCache, getRelatedArticlesWithCache } from '@/lib/article-cache-optimized';

export default async function NewsPage({ params }) {
  const { slug } = await params;
  
  // ✅ جلب بالتوازي
  const [article, relatedArticles] = await Promise.all([
    getArticleWithCache(slug),
    // سيتم جلب Related بعد الحصول على article.id
    // نحتاج لتعديل بسيط:
    getArticleWithCache(slug).then(async (art) => {
      if (art) {
        return await getRelatedArticlesWithCache(art.id, art.categories?.id || '', 6);
      }
      return [];
    })
  ]);
  
  // تمرير relatedArticles لـ ResponsiveArticle
}
```

أو بشكل أفضل:

```typescript
export default async function NewsPage({ params }) {
  const { slug } = await params;
  
  // 1. جلب المقال أولاً
  const article = await getArticleWithCache(slug);
  if (!article) return notFound();
  
  // 2. جلب Related بالتوازي مع content
  const [content, relatedArticles] = await Promise.all([
    getArticleContentWithCache(article.id),
    getRelatedArticlesWithCache(article.id, article.categories?.id || '', 6),
  ]);
  
  return (
    <ResponsiveArticle 
      article={{ ...article, content }}
      relatedArticles={relatedArticles}
      slug={slug}
    />
  );
}
```

**الأثر المتوقع:** -200-300ms (تحسين TTI)

---

### B. تحسين الصور باستخدام Cloudinary

```typescript
// في أي مكون يعرض صوراً
import { CLOUDINARY_PRESETS } from '@/utils/cloudinary-optimizer';

// ✅ استخدام Preset محسّن
<Image
  src={CLOUDINARY_PRESETS.hero(article.featured_image)}
  alt={article.title}
  width={1200}
  height={675}
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// أو مع srcset:
const { src, srcSet, sizes } = CLOUDINARY_PRESETS.heroResponsive(article.featured_image);
<Image src={src} srcSet={srcSet} sizes={sizes} ... />
```

---

### C. Cache Warming (للمقالات الشائعة)

```bash
# يدوياً
curl -X GET "https://sabq.io/api/cache-warmer?token=YOUR_SECRET_TOKEN"

# أو جدولة عبر Cron (كل 10 دقائق)
# في Vercel: استخدام Vercel Cron Jobs
# في vercel.json:
{
  "crons": [
    {
      "path": "/api/cache-warmer",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

أو إضافة في `.env`:

```env
CACHE_WARMER_TOKEN=your-super-secret-token-here
```

---

## 🎯 النتائج المتوقعة

| المقياس | قبل التحسين | بعد التحسين | التحسين |
|---------|-------------|-------------|----------|
| **TTFB** | ~800ms | **≤200ms** | -75% |
| **LCP** | ~3.2s | **≤1.8s** | -44% |
| **FCP** | ~1.8s | **≤1.2s** | -33% |
| **Cache Hit Rate** | 0% | **≥85%** | +85% |
| **DB Query Time** | ~450ms | **≤150ms** | -67% |
| **Bundle Size** | 245KB | **≤180KB** | -27% |

---

## ⚠️ استكشاف الأخطاء

### مشكلة: Redis غير متصل

```bash
# فحص حالة Redis
redis-cli ping
# يجب أن ترى: PONG

# إذا لم يعمل، تحقق من .env
echo $REDIS_URL

# تشغيل Redis محلياً
redis-server
```

### مشكلة: Indexes لم يتم إنشاؤها

```sql
-- التحقق من وجود Indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'articles';

-- إذا لم تكن موجودة، قم بتنفيذ يدوياً:
CREATE INDEX CONCURRENTLY articles_slug_status_idx 
ON articles(slug, status) 
WHERE status = 'published';
```

### مشكلة: Cache لا يعمل

```typescript
// إضافة Logging للتشخيص
import { cache as redis } from '@/lib/redis';

const testCache = async () => {
  await redis.set('test-key', 'test-value', 60);
  const result = await redis.get('test-key');
  console.log('Redis Test:', result); // يجب أن يطبع: test-value
};
```

---

## 📚 الوثائق الكاملة

- [تحليل الأداء الشامل](./performance-analysis-news-detail.md)
- [مرجع API للـ Cache](../lib/article-cache-optimized.ts)
- [مرجع Cloudinary](../utils/cloudinary-optimizer.ts)

---

## 🤝 الدعم

إذا واجهت أي مشاكل:

1. راجع [التوثيق الكامل](./performance-analysis-news-detail.md)
2. تحقق من Logs: `docker logs sabq-cms` أو `pm2 logs`
3. افحص Redis: `redis-cli MONITOR`
4. افحص PostgreSQL: `psql $DATABASE_URL -c "\d+ articles"`

---

**آخر تحديث:** 2 أكتوبر 2025  
**الإصدار:** 1.0.0

