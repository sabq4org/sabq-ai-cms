# تصميم بطاقات الأخبار - بلوك مختارات بالذكاء (النسخة الخفيفة)

## ملاحظة مهمة
هذا الملف يحتوي على الكود الأصلي لتصميم بطاقات الأخبار في بلوك "مختارات بالذكاء" في النسخة الخفيفة كما طلبت.

## المكونات الرئيسية

### 1. المكون الرئيسي `SmartContentBlock` (النسخة الخفيفة للموبايل)
يستخدم هذا المكون `OldStyleNewsBlock` لعرض البطاقات في النسخة الخفيفة:

```tsx
// من ملف components/user/SmartContentBlock.tsx - السطور 234-333

// في النسخة الخفيفة (الموبايل): نعرض بطاقات الطراز القديم فقط
if (isMobile) {
  if (isLoading) {
    return (
      <div style={{ padding: '16px 0' }}>
        {/* Skeleton مبسط للموبايل */}
        <div style={{
          height: '28px',
          background: '#e0e0e0',
          borderRadius: '6px',
          width: '60%',
          marginBottom: '16px',
          animation: 'loading 1.5s infinite'
        }} />
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              height: '120px',
              animation: 'loading 1.5s infinite'
            }} />
          ))}
        </div>
      </div>
    );
  }
  
  // تمرير البيانات للبطاقات العادية
  const oldStyleArticles = (articles as any[]).map((a: any) => ({
    ...a,
    is_custom: false, // إزالة اللابل المخصص
    published_at: a.published_at || a.publishedAt || a.created_at || a.createdAt,
    reading_time: a.readTime || a.reading_time,
  }));

  return (
    <div style={{ padding: '16px 0', marginTop: '28px' }}>
      <div className="px-2 sm:px-4">
      {/* عبارات رأس البلوك الديناميكية */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        {/* أيقونة البلوك في الأعلى في المنتصف */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, hsl(var(--accent) / 0.15) 0%, hsl(var(--accent) / 0.05) 100%)',
            borderRadius: '10px',
            color: 'hsl(var(--accent))',
            fontSize: '18px',
            border: '1px solid hsl(var(--accent) / 0.25)'
          }}>
            <Sparkles className="w-5 h-5" />
          </span>
        </div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'hsl(var(--fg))',
          marginBottom: '6px'
        }}>
          {content.title}
        </h2>
        {content.subtitle ? (
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'hsl(var(--accent))',
            marginBottom: '6px'
          }}>
            {content.subtitle}
          </h3>
        ) : null}
        <p style={{
          fontSize: '12px',
          color: 'hsl(var(--muted))',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          {content.description}
        </p>
      </div>
      <OldStyleNewsBlock
        articles={oldStyleArticles as unknown as any[]}
        title={content.title}
        showTitle={false}
        columns={3}
        className="mt-6 mb-4"
      />
      </div>
    </div>
  );
}
```

### 2. مكون `OldStyleNewsBlock` الأساسي
هذا هو المكون الذي يعرض البطاقات الفعلية:

```tsx
// من ملف components/old-style/OldStyleNewsBlock.tsx - السطور الرئيسية 176-250

{articles.map((article, index) => (
  <Link
    key={article.id}
    href={getArticleUrl(article)}
    prefetch={false}
    className="old-style-news-card"
    style={{ contentVisibility: 'auto', containIntrinsicSize: '300px 220px' as any }}
    data-track-view="1"
    data-article-id={String(article.id)}
  >
    {/* صورة المقال */}
    <div className="old-style-news-image-container" style={{ position: 'relative' }}>
      <CloudImage
        src={getImageUrl(article)}
        alt={article.title}
        className="old-style-news-image"
        priority={index < columns}
        fill
        fallbackType="article"
        fit="cover"
        objectPosition="center"
        bgColor="#f3f4f6"
      />
    </div>

    {/* محتوى المقال */}
    <div className="old-style-news-content">
      {/* الشريط العلوي: شارات + التاريخ بجانب الشارات وعلى يمين البطاقة */}
      <div className="old-style-news-top-bar">
        <div className="old-style-news-badges">
          {/* شارة عاجل - أولوية أعلى من باقي الشارات */}
          {(article.breaking || article.is_breaking) && (
            <div className="old-style-news-breaking-badge">
              <span className="old-style-lightning-emoji" aria-hidden>⚡</span>
              <span>عاجل</span>
            </div>
          )}
          {/* ليبل التصنيف - تم إخفاؤه حسب طلب المستخدم */}
          {isNewsNew(article.published_at) && !(article.breaking || article.is_breaking) && (
            <div className="recent-news-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
              <span className="text-xs">🔥</span>
              <span>جديد</span>
            </div>
          )}
        </div>
      </div>

      {/* العنوان */}
      <h3 className="old-style-news-card-title">
        {article.title}
      </h3>

      {/* شريط المعلومات السفلي: المشاهدات + التاريخ + مدة القراءة */}
      <div className="old-style-news-bottom-bar">
        <div className="old-style-news-meta-item">
          <ArticleViews 
            count={(article as any).views ?? (article as any).views_count ?? (article as any).view_count ?? 0} 
            showLabel={true} 
            size="xs" 
          />
          <span style={{ margin: '0 6px', opacity: 0.6 }}>•</span>
          <span>{formatGregorianDate(article.published_at)}</span>
        </div>
        {article.reading_time && (
          <div className="old-style-news-meta-item">
            <Clock className="old-style-icon" />
            <span>{article.reading_time} د قراءة</span>
          </div>
        )}
      </div>
    </div>
  </Link>
))}
```

### 3. الأنماط CSS الأساسية
```css
/* من ملف styles/old-style-news.css - الأنماط الرئيسية */

/* بطاقة الخبر - تصميم بسيط بدون إطارات نهائياً */
.old-style-news-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0;
  overflow: visible;
  transition: transform 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: block;
  box-shadow: none;
  outline: none;
  position: relative;
}

/* حاوي الصورة - زوايا منحنية قليلاً */
.old-style-news-image-container {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 6px;
}

.old-style-news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  border-radius: 8px;
  background-color: #fff;
}

/* محتوى البطاقة - بدون padding */
.old-style-news-content {
  padding: 0;
  margin-top: 0;
}

/* عنوان المقال */
.old-style-news-card-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: #111827;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* شارة عاجل - أحمر */
.old-style-news-breaking-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #dc2626;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  animation: pulse 2s ease-in-out infinite alternate;
  position: relative;
}

/* الشريط السفلي: المشاهدات ومدة القراءة */
.old-style-news-bottom-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: auto;
}

.old-style-news-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}
```

## البنية الأساسية للبطاقة

1. **الصورة**: نسبة 16:9 مع زوايا منحنية 8px
2. **الشارات**: عاجل (أحمر) أو جديد (أخضر مع 🔥)
3. **العنوان**: 3 أسطر كحد أقصى، خط عريض
4. **البيانات الوصفية**: المشاهدات • التاريخ • مدة القراءة

## التكامل مع النظام

- يستخدم `ArticleViews` component لعرض المشاهدات مع الشعلة عند تجاوز 300
- يستخدم `CloudImage` component للصور مع fallback
- يتتبع المشاهدات عبر Intersection Observer
- متجاوب مع الأجهزة المختلفة (1 عمود على الموبايل، 2 على التابلت، 3+ على الديسكتوب)

## ملاحظات إضافية

- التصميم يعمل مع الوضعين الفاتح والمظلم
- البطاقات بسيطة بدون تأثيرات hover معقدة
- التركيز على سرعة التحميل والأداء
- استخدام `contentVisibility: auto` لتحسين الأداء
