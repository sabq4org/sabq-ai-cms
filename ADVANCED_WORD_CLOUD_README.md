# مكون Word Cloud المتطور للكلمات الشائعة
# Advanced Word Cloud Component for Trending Keywords

## 🎯 نظرة عامة

مكون Word Cloud متطور وتفاعلي مصمم خصيصاً لعرض الكلمات الشائعة في موقع سبق الذكية. يدعم الاتجاه من اليمين لليسار (RTL) ومحسن للأجهزة المحمولة مع تجربة مستخدم متميزة.

## ✨ الميزات الرئيسية

### 🎨 التصميم والتفاعل
- **Word Cloud تفاعلي**: عرض الكلمات بأحجام مختلفة حسب الأهمية
- **ألوان دلالية**: فئات ملونة للمواضيع (سياسة، اقتصاد، جغرافيا، إلخ)
- **أيقونات الاتجاه**: عرض صاعد/هابط/ثابت لكل كلمة
- **تأثيرات Hover**: تكبير وظلال عند المرور بالماوس
- **Tooltips معلوماتية**: تفاصيل إضافية عند الوضع فوق الكلمة

### 📱 التجاوب والوصولية
- **Mobile-First**: مُحسن للأجهزة المحمولة
- **RTL كامل**: دعم كامل للاتجاه من اليمين لليسار
- **وصولية WCAG**: دعم قراء الشاشة والتنقل بلوحة المفاتيح
- **تباين عالي**: ألوان محسنة للقراءة
- **تحسينات اللمس**: مساحة لمس مناسبة للجوال

### ⚡ الأداء والتحليلات
- **Hardware Acceleration**: تأثيرات محسنة للأداء
- **تحديث تلقائي**: تحديث دوري للبيانات
- **تتبع التفاعلات**: تسجيل النقرات للتحليل
- **Cache ذكي**: تخزين مؤقت للبيانات

## 🏗️ الهيكل

### الملفات الأساسية

```
components/
├── ui/
│   └── WordCloud.tsx                    # المكون الأساسي
├── home/
│   └── HomeWordCloudEnhanced.tsx        # مكون الصفحة الرئيسية
│
types/
└── word-cloud.ts                        # أنواع البيانات
│
hooks/
└── useWordCloud.ts                      # React Hooks
│
styles/
├── word-cloud.css                       # أنماط أساسية
├── word-cloud-mobile.css                # تحسينات الجوال
└── word-cloud-mobile-advanced.css       # تحسينات متقدمة
│
app/
├── api/analytics/
│   ├── trending-keywords/route.ts       # API البيانات
│   └── word-click/route.ts              # API التحليلات
│
└── test-word-cloud/page.tsx             # صفحة الاختبار
```

## 🚀 الاستخدام

### الاستخدام الأساسي

```tsx
import WordCloud from '@/components/ui/WordCloud';
import { WordItem } from '@/types/word-cloud';

const words: WordItem[] = [
  {
    id: '1',
    text: 'السعودية',
    weight: 95,
    count: 156,
    colorKey: 'geo',
    trend: 'up',
    href: '/search?q=السعودية'
  }
  // المزيد من الكلمات...
];

function MyComponent() {
  const handleWordSelect = (word: WordItem) => {
    console.log('تم اختيار:', word.text);
  };

  return (
    <WordCloud
      words={words}
      onSelect={handleWordSelect}
      showTrends={true}
      enableTooltip={true}
      maxWords={30}
    />
  );
}
```

### الاستخدام المتقدم مع Hook

```tsx
import { useWordCloud, useWordCloudInteractions } from '@/hooks/useWordCloud';
import WordCloud from '@/components/ui/WordCloud';

function AdvancedWordCloud() {
  const { words, loading, error, refresh } = useWordCloud({
    maxWords: 25,
    timeframe: '7d',
    enableAutoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 دقائق
  });

  const { handleWordSelect } = useWordCloudInteractions({
    trackAnalytics: true,
    onWordClick: (word) => {
      // منطق مخصص
    }
  });

  return (
    <WordCloud
      words={words}
      loading={loading}
      error={error}
      onSelect={handleWordSelect}
    />
  );
}
```

## 🎨 فئات الألوان

| الفئة | اللون | الاستخدام |
|-------|--------|----------|
| `politics` | <span style="color: #F59E0B">🟡 Amber</span> | السياسة والحكومة |
| `conflict` | <span style="color: #EC4899">🩷 Pink</span> | الصراعات والحروب |
| `economy` | <span style="color: #10B981">🟢 Emerald</span> | الاقتصاد والمال |
| `geo` | <span style="color: #60A5FA">🔵 Blue</span> | الدول والمدن |
| `sports` | <span style="color: #8B5CF6">🟣 Violet</span> | الرياضة |
| `tech` | <span style="color: #06B6D4">🔷 Cyan</span> | التكنولوجيا |
| `misc` | <span style="color: #A78BFA">🟤 Purple</span> | متفرقات |

## 📊 API البيانات

### جلب الكلمات الشائعة

```http
GET /api/analytics/trending-keywords?limit=30&timeframe=7d
```

### تسجيل التفاعلات

```http
POST /api/analytics/word-click
Content-Type: application/json

{
  "wordId": "keyword-1",
  "clickedAt": "2025-01-28T10:30:00.000Z",
  "source": "word-cloud"
}
```

## 🎯 خصائص المكون

### WordCloud Props

| الخاصية | النوع | افتراضي | الوصف |
|---------|------|---------|-------|
| `words` | `WordItem[]` | `[]` | مصفوفة الكلمات |
| `onSelect` | `(word: WordItem) => void` | - | معالج اختيار الكلمة |
| `loading` | `boolean` | `false` | حالة التحميل |
| `error` | `string \| null` | `null` | رسالة خطأ |
| `maxWords` | `number` | `50` | عدد الكلمات الأقصى |
| `showTrends` | `boolean` | `true` | عرض أيقونات الاتجاه |
| `enableTooltip` | `boolean` | `true` | تفعيل التلميحات |
| `className` | `string` | `''` | فئات CSS إضافية |

### WordItem Interface

```typescript
interface WordItem {
  id: string;          // معرف فريد
  text: string;        // النص المعروض
  weight: number;      // الوزن (1-100)
  count?: number;      // عدد التكرار
  colorKey?: string;   // فئة اللون
  trend?: Trend;       // الاتجاه
  href?: string;       // الرابط
}

type Trend = "up" | "down" | "flat" | null;
```

## 🔧 التخصيص

### CSS مخصص

```css
/* تخصيص الألوان */
.word-cloud-item {
  --custom-hover-color: #3b82f6;
}

/* تخصيص الخطوط */
.word-cloud-container {
  font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
}
```

### تخصيص الأحجام

```typescript
// تخصيص دالة حساب الخط
const customScaleFont = (weight: number) => {
  return 12 + (weight / 100) * 48; // من 12px إلى 60px
};
```

## 📱 نقاط الكسر (Breakpoints)

| الحجم | العرض | حجم الخط |
|-------|-------|----------|
| موبايل صغير | < 480px | 14-36px |
| موبايل | 480-768px | 16-42px |
| تابلت | 768-1024px | 18-54px |
| ديسكتوب | > 1024px | 20-64px |

## 🧪 الاختبار

### تشغيل صفحة الاختبار

```bash
# تشغيل الخادم المحلي
npm run dev

# فتح صفحة الاختبار
http://localhost:3001/test-word-cloud
```

### اختبارات الوحدة (مقترحة)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import WordCloud from '@/components/ui/WordCloud';

test('يعرض الكلمات بشكل صحيح', () => {
  const words = [
    { id: '1', text: 'السعودية', weight: 80 }
  ];
  
  render(<WordCloud words={words} />);
  expect(screen.getByText('السعودية')).toBeInTheDocument();
});
```

## 🚀 نصائح الأداء

### 1. تحسين عدد الكلمات
```typescript
// الحد الأمثل للأداء
<WordCloud maxWords={30} />
```

### 2. تحديث ذكي
```typescript
// تحديث كل 5 دقائق فقط
const { words } = useWordCloud({
  refreshInterval: 5 * 60 * 1000,
  enableAutoRefresh: true
});
```

### 3. تحسين الذاكرة
```typescript
// استخدم useMemo للبيانات الثقيلة
const processedWords = useMemo(() => 
  words.map(processWord), [words]
);
```

## 🛠️ التطوير والصيانة

### إضافة فئة لون جديدة

1. **تحديث التعداد:**
```typescript
// types/word-cloud.ts
export type ColorCategory = 'politics' | 'economy' | 'newCategory';
```

2. **إضافة اللون:**
```typescript
// components/ui/WordCloud.tsx
const colorMap: Record<ColorCategory, string> = {
  // ...ألوان موجودة
  newCategory: '#FF6B6B'
};
```

3. **تحديث التصنيف:**
```typescript
// app/api/analytics/trending-keywords/route.ts
if (text.includes('keyword')) {
  colorKey = 'newCategory';
}
```

### إضافة تأثير جديد

```css
/* styles/word-cloud.css */
.word-cloud-item.special-effect {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## 📈 التحليلات والمقاييس

### مقاييس الأداء
- تحميل البيانات: < 200ms
- عرض الكلمات: < 100ms
- تفاعل المستخدم: < 50ms
- استهلاك الذاكرة: < 10MB

### مقاييس المستخدم
- معدل النقر: تتبع النقرات على الكلمات
- الكلمات الأكثر شعبية: الأكثر نقراً
- أوقات الذروة: أكثر أوقات الاستخدام

## 🔮 الميزات المستقبلية

### قيد التطوير
- [ ] تخطيط سحابة حقيقي مع d3-cloud
- [ ] أنيميشن متقدم للانتقالات
- [ ] دعم الثيمات المتعددة
- [ ] تصدير الصورة
- [ ] مشاركة اجتماعية

### مقترحات
- [ ] دعم اللغات المتعددة
- [ ] تكامل مع Google Analytics
- [ ] API للتحكم عن بعد
- [ ] وضع ملء الشاشة

---

## 📞 الدعم والمساهمة

للاستفسارات أو المساهمة في التطوير، يرجى إنشاء issue في المستودع أو التواصل مع فريق التطوير.

**آخر تحديث:** يناير 2025  
**الإصدار:** 2.0.0  
**التوافق:** Next.js 15.4.1+, React 18+
