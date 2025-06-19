# 🔐 دليل نظام التوجيه الذكي لتسجيل الدخول

## 📋 نظرة عامة

تم تحديث نظام تسجيل الدخول لدعم التوجيه الذكي بناءً على:
1. **رابط الإرجاع المطلوب** (callbackUrl)
2. **نوع المستخدم** (مدير أو مستخدم عادي)

## 🎯 كيفية العمل

### 1️⃣ **التوجيه بناءً على رابط الإرجاع**

إذا كان هناك رابط محدد في URL parameters:
```
/login?callbackUrl=/profile
/login?redirectTo=/article/123
/login?returnTo=/dashboard/news
```

سيتم توجيه المستخدم إلى الرابط المطلوب بعد تسجيل الدخول بنجاح.

### 2️⃣ **التوجيه بناءً على نوع المستخدم**

إذا لم يكن هناك رابط محدد:
- **المديرون** (`is_admin: true`) → `/dashboard`
- **المستخدمون العاديون** (`is_admin: false`) → `/` (الصفحة الرئيسية)

## 🔑 بيانات الاختبار

### مستخدم مدير:
```
البريد: ali@alhazmi.org
كلمة المرور: 123456
التوجيه: /dashboard
```

### مستخدم عادي:
```
البريد: test@test.com
كلمة المرور: 123456
التوجيه: /
```

## 🛠️ الاستخدام في الكود

### حماية صفحة وإرسال المستخدم لتسجيل الدخول:
```typescript
if (!user) {
  router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
}
```

### في صفحة تسجيل الدخول:
```typescript
const searchParams = useSearchParams();
const callbackUrl = searchParams?.get('callbackUrl') || 
                   searchParams?.get('redirectTo') || 
                   searchParams?.get('returnTo');

// بعد تسجيل الدخول بنجاح
if (callbackUrl) {
  router.push(callbackUrl);
} else {
  router.push(user.is_admin ? '/dashboard' : '/');
}
```

## ⚙️ التكوين

### في API تسجيل الدخول (`/api/auth/login`):
- يتم تحديد `is_admin` بناءً على البريد الإلكتروني
- `ali@alhazmi.org` → مدير
- `test@test.com` → مستخدم عادي

### في صفحة تسجيل الدخول (`/login`):
- تقرأ query parameters لتحديد رابط الإرجاع
- تحدد الوجهة بناءً على نوع المستخدم إذا لم يكن هناك رابط محدد

## 🚀 أمثلة الاستخدام

### 1. تسجيل دخول من الصفحة الرئيسية:
```
/login → تسجيل دخول → / (للمستخدم العادي) أو /dashboard (للمدير)
```

### 2. محاولة الوصول لصفحة محمية:
```
/profile → إعادة توجيه → /login?returnTo=/profile → تسجيل دخول → /profile
```

### 3. رابط مباشر من بريد إلكتروني:
```
/login?callbackUrl=/article/special-offer → تسجيل دخول → /article/special-offer
```

---

**ملاحظة:** يتم تنظيف جميع الروابط للتأكد من أنها تبدأ بـ `/` لأسباب أمنية. 