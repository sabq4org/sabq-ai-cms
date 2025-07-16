# تقرير إصلاح أولوية Redirect في تسجيل الدخول

## 📅 التاريخ: يناير 2025

## 🔴 المشكلة المكتشفة

عند محاولة الوصول لصفحة `/my-journey`:
1. يتم التوجيه بشكل صحيح إلى `/login?redirect=/my-journey`
2. بعد تسجيل الدخول، يتم التوجيه إلى `/dashboard` بدلاً من `/my-journey`

### السبب الأساسي

1. **كود التوجيه السابق**:
```typescript
const redirectPath = data.user?.is_admin ? '/dashboard' : '/';
setTimeout(() => {
  if (callbackUrl) {
    router.push(callbackUrl);
  } else {
    router.push(redirectPath);
  }
}, 500);
```

2. **مشكلة البيانات**: المستخدم `user@sabq.ai` كان لديه `is_admin: true` بالخطأ

## ✅ الحلول المطبقة

### 1. تحسين منطق التوجيه

تم تعديل `app/login/page.tsx` لإعطاء الأولوية لـ callbackUrl:

```typescript
// إعطاء الأولوية لـ callbackUrl إذا كان موجوداً
let redirectPath = '/';

if (callbackUrl) {
  redirectPath = callbackUrl;
} else if (data.user?.is_admin) {
  redirectPath = '/dashboard';
}

setTimeout(() => {
  router.push(redirectPath);
}, 500);
```

### 2. تصحيح بيانات المستخدم

تم تحديث المستخدم `user@sabq.ai`:
- **من**: `role: 'admin'`, `is_admin: true`
- **إلى**: `role: 'user'`, `is_admin: false`

## 📋 النتيجة

الآن عند تسجيل الدخول:
- ✅ إذا كان هناك redirect parameter، سيتم احترامه دائماً
- ✅ المدراء يذهبون إلى dashboard فقط إذا لم يكن هناك redirect
- ✅ المستخدمون العاديون يذهبون للصفحة الرئيسية إذا لم يكن هناك redirect

## 🧪 الاختبار

1. اذهب إلى: http://localhost:3000/my-journey
2. سجل دخولك بـ:
   - البريد: user@sabq.ai
   - كلمة المرور: Test@123456
3. **سيتم توجيهك إلى `/my-journey` مباشرة! ✅** 