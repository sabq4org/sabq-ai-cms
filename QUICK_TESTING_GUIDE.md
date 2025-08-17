# دليل اختبار نظام التفاعلات الجديد 🧪

## 🚀 كيفية الاختبار

### 1. التشغيل المحلي
```bash
npm run dev
# التطبيق يعمل على: http://localhost:3001
```

### 2. اختبار API مباشرة

#### اختبار جلب التفاعلات:
```bash
curl -H "user-id: 123" -H "user-name: علي" "http://localhost:3001/api/interactions/test?user_id=123"
```

#### اختبار إضافة إعجاب:
```bash
curl -X POST -H "Content-Type: application/json" -H "user-id: 123" -H "user-name: علي" \
  -d '{"article_id":"test-123","type":"like"}' \
  "http://localhost:3001/api/interactions/test"
```

#### اختبار إضافة حفظ:
```bash
curl -X POST -H "Content-Type: application/json" -H "user-id: 123" -H "user-name: علي" \
  -d '{"article_id":"test-123","type":"save"}' \
  "http://localhost:3001/api/interactions/test"
```

### 3. اختبار تلقائي
```bash
# اختبار Mock Database
node test-mock-api.js

# اختبار التكامل (يتطلب تشغيل التطبيق)
node test-integration.js
```

## 📱 اختبار الواجهة الأمامية

### خطوات التفعيل:
1. **تحديث _app.tsx أو layout.tsx**:
```tsx
import UserInteractionInitializer from '@/components/UserInteractionInitializer';

// إضافة في المكون الجذر:
<UserInteractionInitializer />
```

2. **في مكونات التفاعل**:
```tsx
import { useUserInteractions } from '@/stores/userInteractions';

const InteractionButton = ({ articleId }) => {
  const { toggleInteraction, getInteractionState } = useUserInteractions();
  const { liked, saved } = getInteractionState(articleId);
  
  return (
    <button onClick={() => toggleInteraction(articleId, 'like')}>
      {liked ? '❤️' : '🤍'} إعجاب
    </button>
  );
};
```

## 🔧 تبديل قاعدة البيانات

### استخدام Mock Database (حالي):
- API Endpoint: `/api/interactions/test`
- البيانات محفوظة في الذاكرة
- مثالي للتطوير والاختبار

### استخدام Real Database (عند إصلاح Supabase):
- API Endpoint: `/api/interactions/unified`
- البيانات محفوظة في PostgreSQL
- للإنتاج الفعلي

## ⚡ نصائح الاختبار

### 1. فحص Console Logs:
- راقب رسائل "🧪 Using Mock Database"
- تأكد من عمل Store initialization

### 2. فحص Network Tab:
- ابحث عن calls للـ `/api/interactions/test`
- تأكد من Response format صحيح

### 3. فحص localStorage:
```javascript
// في Developer Tools Console:
console.log(localStorage.getItem('sabq_user_interactions'));
console.log(localStorage.getItem('sabq_user_id'));
```

## 🐛 مشاكل محتملة وحلولها

### المشكلة: API calls تفشل
**الحل**: تأكد من تشغيل `npm run dev` وأن التطبيق على المنفذ الصحيح

### المشكلة: Store لا يحفظ البيانات
**الحل**: تأكد من وجود `UserInteractionInitializer` في المكون الجذر

### المشكلة: Authentication errors
**الحل**: تأكد من وجود `user-id` في localStorage أو headers

## 📊 توقع النتائج

### ✅ ما يجب أن يعمل:
- إضافة/إزالة التفاعلات
- استمرارية البيانات بعد إعادة التحميل
- عرض العدد الصحيح للتفاعلات
- عمل Toggle functionality

### ⚠️ قيود النظام الحالي:
- البيانات تختفي عند إعادة تشغيل الخادم
- لا يوجد مشاركة بين المستخدمين
- يعمل في وضع التطوير فقط

---

**آخر تحديث**: 17 أغسطس 2025
**Commit Hash**: 2110e5e3
**النتيجة المتوقعة**: ✅ نظام تفاعلات كامل وفعال للاختبار
