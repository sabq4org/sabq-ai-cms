# معالجة أخطاء التحليلات العميقة

## نظرة عامة

تم تحسين معالجة الأخطاء في بلوك التحليلات العميقة على الصفحة الرئيسية لضمان تجربة مستخدم سلسة حتى عند حدوث أخطاء في قاعدة البيانات.

## التحسينات المطبقة

### 1. معالجة الأخطاء في API

**الملف**: `app/api/deep-analyses/route.ts`

- إضافة التحقق من اتصال قاعدة البيانات قبل محاولة الاستعلام
- إرجاع مصفوفة فارغة بدلاً من بيانات خطأ في حالة فشل الاتصال
- تسجيل الأخطاء بشكل مفصل مع السياق

```typescript
// في حالة خطأ قاعدة البيانات
return NextResponse.json({
  success: false,
  analyses: [], // مصفوفة فارغة بدلاً من بيانات خطأ
  errorMessage: 'فشل الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.',
  // تفاصيل الخطأ في development فقط
});
```

### 2. معالجة الأخطاء في المكون

**الملف**: `components/DeepAnalysisBlock.tsx`

- التحقق من `success` في استجابة API
- عرض رسالة خطأ مناسبة للمستخدم
- زر إعادة المحاولة

```typescript
if (data.success === false) {
  throw new Error(data.errorMessage || 'حدث خطأ في جلب التحليلات');
}
```

### 3. معالجة الأخطاء في الصفحة الرئيسية

**الملف**: `app/page.tsx`

- التحقق من صحة البيانات قبل تمريرها للمكون
- إرجاع مصفوفة فارغة في حالة الخطأ

### 4. خدمة المراقبة

**الملف**: `lib/services/monitoring.ts`

خدمة مراقبة بسيطة لتسجيل الأخطاء وتتبعها:

```typescript
// تسجيل خطأ قاعدة البيانات
logDatabaseError(error, 'SELECT', 'deep_analyses');

// تسجيل خطأ API
logApiError(error, '/api/deep-analyses', 'GET', 500);
```

### 5. API عرض الأخطاء

**الملف**: `app/api/admin/errors/route.ts`

endpoint للإدارة لعرض الأخطاء الأخيرة:

```bash
# في development
curl http://localhost:3002/api/admin/errors

# في production (مع مفتاح الإدارة)
curl http://your-domain.com/api/admin/errors?key=YOUR_ADMIN_KEY
```

## متغيرات البيئة المطلوبة

```env
# في production
ADMIN_ERROR_KEY=your-secret-admin-key

# اختياري: لإرسال الأخطاء إلى webhook
ERROR_WEBHOOK_URL=https://your-webhook-url.com

# اختياري: لتكامل Sentry
SENTRY_DSN=your-sentry-dsn
```

## التشخيص في Production

### 1. عرض الأخطاء الأخيرة

```bash
curl https://your-domain.com/api/admin/errors?key=YOUR_ADMIN_KEY
```

### 2. مسح سجل الأخطاء

```bash
curl -X DELETE https://your-domain.com/api/admin/errors?key=YOUR_ADMIN_KEY
```

### 3. فحص حالة النظام

استجابة API تتضمن:
- حالة قاعدة البيانات
- استخدام الذاكرة
- وقت التشغيل
- آخر 20 خطأ

## أفضل الممارسات

1. **في Production**:
   - استخدم مفتاح إدارة قوي
   - قم بإعداد webhook لاستقبال الأخطاء
   - راقب السجلات بانتظام

2. **معالجة الأخطاء**:
   - دائماً أرجع مصفوفة فارغة بدلاً من بيانات خطأ
   - أظهر رسائل خطأ واضحة للمستخدم
   - قدم زر إعادة المحاولة

3. **التسجيل**:
   - سجل الأخطاء مع السياق الكامل
   - استخدم أنواع مختلفة للأخطاء (database, api, etc.)
   - احتفظ بتاريخ الأخطاء للتحليل

## مثال على معالجة خطأ قاعدة البيانات

عندما يحدث خطأ "فشل الاتصال بقاعدة البيانات":

1. **API** يرجع:
   ```json
   {
     "success": false,
     "analyses": [],
     "errorMessage": "فشل الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً."
   }
   ```

2. **المكون** يعرض:
   - رسالة خطأ واضحة
   - زر إعادة المحاولة
   - لا يتعطل التصميم

3. **خدمة المراقبة** تسجل:
   - تفاصيل الخطأ
   - السياق (endpoint, method, etc.)
   - الوقت والتاريخ 