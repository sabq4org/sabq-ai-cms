# أدوات التشخيص المتقدمة للمصادقة - DEBUG AUTH TOOLS

## نظرة عامة

تحتوي هذه الأدوات على مجموعة شاملة من أدوات التشخيص والفحص للنظام المصادقة الموحد في سبق الذكية.

## الملفات والوظائف

### 1. `lib/authClient.ts`
- **عميل المصادقة الأساسي** مع Single-flight refresh
- منع حلقات 401/refresh اللانهائية
- إدارة التوكن في الذاكرة فقط
- Rate limiting للـ refresh attempts

**الوظائف الرئيسية:**
- `ensureAccessToken()` - ضمان وجود توكن صالح
- `performTokenRefresh()` - تحديث التوكن مع منع السباقات  
- `clearSession()` - تنظيف الجلسة شاملاً
- `validateSession()` - فحص صحة الجلسة

### 2. `lib/debug-tools.ts`
- **أدوات التشخيص العامة** للمصادقة
- فحص التوكن وحالة الكوكيز
- اختبار endpoints مختلفة
- إعادة التعيين الشاملة

**الوظائف المتاحة:**
- `debugAuthState()` - فحص شامل لحالة المصادقة
- `testTokenWithEndpoint(endpoint)` - اختبار التوكن على endpoint محدد
- `compareTokens()` - مقارنة التوكن في الذاكرة vs الكوكيز
- `resetEverything()` - إعادة تعيين شاملة

### 3. `lib/loyalty-debug.ts`
- **أدوات متخصصة** لتشخيص مشاكل `/profile/me/loyalty`
- فحص متقدم للـ 401 المستمر
- تحليل الكوكيز والتوكن
- اختبارات مخصصة للـ loyalty endpoint

**الوظائف المتخصصة:**
- `diagnoseLoyaltyEndpoint()` - تشخيص شامل لنقطة loyalty
- `quickTokenTest()` - اختبار سريع على endpoints متعددة
- `analyzeCookies()` - تحليل تفصيلي للكوكيز
- `resetAuthCompletely()` - إعادة تعيين طوارئ شاملة

## كيفية الاستخدام

### في وضع التطوير

الأدوات متاحة تلقائياً في وحدة التحكم:

```javascript
// الأدوات العامة
debugAuth.debugAuthState()                    // فحص شامل للمصادقة
debugAuth.testToken('/api/profile/me')        // اختبار endpoint محدد
debugAuth.compareTokens()                     // مقارنة التوكن والكوكيز
debugAuth.resetEverything()                   // إعادة تعيين شاملة

// أدوات Loyalty المتخصصة
debugLoyalty.diagnoseLoyaltyEndpoint()        // تشخيص مشكلة 401 في loyalty
debugLoyalty.quickTokenTest()                 // اختبار سريع متعدد
debugLoyalty.analyzeCookies()                 // تحليل الكوكيز
debugLoyalty.resetAuthCompletely()            // إعادة تعيين طوارئ
```

### سيناريوهات الاستخدام

#### 1. تشخيص 401 مستمر على loyalty endpoint
```javascript
debugLoyalty.diagnoseLoyaltyEndpoint()
```
هذا سيقوم بـ:
- فحص التوكن الحالي وصلاحيته
- محاولة أولى بالتوكن الحالي
- تحديث التوكن إذا فشلت
- محاولة ثانية بالتوكن الجديد
- تحليل مفصل للمشكلة إذا استمر 401

#### 2. فحص عام لحالة المصادقة
```javascript
debugAuth.debugAuthState()
```

#### 3. اختبار endpoints متعددة
```javascript
debugLoyalty.quickTokenTest()
```

#### 4. مقارنة التوكن في الذاكرة مع الكوكيز
```javascript
debugAuth.compareTokens()
```

#### 5. إعادة تعيين شاملة للمصادقة
```javascript
debugLoyalty.resetAuthCompletely()
// أو للأدوات العامة
debugAuth.resetEverything()
```

## المميزات المتقدمة

### Single-flight Refresh
- منع تعدد طلبات refresh في نفس الوقت
- استخدام Promise واحد لجميع الطلبات المتزامنة

### Rate Limiting
- حد أقصى للمحاولات (1 محاولة)
- فترة انتظار بين المحاولات (30 ثانية)
- منع spam الخادم

### Memory-only Token Storage
- عدم حفظ التوكن في localStorage
- منع تسريب التوكن
- تنظيف تلقائي عند إغلاق الجلسة

### Cookie Priority System
- نظام أولوية للكوكيز الموحدة vs القديمة
- دعم fallback للكوكيز القديمة
- تشخيص تداخل الكوكيز

## التحميل التلقائي

الأدوات تتحمل تلقائياً في وضع التطوير عبر `components/DevToolsFix.tsx`:

```typescript
import('@/lib/debug-tools')     // الأدوات العامة
import('@/lib/loyalty-debug')   // أدوات loyalty
```

## رسائل الـ Console

الأدوات تستخدم رموز تعبيرية واضحة:
- 🔍 فحص وتشخيص
- 🧪 اختبارات
- ✅ نجاح
- ❌ فشل
- 🔄 تحديث التوكن
- 🍪 الكوكيز
- 🎯 loyalty محدد
- 🆘 طوارئ

## استكشاف الأخطاء

### إذا لم تظهر الأدوات في Console:
1. تأكد من وضع development: `process.env.NODE_ENV === 'development'`
2. تحقق من تحميل `DevToolsFix` في المكونات
3. افتح Developer Tools وتحديث الصفحة

### إذا استمر 401 بعد refresh:
1. استخدم `debugLoyalty.diagnoseLoyaltyEndpoint()`
2. تحقق من الكوكيز بـ `debugLoyalty.analyzeCookies()`
3. جرب إعادة تعيين شاملة: `debugLoyalty.resetAuthCompletely()`

### إذا كان التوكن غير متطابق:
1. استخدم `debugAuth.compareTokens()`
2. تحقق من نظام أولوية الكوكيز
3. امسح الكوكيز القديمة يدوياً

## الأمان

- الأدوات متاحة **فقط في وضع التطوير**
- لا تحتفظ بالتوكن في localStorage
- تنظيف تلقائي للبيانات الحساسة
- حماية من Rate limiting attacks

---

**ملاحظة**: هذه الأدوات مصممة لحل مشكلة 401 المستمر على `/profile/me/loyalty` وتطوير نظام مصادقة مستقر.
