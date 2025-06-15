# 📋 توثيق نظام القوالب - صحيفة سبق

## 🎯 نظرة عامة
نظام القوالب في صحيفة سبق يوفر تحكماً كاملاً وذكياً في العناصر الثابتة والتصميمية للموقع، مع إمكانية التخصيص الديناميكي حسب الوقت، المناسبة، الموقع الجغرافي، ونوع المستخدم.

## 🏗️ البنية التقنية

### قاعدة البيانات
```sql
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('header', 'footer', 'sidebar', 'banner')) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  country_code TEXT,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  created_by INT REFERENCES users(id),
  updated_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### الملفات الرئيسية
- `/app/dashboard/templates/page.tsx` - الصفحة الرئيسية
- `/app/dashboard/templates/components/TemplatesList.tsx` - قائمة القوالب
- `/app/dashboard/templates/components/TemplateEditor.tsx` - محرر القوالب
- `/app/dashboard/templates/components/editors/HeaderEditor.tsx` - محرر الهيدر
- `/app/dashboard/templates/components/editors/FooterEditor.tsx` - محرر الفوتر

## 📝 أنواع القوالب

### 1️⃣ قوالب الهيدر (Header Templates)

#### المكونات:
- **الشعار**
  - رابط الصورة (URL)
  - النص البديل (Alt text)
  - الأبعاد (Width × Height)
  
- **قوائم التنقل**
  - إضافة/حذف/ترتيب الروابط
  - تخصيص النصوص والوجهات
  
- **الشريط العلوي**
  - الأخبار العاجلة
  - التاريخ والوقت
  - حالة الطقس
  - ألوان مخصصة
  
- **روابط التواصل الاجتماعي**
  - دعم 9 منصات (Twitter, Facebook, Instagram, YouTube, LinkedIn, TikTok, Snapchat, Telegram, WhatsApp)
  
- **المظهر العام**
  - اللون الأساسي
  - لون الخلفية

### 2️⃣ قوالب الفوتر (Footer Templates)

#### المكونات:
- **أقسام الفوتر**
  - عناوين الأقسام
  - روابط متعددة لكل قسم
  - ترتيب ديناميكي
  
- **النشرة البريدية**
  - تفعيل/تعطيل
  - عنوان مخصص
  - وصف
  
- **تطبيقات الجوال**
  - رابط App Store
  - رابط Google Play
  
- **حقوق النشر**
  - نص قابل للتخصيص
  - دعم المتغيرات الديناميكية ({year})

## 🎛️ ميزات التحكم

### الجدولة الزمنية
- تحديد تاريخ البداية والنهاية
- تفعيل تلقائي حسب التوقيت
- مثال: قالب رمضان (1-30 رمضان)

### الاستهداف الجغرافي
- تخصيص القوالب حسب الدولة
- رموز الدول المدعومة: SA, AE, KW, QA, BH, OM, EG, JO

### الربط بالتصنيفات
- قوالب مختلفة لكل قسم
- مثال: هيدر رياضي لقسم الرياضة

### نظام القوالب الافتراضية
- قالب افتراضي واحد لكل نوع
- تبديل سلس بين القوالب

## 🚀 دليل الاستخدام

### إنشاء قالب جديد
1. الانتقال إلى **القوالب** من القائمة الجانبية
2. اختيار نوع القالب (هيدر/فوتر/...)
3. النقر على **قالب جديد**
4. ملء المعلومات:
   - الاسم والوصف
   - التصميم والمحتوى
   - الشروط والجدولة
5. حفظ القالب

### تعديل قالب موجود
1. النقر على أيقونة **التعديل** ✏️
2. التنقل بين التبويبات:
   - **معلومات عامة**: الاسم والوصف والحالة
   - **التصميم**: المحتوى والعناصر
   - **الشروط والجدولة**: التوقيت والاستهداف
3. حفظ التغييرات

### تفعيل/تعطيل القوالب
- استخدام زر التبديل السريع
- القوالب النشطة تظهر بشارة خضراء

### تعيين قالب افتراضي
- النقر على أيقونة النجمة ⭐
- قالب واحد فقط يمكن أن يكون افتراضياً

## 🔌 API Endpoints

### جلب القوالب
```
GET /api/templates
GET /api/templates?type=header
```

### إنشاء قالب
```
POST /api/templates
Body: {
  name: string,
  type: string,
  content: object,
  settings: object
}
```

### تحديث قالب
```
PATCH /api/templates/:id
Body: { ...updatedFields }
```

### حذف قالب
```
DELETE /api/templates/:id
```

### تعيين كافتراضي
```
POST /api/templates/:id/set-default
```

## 📋 أمثلة عملية

### قالب رمضان
```json
{
  "name": "هيدر رمضان",
  "type": "header",
  "content": {
    "logo": {
      "url": "/images/sabq-logo-ramadan.svg"
    },
    "theme": {
      "primaryColor": "#4B0082",
      "specialBanner": {
        "text": "رمضان كريم",
        "icon": "🌙"
      }
    }
  },
  "starts_at": "2024-03-11",
  "ends_at": "2024-04-10"
}
```

### قالب اليوم الوطني السعودي
```json
{
  "name": "هيدر اليوم الوطني",
  "type": "header",
  "content": {
    "theme": {
      "primaryColor": "#006C35",
      "backgroundColor": "#FFFFFF"
    }
  },
  "country_code": "SA",
  "starts_at": "2024-09-20",
  "ends_at": "2024-09-25"
}
```

## 🔐 الصلاحيات المطلوبة

- `templates.view` - عرض القوالب
- `templates.create` - إنشاء قوالب جديدة
- `templates.update` - تعديل القوالب
- `templates.delete` - حذف القوالب

## 🛠️ ملاحظات للمطورين

### تخزين البيانات
- المحتوى يُخزن بصيغة JSONB في PostgreSQL
- الإعدادات الإضافية في حقل settings منفصل

### التوسع المستقبلي
- إمكانية إضافة أنواع قوالب جديدة (sidebar, banner)
- دعم المزيد من المتغيرات الديناميكية
- نظام معاينة متقدم
- تصدير/استيراد القوالب

### الأداء
- استخدام الفهارس لتسريع البحث
- تخزين مؤقت للقوالب النشطة
- تحديث تلقائي عند انتهاء الجدولة

## 📊 لوحة المراقبة

### إحصائيات القوالب
- عدد القوالب النشطة
- القوالب المجدولة القادمة
- معدل استخدام القوالب
- أكثر القوالب تبديلاً

### سجل النشاطات
- إنشاء/تعديل/حذف القوالب
- تغيير القوالب الافتراضية
- تفعيل/تعطيل القوالب

## 🎨 أفضل الممارسات

1. **التسمية الواضحة**: استخدام أسماء وصفية للقوالب
2. **الوصف المفيد**: شرح الغرض من القالب
3. **الجدولة الدقيقة**: التأكد من التواريخ والأوقات
4. **الاختبار**: معاينة القالب قبل التفعيل
5. **النسخ الاحتياطي**: الاحتفاظ بنسخة من القوالب المهمة

---

📅 آخر تحديث: ديسمبر 2024
🏢 صحيفة سبق الإلكترونية 