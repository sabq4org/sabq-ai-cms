# 🚀 دليل إعداد قاعدة البيانات (Supabase) - خطوة بخطوة

## 📝 الخطوة 1: إنشاء حساب Supabase

1. افتح [supabase.com](https://supabase.com)
2. انقر على الزر الأخضر **"Start your project"**
3. اختر **"Sign in with GitHub"** (استخدم نفس حساب GitHub)

---

## 🗄️ الخطوة 2: إنشاء مشروع جديد

1. بعد تسجيل الدخول، انقر على **"New project"**
2. املأ الحقول كالتالي:
   - **Organization**: اختر حسابك
   - **Project name**: `sabq-ai-cms`
   - **Database Password**: `SabqAI2024!@#` (احفظها في مكان آمن!)
   - **Region**: اختر `West US (North California)`
3. انقر **"Create new project"** وانتظر 2-3 دقائق

---

## 💾 الخطوة 3: تشغيل ملف SQL

1. بعد إنشاء المشروع، انقر على **"SQL Editor"** من القائمة الجانبية
2. انقر على **"New query"**
3. انسخ كل محتوى الملف `database/supabase_setup.sql` والصقه
4. انقر على **"Run"** (أو اضغط Ctrl+Enter)
5. يجب أن تظهر رسالة "Success" باللون الأخضر

---

## 🔑 الخطوة 4: الحصول على رابط قاعدة البيانات

1. انقر على **"Settings"** (الترس) في القائمة الجانبية
2. انقر على **"Database"**
3. ابحث عن قسم **"Connection string"**
4. انقر على **"URI"**
5. انسخ الرابط (يبدأ بـ `postgresql://`)
6. استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها (`SabqAI2024!@#`)

مثال على الرابط النهائي:
```
postgresql://postgres:SabqAI2024!@#@db.xxxxx.supabase.co:5432/postgres
```

---

## 🔐 الخطوة 5: الحصول على مفتاح OpenAI

1. اذهب إلى [platform.openai.com](https://platform.openai.com)
2. سجل الدخول أو أنشئ حساب جديد
3. انقر على صورة حسابك ثم **"API keys"**
4. انقر على **"Create new secret key"**
5. اعط المفتاح اسم: `sabq-ai-cms`
6. انسخ المفتاح (يبدأ بـ `sk-`) واحفظه

---

## ⚙️ الخطوة 6: إعداد متغيرات البيئة في Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. اختر مشروعك `sabq-ai-cms`
3. انقر على **"Settings"** ثم **"Environment Variables"**
4. أضف المتغيرات التالية:

### المتغيرات المطلوبة:

| اسم المتغير | القيمة | ملاحظات |
|------------|--------|---------|
| `DATABASE_URL` | `postgresql://postgres:SabqAI2024!@#@db.xxxxx.supabase.co:5432/postgres` | الرابط من Supabase |
| `JWT_SECRET` | `my-super-secret-jwt-key-sabq-2024` | يمكنك تغييرها |
| `OPENAI_API_KEY` | `sk-xxxxxxxxxxxxxxxx` | مفتاح OpenAI |
| `NEXT_PUBLIC_API_URL` | `https://sabq-ai-cms.vercel.app` | سيتم تحديثه بعد النشر |
| `FRONTEND_URL` | `https://sabq-ai-cms.vercel.app` | سيتم تحديثه بعد النشر |

### متغيرات البريد (اختيارية - يمكن إضافتها لاحقاً):

| اسم المتغير | القيمة |
|------------|--------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `your-email@gmail.com` |
| `EMAIL_PASS` | `your-app-password` |
| `EMAIL_FROM` | `noreply@sabq.ai` |

---

## 🚀 الخطوة 7: النشر!

1. بعد إضافة جميع المتغيرات، انقر على **"Deploy"**
2. انتظر 3-5 دقائق
3. ستحصل على رابط مثل: `https://sabq-ai-cms-xxxxx.vercel.app`

---

## ✅ الخطوة 8: تحديث الروابط

1. ارجع إلى **"Environment Variables"** في Vercel
2. حدث هذه المتغيرات بالرابط الحقيقي:
   - `NEXT_PUBLIC_API_URL` = رابط موقعك الجديد
   - `FRONTEND_URL` = رابط موقعك الجديد
3. انقر **"Save"** ثم **"Redeploy"**

---

## 🎉 مبروك! موقعك الآن مباشر على الإنترنت!

### معلومات تسجيل الدخول الافتراضية:
- **البريد**: `admin@sabq.ai`
- **كلمة المرور**: `admin123`

### ⚠️ مهم: غير كلمة المرور فوراً بعد أول تسجيل دخول!

---

## 🆘 مشاكل شائعة وحلولها:

### 1. خطأ في قاعدة البيانات:
- تأكد من استبدال `[YOUR-PASSWORD]` في رابط قاعدة البيانات
- تأكد من عدم وجود مسافات في الرابط

### 2. خطأ في OpenAI:
- تأكد من وجود رصيد في حساب OpenAI
- تأكد من صحة المفتاح (يبدأ بـ `sk-`)

### 3. الموقع لا يعمل:
- تأكد من إضافة جميع المتغيرات المطلوبة
- انقر على **"View Function Logs"** في Vercel لرؤية الأخطاء

---

## 📞 تحتاج مساعدة؟

اكتب لي الخطوة التي تواجه فيها مشكلة وسأساعدك فوراً! 🤝 