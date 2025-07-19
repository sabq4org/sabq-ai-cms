# نظام تتبع تفاعلات المستخدم الذكي

## المميزات

### 1. تمييز التفاعلات السابقة
- القلب يصبح أحمر عند الإعجاب
- أيقونة الحفظ تصبح زرقاء عند الحفظ
- عرض عدد التفاعلات بشكل ديناميكي

### 2. تتبع سلوك القراءة
- **مدة القراءة**: من دخول الصفحة حتى الخروج
- **عمق التمرير**: نسبة المحتوى المقروء
- **سرعة القراءة**: كلمة/دقيقة
- **نوع التفاعل**:
  - `view`: مجرد مشاهدة (0-30%)
  - `read`: قراءة جزئية (30-70%)
  - `engage`: قراءة متقدمة (70-90%)
  - `complete`: قراءة كاملة (90%+)

### 3. نظام النقاط
- قراءة كاملة: 10 نقاط
- قراءة جيدة: 7 نقاط
- قراءة متوسطة: 5 نقاط
- قراءة سريعة: 3 نقاط
- إعجاب: 2 نقطة
- حفظ: 3 نقاط
- مشاركة: 5 نقاط
- تعليق: 10 نقاط

## الاستخدام

### في صفحة المقال

```tsx
import { SmartInteractionButtons } from '@/components/article/SmartInteractionButtons';
import { ReadingProgressBar } from '@/components/article/ReadingProgressBar';
import { useUserInteractionTracking } from '@/hooks/useUserInteractionTracking';

export function ArticlePage({ article }) {
  // تتبع التفاعلات تلقائياً
  const tracking = useUserInteractionTracking(article.id);

  return (
    <article>
      {/* شريط التقدم */}
      <ReadingProgressBar />
      
      {/* محتوى المقال */}
      <h1>{article.title}</h1>
      <div>{article.content}</div>
      
      {/* أزرار التفاعل الذكية */}
      <SmartInteractionButtons
        articleId={article.id}
        initialStats={{
          likes: article.likesCount,
          saves: article.savesCount,
          shares: article.sharesCount,
          comments: article.commentsCount,
        }}
        onComment={() => scrollToComments()}
      />
    </article>
  );
}
```

### في مكونات أخرى

```tsx
// استخدام Hook مباشرة
const { hasLiked, hasSaved, toggleLike, toggleSave } = useUserInteractionTracking(articleId);

// عرض حالة مخصصة
<button onClick={toggleLike} className={hasLiked ? 'text-red-500' : 'text-gray-400'}>
  {hasLiked ? 'أعجبتك' : 'إعجاب'}
</button>
```

## البيانات المتتبعة

### جلسة القراءة
```json
{
  "sessionId": "user123-article456-1234567890",
  "userId": "user123",
  "articleId": "article456",
  "enterTime": 1234567890,
  "exitTime": 1234567990,
  "duration": 100000,
  "scrollDepth": 0.85,
  "maxScrollDepth": 0.92,
  "interactionType": "engage",
  "interactions": {
    "liked": true,
    "saved": false,
    "shared": true,
    "commented": false,
    "clickCount": 15
  },
  "readingSpeed": 250,
  "deviceType": "mobile"
}
```

## التحليلات المتاحة

### للمحررين
- أكثر المقالات قراءة كاملة
- متوسط وقت القراءة لكل مقال
- معدل التفاعل (إعجاب/حفظ/مشاركة)
- أنماط القراءة حسب الوقت

### للمستخدمين
- سجل القراءة الشخصي
- المقالات المحفوظة
- نقاط الولاء المكتسبة
- إحصائيات القراءة الشخصية

## الخصوصية
- كل البيانات مرتبطة بالمستخدم المسجل فقط
- لا يتم تتبع المستخدمين غير المسجلين
- يمكن للمستخدم طلب حذف بياناته

## التطوير المستقبلي
- [ ] تتبع الوقت المستغرق في كل قسم
- [ ] heat map للأجزاء الأكثر قراءة
- [ ] توصيات ذكية بناءً على نمط القراءة
- [ ] تحليل المشاعر من التعليقات 