# خطة التدوير للنظام الموحد للمصادقة
# Rollback Plan for Unified Authentication System

## 🎯 **ملخص الإصلاحات المُطبقة**

### الملفات المُحدَثة:

1. **lib/auth-cookies-unified.ts** ✅
   - نظام كوكيز موحد مع __Host- prefixes
   - إدارة CORS محسنة
   - دعم عدة أنواع من الكوكيز

2. **app/api/auth/login/route.ts** ✅
   - استخدام النظام الموحد للكوكيز
   - معالجة أخطاء محسنة
   - CORS headers مُوحدة

3. **app/api/auth/logout/route.ts** ✅
   - مسح شامل للكوكيز
   - استجابة موحدة

4. **app/api/auth/refresh/route.ts** ✅
   - تجديد التوكنز المحسن
   - معالجة أخطاء شاملة

5. **app/api/auth/me/route.ts** ✅
   - استخراج موحد للتوكنز
   - آليات احتياطية محسنة

6. **app/api/auth/refresh-token/route.ts** ✅ (جديد)
   - للتوافق مع النظام القديم

7. **lib/auth/user-management.ts** ✅
   - إصلاح واجهة AuthResult
   - دعم JWT محسن

8. **lib/api-client.ts** ✅ (تم الاستبدال)
   - نظام refresh محسن
   - معالجة أخطاء شاملة
   - دعم النظام الموحد

9. **contexts/AuthContext.tsx** ✅
   - تكامل مع النظام الموحد
   - معالجة race conditions
   - debouncing محسن

10. **middleware.ts** ✅
    - حماية المسارات المحمية
    - دعم النظام الموحد
    - rate limiting محسن

---

## 🔄 **خطة التدوير (Rollback Plan)**

### المرحلة 1: التدوير السريع (5 دقائق)

```bash
# 1. إنشاء نسخة احتياطية من الملفات الحالية
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp lib/auth-cookies-unified.ts backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp app/api/auth/login/route.ts backup/$(date +%Y%m%d_%H%M%S)/
cp app/api/auth/logout/route.ts backup/$(date +%Y%m%d_%H%M%S)/
cp app/api/auth/refresh/route.ts backup/$(date +%Y%m%d_%H%M%S)/
cp app/api/auth/me/route.ts backup/$(date +%Y%m%d_%H%M%S)/
cp lib/auth/user-management.ts backup/$(date +%Y%m%d_%H%M%S)/
cp lib/api-client.ts backup/$(date +%Y%m%d_%H%M%S)/
cp contexts/AuthContext.tsx backup/$(date +%Y%m%d_%H%M%S)/
cp middleware.ts backup/$(date +%Y%m%d_%H%M%S)/

# 2. استرداد النسخ السابقة (إذا توفرت)
git checkout HEAD~1 -- lib/api-client.ts
git checkout HEAD~1 -- contexts/AuthContext.tsx
git checkout HEAD~1 -- app/api/auth/login/route.ts
git checkout HEAD~1 -- app/api/auth/logout/route.ts
git checkout HEAD~1 -- app/api/auth/refresh/route.ts
git checkout HEAD~1 -- app/api/auth/me/route.ts
git checkout HEAD~1 -- lib/auth/user-management.ts
git checkout HEAD~1 -- middleware.ts

# 3. إزالة الملفات الجديدة
rm -f lib/auth-cookies-unified.ts
rm -f app/api/auth/refresh-token/route.ts

# 4. إعادة تشغيل التطبيق
npm run build
npm start
```

### المرحلة 2: التدوير المتدرج (15 دقيقة)

إذا فشل التدوير السريع، اتبع هذه الخطوات:

1. **إيقاف الخدمة**
   ```bash
   pm2 stop all # أو
   pkill -f "next"
   ```

2. **استرداد تدريجي**
   ```bash
   # استرداد ملف تلو الآخر
   git checkout HEAD~1 -- contexts/AuthContext.tsx
   git checkout HEAD~1 -- lib/api-client.ts
   git checkout HEAD~1 -- app/api/auth/
   git checkout HEAD~1 -- lib/auth/user-management.ts
   git checkout HEAD~1 -- middleware.ts
   ```

3. **تنظيف الكوكيز في قاعدة البيانات (إن وُجدت)**
   ```sql
   -- إذا كانت الكوكيز مخزنة في قاعدة البيانات
   DELETE FROM user_sessions WHERE created_at > '2024-12-26';
   ```

4. **إعادة البناء والتشغيل**
   ```bash
   npm run build
   npm start
   ```

---

## 📋 **قائمة التحقق قبل النشر**

### ✅ **اختبارات الوظائف الأساسية**

- [ ] تسجيل الدخول يعمل بنجاح
- [ ] تسجيل الخروج ينظف الكوكيز
- [ ] تجديد التوكن يحدث تلقائياً
- [ ] بيانات المستخدم تُسترد بنجاح
- [ ] الكوكيز تُضبط بشكل صحيح
- [ ] CORS يعمل للمتصفحات المختلفة

### ✅ **اختبارات الاستقرار**

- [ ] 100 عملية refresh متتالية بدون فشل
- [ ] 50 عملية "إعجاب" بدون انقطاع الجلسة
- [ ] الجلسة تستمر لـ 24 ساعة (أو حسب الإعداد)
- [ ] لا توجد race conditions في AuthContext
- [ ] لا توجد تسربات في الذاكرة

### ✅ **اختبارات الأمان**

- [ ] الكوكيز تستخدم Secure و HttpOnly
- [ ] __Host- prefixes تعمل في HTTPS
- [ ] الكوكيز تُمسح عند تسجيل الخروج
- [ ] JWT tokens لها expiry صحيح
- [ ] Rate limiting يعمل للـ API endpoints

### ✅ **اختبارات التوافق**

- [ ] يعمل في Chrome
- [ ] يعمل في Firefox
- [ ] يعمل في Safari
- [ ] يعمل في Edge
- [ ] يعمل على الموبايل

---

## 🚨 **مؤشرات التحذير للتدوير**

### مؤشرات حمراء (تدوير فوري):

1. **معدل فشل تسجيل الدخول > 10%**
2. **انقطاع الجلسات بشكل متكرر**
3. **أخطاء CORS في المتصفح**
4. **عدم حفظ الكوكيز**
5. **أخطاء 500 في API endpoints**

### مؤشرات صفراء (مراقبة مكثفة):

1. **معدل فشل تسجيل الدخول 5-10%**
2. **بطء في استجابة API**
3. **تحذيرات في console المتصفح**
4. **معدل فشل refresh token > 5%**

---

## 📞 **خطة التواصل في حالة الطوارئ**

### في حالة الحاجة للتدوير:

1. **إشعار فوري للمستخدمين**
   ```javascript
   // عرض رسالة في التطبيق
   "نحن نعمل على صيانة سريعة للنظام. سيتم حل المشكلة خلال دقائق."
   ```

2. **تسجيل مفصل**
   ```bash
   # تفعيل تسجيل مفصل
   export DEBUG=*
   export NODE_ENV=development
   npm start
   ```

3. **مراقبة مستمرة**
   ```bash
   # مراقبة ملفات الـ logs
   tail -f logs/error.log
   tail -f logs/access.log
   ```

---

## 🔧 **إعدادات الطوارئ**

### في حالة عدم نجاح التدوير، استخدم هذه الإعدادات:

```env
# إعدادات آمنة للطوارئ
JWT_SECRET=fallback_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
CORS_ORIGIN=*
```

---

## 📊 **مراقبة ما بعد النشر**

### المقاييس المطلوب مراقبتها:

1. **معدل نجاح تسجيل الدخول**
2. **معدل نجاح تجديد التوكن**
3. **وقت استجابة API**
4. **عدد الجلسات النشطة**
5. **أخطاء JavaScript في المتصفح**

### أدوات المراقبة:

```bash
# مراقبة الـ performance
npm install --save-dev clinic
clinic doctor -- node server.js

# مراقبة الذاكرة
node --inspect server.js
```

---

## ✅ **تأكيد الجاهزية**

**تحقق من أن جميع النقاط التالية مكتملة قبل النشر:**

- [ ] جميع الملفات محدثة وتعمل بنجاح
- [ ] اختبار شامل تم باستخدام `test-unified-auth.js`
- [ ] نسخة احتياطية متوفرة
- [ ] خطة التدوير جاهزة
- [ ] فريق الدعم مُطلع على التغييرات

---

**📝 ملاحظة:** هذه الخطة تضمن العودة السريعة للحالة المستقرة السابقة في حالة ظهور مشاكل مع النظام الجديد.
