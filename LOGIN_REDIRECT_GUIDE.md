# 🚀 دليل نظام التوجيه الذكي بعد تسجيل الدخول

## 📋 **نظرة عامة**

تم تطوير نظام توجيه ذكي يُوجه المستخدمين إلى الصفحة المناسبة بناءً على:
- نوع المستخدم وصلاحياته
- الصفحة التي حاول الوصول إليها أصلاً
- حالة المستخدم (جديد/قديم)

## 🎯 **كيف يعمل النظام**

### 1️⃣ **للمديرين والمحررين**
```
المدير/المحرر → `/dashboard` (لوحة التحكم)
```

### 2️⃣ **للمستخدمين الجدد**
```
مستخدم جديد → `/welcome/preferences` (اختيار الاهتمامات)
```

### 3️⃣ **للمستخدمين العاديين**
```
مستخدم عادي → `/` (الصفحة الرئيسية المخصصة)
```

### 4️⃣ **مع وجود callbackUrl**
```
أي مستخدم + callbackUrl → الصفحة المطلوبة مباشرة
```

---

## 🧪 **حسابات الاختبار**

### **مديرون**
- `admin@test.com` / `123456` → لوحة التحكم
- `ali@alhazmi.org` / `123456` → لوحة التحكم

### **محررون**
- `editor@test.com` / `123456` → لوحة التحكم

### **مستخدمون عاديون**
- `user@test.com` / `123456` → الصفحة الرئيسية
- `test@test.com` / `123456` → الصفحة الرئيسية

---

## 🔗 **استخدام callbackUrl**

### **الطريقة الأولى: عبر Query Parameter**
```
http://localhost:3003/login?callbackUrl=/article/123
http://localhost:3003/login?redirect=/dashboard/news
http://localhost:3003/login?returnTo=/welcome/preferences
```

### **الطريقة الثانية: من صفحة محمية**
عندما يحاول المستخدم الوصول لصفحة محمية بدون تسجيل دخول:
```javascript
// في middleware أو صفحة محمية
router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
```

### **الطريقة الثالثة: برمجياً**
```javascript
// في أي مكان في الكود
const redirectTo = '/dashboard/article/create';
window.location.href = `/login?callbackUrl=${encodeURIComponent(redirectTo)}`;
```

---

## 📁 **هيكل الملفات المُحدثة**

```
app/
├── login/
│   └── page.tsx                    # صفحة تسجيل الدخول مع توجيه ذكي
├── welcome/
│   └── preferences/
│       └── page.tsx                # صفحة اختيار الاهتمامات
└── api/
    └── auth/
        └── login/
            └── route.ts            # API endpoint مع دعم أدوار متعددة
```

---

## ⚙️ **الإعدادات والمتغيرات**

### **متغيرات البيئة المطلوبة**
```env
NEXTAUTH_URL=http://localhost:3003
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

### **أدوار المستخدمين المدعومة**
- `admin` - مدير النظام
- `editor` - محرر
- `user` - مستخدم عادي (افتراضي)

---

## 🛠️ **التخصيص والتطوير**

### **إضافة دور جديد**
1. حدث API endpoint في `app/api/auth/login/route.ts`
2. أضف منطق التوجيه في `app/login/page.tsx`

### **إضافة صفحة ترحيب مخصصة**
```javascript
// في app/login/page.tsx
} else if (data.user.needs_onboarding) {
  router.push('/welcome/onboarding');
} else if (data.user.role === 'newRole') {
  router.push('/custom-page');
```

### **إضافة مستخدم اختبار جديد**
```javascript
// في app/api/auth/login/route.ts
const testUsers = {
  'newuser@test.com': {
    id: 'test-newuser',
    name: 'مستخدم جديد',
    email: 'newuser@test.com',
    role: 'newrole',
    is_admin: false
  },
  // ... باقي المستخدمين
};
```

---

## 🔒 **الأمان والحماية**

### **تنظيف الروابط**
- فقط الروابط التي تبدأ بـ `/` مسموحة
- منع التوجيه لـ `/login` مرة أخرى
- تشفير وفك تشفير المعاملات الحساسة

### **التحقق من الصلاحيات**
```javascript
const isAdmin = user.is_admin === true || 
               user.role === 'admin' || 
               user.role === 'editor';
```

---

## 📊 **مراقبة ومتابعة**

### **لوجز تسجيل الدخول**
```javascript
console.log('توجيه مستخدم عادي إلى الصفحة الرئيسية');
console.log('تسجيل دخول ناجح للمستخدم:', user.email, 'دور:', user.role);
```

### **إحصائيات التوجيه**
- عدد المستخدمين الموجهين لكل صفحة
- معدل نجاح التوجيه
- الأخطاء الشائعة

---

## 🚀 **خطوات التشغيل**

1. **تشغيل السيرفر**
```bash
cd /Users/alialhazmi/Projects/sabq-ai-cms-new
npm run dev
```

2. **فتح صفحة تسجيل الدخول**
```
http://localhost:3003/login
```

3. **اختبار التوجيه**
```
# مستخدم عادي
http://localhost:3003/login → دخول بـ user@test.com → /

# مدير
http://localhost:3003/login → دخول بـ admin@test.com → /dashboard

# مع callbackUrl
http://localhost:3003/login?callbackUrl=/dashboard/news → دخول → /dashboard/news
```

---

## 🎉 **النتائج المتوقعة**

✅ **المديرون يذهبون مباشرة للوحة التحكم**
✅ **المستخدمون العاديون يذهبون للصفحة الرئيسية**
✅ **المستخدمون الجدد يحددون اهتماماتهم أولاً**
✅ **دعم كامل لـ callbackUrl من أي مصدر**
✅ **تجربة مستخدم سلسة ومخصصة**

---

*تم التطوير بواسطة فريق سبق الذكي 🤖* 