# نظام تخصيص الشريط الجانبي في لوحة التحكم

## نظرة عامة

تم تطوير نظام تخصيص الشريط الجانبي لمنح مديري النظام القدرة على:
- **إعادة ترتيب** عناصر الشريط الجانبي بتقنية السحب والإفلات (Drag & Drop)
- **إخفاء أو إظهار** عناصر معينة حسب الحاجة
- **حفظ التفضيلات** بشكل شخصي لكل مدير

## الميزات الرئيسية

### 🎯 التخصيص الشخصي
- تفضيلات منفصلة لكل مدير
- حفظ آمن في الخادم
- استرداد تلقائي عند تسجيل الدخول

### 🔧 واجهة سهلة الاستخدام
- سحب وإفلات للترتيب
- مفاتيح تبديل للإظهار/الإخفاء
- معاينة مباشرة للتغييرات
- إعادة تعيين للوضع الافتراضي

### ⚡ الأداء المحسن
- تحميل مؤقت في localStorage للسرعة
- تحديث غير متزامن من الخادم
- واجهة مستجيبة

## المسارات والملفات

### 📁 بنية المشروع

```
├── app/
│   ├── api/user/preferences/sidebar/
│   │   └── route.ts                 # API endpoints
│   └── admin/settings/sidebar/
│       └── page.tsx                 # صفحة الإعدادات
├── components/admin/sidebar/
│   └── SidebarCustomizer.tsx        # مكون التخصيص الرئيسي
├── contexts/
│   └── SidebarPreferencesContext.tsx # سياق إدارة التفضيلات
└── components/admin/modern-dashboard/
    └── ModernSidebar.tsx            # الشريط الجانبي المحدث
```

### 🔗 المسارات المهمة

- **صفحة الإعدادات**: `/admin/settings/sidebar`
- **API جلب التفضيلات**: `GET /api/user/preferences/sidebar`
- **API حفظ التفضيلات**: `POST /api/user/preferences/sidebar`
- **API إعادة التعيين**: `DELETE /api/user/preferences/sidebar`

## كيفية الاستخدام

### للمديرين

1. **الوصول للإعدادات**
   - انتقل إلى `الإعدادات` > `تخصيص الشريط الجانبي`

2. **إعادة الترتيب**
   - اسحب العناصر من الرمز المخطط (⋮⋮)
   - أفلت في المكان المطلوب

3. **الإظهار/الإخفاء**
   - استخدم مفتاح التبديل (Switch) بجانب كل عنصر
   - العناصر المخفية ستظهر بشفافية

4. **حفظ التغييرات**
   - اضغط على زر "حفظ التغييرات"
   - ستظهر رسالة تأكيد النجاح

5. **إعادة التعيين**
   - اضغط "إعادة تعيين" للرجوع للوضع الافتراضي

### للمطورين

#### تشغيل النظام

```bash
# تثبيت المكتبات المطلوبة
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# تشغيل الخادم
npm run dev
```

#### إضافة عنصر جديد للشريط الجانبي

```typescript
// في ModernSidebar.tsx
const newItem = {
  id: "new-feature",
  title: "الميزة الجديدة",
  icon: Star,
  href: "/admin/new-feature",
  badge: "جديد",
  badgeVariant: "secondary" as const,
  isNew: true,
};

// أضف إلى sidebarItems array
```

#### استخدام تفضيلات الشريط الجانبي

```typescript
import { useSidebarPreferences } from '@/contexts/SidebarPreferencesContext';

function MyComponent() {
  const { preferences, loading, updatePreferences } = useSidebarPreferences();

  // استخدام التفضيلات...
}
```

## تفاصيل تقنية

### 🗄️ بنية البيانات

```typescript
interface SidebarPreferences {
  sidebar_order: string[];    // ترتيب العناصر
  sidebar_hidden: string[];   // العناصر المخفية
}
```

### 📡 API Endpoints

#### GET /api/user/preferences/sidebar
جلب تفضيلات المستخدم الحالي

**Response:**
```json
{
  "sidebar_order": ["dashboard", "news", "analytics"],
  "sidebar_hidden": ["comments", "media"]
}
```

#### POST /api/user/preferences/sidebar
حفظ تفضيلات جديدة

**Request Body:**
```json
{
  "sidebar_order": ["dashboard", "analytics", "news"],
  "sidebar_hidden": ["comments"]
}
```

#### DELETE /api/user/preferences/sidebar
إعادة تعيين للوضع الافتراضي

### 🔒 الأمان والصلاحيات

- **المصادقة**: مطلوبة لجميع العمليات
- **الصلاحيات**: مقتصرة على `system_admin` و `admin`
- **التخزين**: آمن في الخادم مع نسخ احتياطي في localStorage

### ⚡ الأداء

- **تحميل مؤقت**: localStorage للاستجابة السريعة
- **تحديث غير متزامن**: من الخادم في الخلفية
- **تحسين العرض**: useMemo للعناصر المُرتبة

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

1. **لا تظهر التغييرات**
   - تأكد من حفظ التفضيلات
   - حدث الصفحة
   - تحقق من وحدة التحكم للأخطاء

2. **السحب والإفلات لا يعمل**
   - تأكد من تثبيت مكتبات @dnd-kit
   - تحقق من وجود أخطاء JavaScript

3. **عدم ظهور بعض العناصر**
   - تحقق من قائمة العناصر المخفية
   - راجع أذونات المستخدم

### رسائل الأخطاء

- `غير مخول`: المستخدم غير مسجل دخول
- `هذه الميزة متاحة للمديرين فقط`: صلاحيات غير كافية
- `تنسيق البيانات غير صحيح`: خطأ في بنية البيانات المرسلة

## التطوير المستقبلي

### ميزات مقترحة

- [ ] مشاركة التفضيلات بين المديرين
- [ ] قوالب جاهزة للترتيب
- [ ] تصدير/استيراد التفضيلات
- [ ] إحصائيات استخدام العناصر
- [ ] ثيمات مخصصة للشريط الجانبي

### تحسينات تقنية

- [ ] دعم قواعد بيانات مختلفة
- [ ] تشفير التفضيلات
- [ ] نظام نسخ احتياطي متقدم
- [ ] API للتحكم البرمجي

## المساهمة

لإضافة ميزات جديدة أو إصلاح مشاكل:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. تطبيق التغييرات (`git commit -m 'Add amazing feature'`)
4. رفع للmain branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## الدعم

للحصول على المساعدة:
- 📧 تواصل مع فريق التطوير
- 📚 راجع التوثيق التفصيلي
- 🐛 أبلغ عن المشاكل في GitHub Issues

---

> **ملاحظة**: هذا النظام جزء من منصة "سبق الذكية" ويتطلب صلاحيات إدارية للوصول إليه.
