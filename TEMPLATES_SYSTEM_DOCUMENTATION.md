# 📋 توثيق نظام القوالب الديناميكية

## 🎯 نظرة عامة

تم تفعيل نظام القوالب بالكامل في لوحة التحكم مع جميع المزايا المطلوبة:

### ✅ المزايا المُفعّلة:

1. **ربط القوالب الفعالة بواجهة المستخدم** ✓
   - عند تعيين قالب كـ "نشط" يتم تحميله تلقائياً
   - دعم القوالب حسب التصنيف والصفحة

2. **تفعيل الجدولة الزمنية** ✓
   - حقول "تاريخ البداية" و"تاريخ النهاية" تعمل بشكل كامل
   - عرض القوالب فقط في الفترة الزمنية المحددة

3. **ربط القالب بالتصنيف** ✓
   - دعم ربط القالب بتصنيف محدد
   - عرض القالب فقط في صفحة التصنيف المحدد

4. **تفعيل المعاينة** ✓
   - زر معاينة مباشرة لكل قالب
   - صفحة معاينة مخصصة: `/preview/template/[token]`

5. **الشعار والمظهر** ✓
   - حقول الشعار كاملة (URL, Alt, Width, Height)
   - دعم الألوان المخصصة
   - أنماط CSS مخصصة

6. **الاستهداف الجغرافي** ✓
   - دعم عرض القوالب حسب الدولة
   - قائمة بالدول العربية الرئيسية

---

## 📁 هيكل الملفات

```
sabq-ai-cms-new/
├── database/
│   └── templates_system.sql          # سكيما قاعدة البيانات
├── lib/
│   └── services/
│       └── templateService.ts        # خدمة إدارة القوالب
├── types/
│   └── template.ts                   # أنواع TypeScript
├── hooks/
│   └── useTemplate.ts                # React hooks للقوالب
├── app/
│   ├── api/
│   │   └── templates/
│   │       ├── route.ts              # GET/POST للقوالب
│   │       ├── active/
│   │       │   └── route.ts          # الحصول على القالب النشط
│   │       └── [id]/
│   │           ├── route.ts          # GET/PATCH/DELETE
│   │           ├── set-default/
│   │           │   └── route.ts      # تعيين كافتراضي
│   │           └── preview/
│   │               └── route.ts      # إنشاء معاينة
│   ├── dashboard/
│   │   └── templates/
│   │       ├── page.tsx              # صفحة إدارة القوالب
│   │       └── components/
│   │           ├── TemplatesList.tsx # قائمة القوالب
│   │           └── TemplateEditor.tsx # محرر القوالب
│   └── preview/
│       └── template/
│           └── [token]/
│               └── page.tsx          # صفحة المعاينة
└── components/
    └── layout/
        ├── TemplateProvider.tsx      # موفر القوالب
        └── DynamicHeader.tsx         # هيدر ديناميكي

```

---

## 🔧 كيفية الاستخدام

### 1. في لوحة التحكم

```typescript
// الانتقال إلى صفحة القوالب
/dashboard/templates

// إنشاء قالب جديد
- اضغط على "قالب جديد"
- املأ البيانات المطلوبة
- حدد الجدولة والاستهداف
- احفظ القالب

// تفعيل قالب
- انقر على زر التبديل لتفعيل/تعطيل
- انقر على النجمة لتعيينه كافتراضي

// معاينة قالب
- انقر على أيقونة العين للمعاينة المباشرة
```

### 2. في الواجهة الأمامية

```tsx
// استخدام القوالب في Layout
import { TemplateProvider } from '@/components/layout/TemplateProvider'
import { DynamicHeader } from '@/components/layout/DynamicHeader'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TemplateProvider>
          <DynamicHeader />
          {children}
        </TemplateProvider>
      </body>
    </html>
  )
}
```

### 3. استخدام Hook للقوالب

```tsx
import { useTemplate } from '@/hooks/useTemplate'

function MyComponent() {
  const { template, loading, error } = useTemplate({
    type: 'header',
    categoryId: 1,
    countryCode: 'SA'
  })
  
  if (loading) return <div>جاري التحميل...</div>
  if (error) return <div>خطأ في تحميل القالب</div>
  if (!template) return <div>لا يوجد قالب نشط</div>
  
  return <div>{/* استخدم القالب */}</div>
}
```

---

## 📊 API Endpoints

### القوالب
- `GET /api/templates` - جلب جميع القوالب
- `POST /api/templates` - إنشاء قالب جديد
- `GET /api/templates/active` - جلب القالب النشط
- `GET /api/templates/[id]` - جلب قالب محدد
- `PATCH /api/templates/[id]` - تحديث قالب
- `DELETE /api/templates/[id]` - حذف قالب
- `POST /api/templates/[id]/set-default` - تعيين كافتراضي
- `POST /api/templates/[id]/preview` - إنشاء رابط معاينة

---

## 🎨 أنواع القوالب المدعومة

1. **header** - قالب رأس الصفحة
2. **footer** - قالب ذيل الصفحة
3. **sidebar** - قالب الشريط الجانبي
4. **article** - قالب عرض المقالات
5. **category** - قالب صفحات التصنيفات
6. **special** - قوالب المناسبات الخاصة

---

## 🚀 مثال كامل

### إنشاء قالب رمضان

```json
{
  "name": "قالب رمضان المبارك",
  "description": "قالب خاص بشهر رمضان مع ألوان وتصميم مميز",
  "type": "header",
  "is_active": true,
  "starts_at": "2024-03-11T00:00:00Z",
  "ends_at": "2024-04-10T23:59:59Z",
  "logo_url": "/images/ramadan-logo.png",
  "logo_alt": "شعار رمضان",
  "primary_color": "#1a365d",
  "secondary_color": "#fbbf24",
  "custom_styles": ".header { background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); }",
  "content": {
    "navigation": {
      "items": [
        { "label": "الرئيسية", "url": "/" },
        { "label": "رمضانيات", "url": "/ramadan" },
        { "label": "مواقيت الصلاة", "url": "/prayer-times" }
      ]
    }
  }
}
```

---

## 🔒 الصلاحيات المطلوبة

- `templates.view` - عرض القوالب
- `templates.create` - إنشاء قوالب جديدة
- `templates.update` - تحديث القوالب
- `templates.delete` - حذف القوالب

---

## 📝 ملاحظات مهمة

1. **الأولوية في عرض القوالب:**
   - قالب مرتبط بتصنيف محدد
   - قالب مستهدف لدولة محددة
   - قالب افتراضي عام

2. **القوالب الافتراضية:**
   - لا يمكن حذف قالب افتراضي
   - عند تعيين قالب كافتراضي، يتم تفعيله تلقائياً

3. **معاينة القوالب:**
   - روابط المعاينة صالحة لمدة 24 ساعة
   - يمكن الوصول للمعاينة بدون تسجيل دخول

---

## 🎯 الخطوات التالية الموصى بها

1. **إضافة محرر مرئي للقوالب** - استخدام drag & drop
2. **دعم المزيد من أنواع القوالب** - homepage, newsletter
3. **نظام نسخ احتياطي للقوالب** - تصدير/استيراد
4. **إحصائيات استخدام القوالب** - تتبع الأداء
5. **A/B Testing للقوالب** - اختبار فعالية القوالب

---

تم التنفيذ بواسطة: فريق التطوير
التاريخ: {{ التاريخ الحالي }} 