# 🔧 دليل استكشاف أخطاء التفاعل (الإعجاب والحفظ)

## 🎯 المشكلة المبلغ عنها
عمليتا الإعجاب والحفظ في تفاصيل الخبر لا تعمل وتظهر خطأ.

## ✅ الإصلاحات المطبقة

### 1. إصلاح مسار useAuth
**المشكلة:** المكون `BasicLikeSave` كان يستخدم مسار خاطئ لـ useAuth
```typescript
// قبل الإصلاح ❌
import { useAuth } from '@/contexts/AuthContext';

// بعد الإصلاح ✅
import { useAuth } from '@/hooks/useAuth';
```

### 2. تحسين معالجة الأخطاء
**المشكلة:** رسائل خطأ غير واضحة
**الحل:** إضافة تشخيص مفصل:

```typescript
// إضافة console logs للتتبع
console.log('👍 محاولة إعجاب:', { articleId, like: newLikeStatus, userId: user.id });
console.log('📊 استجابة الإعجاب:', response.status, response.statusText);
console.log('📄 بيانات الاستجابة:', data);

// رسائل خطأ محسنة
alert(`حدث خطأ في الإعجاب: ${data.error || 'خطأ غير معروف'}`);
```

### 3. تشخيص حالة المصادقة
```typescript
// تشخيص حالة المصادقة
console.log('🔧 BasicLikeSave Debug:', {
  articleId,
  user: user ? { id: user.id, name: user.name } : null,
  authToken: authToken ? 'موجود' : 'غير موجود',
  initialLikes,
  initialSaves
});
```

## 🧪 كيفية اختبار الإصلاحات

### 1. اختبار يدوي في المتصفح
1. افتح Developer Tools (F12)
2. انتقل إلى تبويب Console
3. اذهب إلى أي مقال في `/news/[slug]`
4. جرب الضغط على أزرار الإعجاب والحفظ
5. راقب الرسائل في Console

### 2. اختبار APIs باستخدام السكريبت
```bash
# تشغيل اختبار APIs
node test-interactions.js
```

### 3. فحص Network Tab
1. افتح Developer Tools
2. انتقل إلى تبويب Network
3. اضغط على زر الإعجاب أو الحفظ
4. تحقق من الطلبات المرسلة:
   - `/api/interactions/like` للإعجاب
   - `/api/bookmarks` للحفظ
   - `/api/interactions/user-status` لجلب الحالة

## 🔍 الأخطاء المحتملة وحلولها

### خطأ 401 Unauthorized
**السبب:** المستخدم غير مسجل الدخول أو انتهت صلاحية الجلسة
**الحل:**
1. تأكد من تسجيل الدخول
2. تحقق من وجود token في localStorage أو cookies
3. جرب تسجيل الخروج والدخول مرة أخرى

### خطأ 404 Article not found
**السبب:** معرف المقال غير صحيح
**الحل:**
1. تأكد من أن المقال موجود في قاعدة البيانات
2. تحقق من صحة articleId المرسل

### خطأ 500 Internal Server Error
**السبب:** خطأ في الخادم أو قاعدة البيانات
**الحل:**
1. تحقق من logs الخادم
2. تأكد من اتصال قاعدة البيانات
3. تحقق من صحة JWT_SECRET

### لا يظهر المستخدم (user = null)
**السبب:** مشكلة في useAuth hook
**الحل:**
1. تأكد من وجود AuthProvider في التطبيق
2. تحقق من صحة JWT token
3. تأكد من تحديث useAuth hook

## 📊 APIs المستخدمة

### 1. جلب حالة المستخدم
```
GET /api/interactions/user-status?articleId={id}
Headers: Authorization: Bearer {token}
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "isAuthenticated": true,
  "liked": false,
  "saved": false,
  "likesCount": 0,
  "savesCount": 0
}
```

### 2. الإعجاب
```
POST /api/interactions/like
Headers: Authorization: Bearer {token}
Body: { "articleId": "...", "like": true }
```

**الاستجابة المتوقعة:**
```json
{
  "liked": true,
  "likes": 1,
  "saves": 0
}
```

### 3. الحفظ
```
POST /api/bookmarks
Headers: Authorization: Bearer {token}
Body: { "articleId": "...", "saved": true }
```

**الاستجابة المتوقعة:**
```json
{
  "saved": true,
  "likes": 0,
  "saves": 1
}
```

## 🔧 أدوات التشخيص

### Console Messages
ابحث عن هذه الرسائل في Console:
- `🔧 BasicLikeSave Debug:` - معلومات التشخيص الأساسية
- `🔍 جلب حالة المستخدم للمقال:` - بداية جلب الحالة
- `👍 محاولة إعجاب:` - بداية عملية الإعجاب
- `💾 محاولة حفظ:` - بداية عملية الحفظ
- `✅ تم ... بنجاح` - نجاح العملية
- `❌ فشل ...` - فشل العملية

### Network Requests
تحقق من هذه الطلبات في Network tab:
- Status Code 200: نجح الطلب
- Status Code 401: غير مصرح
- Status Code 404: غير موجود
- Status Code 500: خطأ خادم

## 🚀 خطوات التحقق السريع

1. **تحقق من تسجيل الدخول:**
   ```javascript
   // في Console
   console.log('User:', localStorage.getItem('user'));
   console.log('Token:', localStorage.getItem('auth-token'));
   ```

2. **تحقق من معرف المقال:**
   ```javascript
   // في Console
   console.log('Article ID:', window.location.pathname.split('/').pop());
   ```

3. **اختبار API يدوياً:**
   ```javascript
   // في Console
   fetch('/api/interactions/user-status?articleId=YOUR_ARTICLE_ID', {
     headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth-token') }
   }).then(r => r.json()).then(console.log);
   ```

## 📞 الدعم الفني

إذا استمرت المشكلة بعد تطبيق هذه الحلول:
1. اجمع معلومات التشخيص من Console
2. التقط screenshot من Network tab
3. اذكر الخطوات المتبعة لإعادة إنتاج المشكلة
4. اذكر نوع المتصفح والإصدار

---

**آخر تحديث:** 2025-01-10
**الإصدار:** 1.0.0
