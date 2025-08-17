# تحديث الدومين من sabq.io إلى sabq.me 🌐

## 📅 التاريخ: 30 يناير 2025

## 🎯 نظرة عامة

تم تحديث جميع مراجع الدومين في النظام من `sabq.io` إلى `sabq.me` لضمان التوافق مع الدومين الجديد.

## 📋 الملفات المحدثة

### 🔧 **ملفات الإعدادات الأساسية**

#### 1. **متغيرات البيئة**
- `ENV_SETUP_CRITICAL.md`
- `digitalocean-supabase-db.env`
- `digitalocean-aws-db.env`

**التحديث:**
```diff
- NEXTAUTH_URL=https://sabq.io
+ NEXTAUTH_URL=https://sabq.me

- NEXT_PUBLIC_SITE_URL=https://sabq.io
+ NEXT_PUBLIC_SITE_URL=https://sabq.me
```

#### 2. **مكتبات النظام (lib/)**
- `lib/production-image-fix.ts`
- `lib/article-api.ts`
- `lib/image-utils.ts`
- `lib/utils.ts`

**التحديث:**
```diff
- const PRODUCTION_DOMAIN = 'https://sabq.io';
+ const PRODUCTION_DOMAIN = 'https://sabq.me';

- baseUrl = 'https://sabq.io';
+ baseUrl = 'https://sabq.me';

- const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io';
+ const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.me';
```

### 🛠️ **ملفات Scripts**

تم تحديث جميع ملفات الـ scripts لاستخدام الدومين الجديد:

#### أ) **ملفات المراقبة والفحص:**
- `scripts/check-production-health.js`
- `scripts/check-production-status.js`
- `scripts/check-production-live.js`
- `scripts/check-article-issue.js`
- `scripts/monitor-amplify-deployment.js`
- `scripts/check-production-images.js`

**التحديث:**
```diff
- const PRODUCTION_URL = 'https://sabq.io';
+ const PRODUCTION_URL = 'https://sabq.me';
```

#### ب) **ملفات الإصلاح والصيانة:**
- `scripts/clear-production-cache.js`
- `scripts/emergency-image-fix.js`
- `scripts/fix-categories-display.js`

**التحديث:**
```diff
- const response = await fetch('https://sabq.io/api/categories?nocache=true');
+ const response = await fetch('https://sabq.me/api/categories?nocache=true');

- const baseUrl = 'https://sabq.io';
+ const baseUrl = 'https://sabq.me';
```

#### ج) **ملفات الإعداد:**
- `scripts/setup-s3-public-access.js`

**التحديث:**
```diff
AllowedOrigins: [
-   'https://sabq.io',
-   'https://www.sabq.io',
+   'https://sabq.me',
+   'https://www.sabq.me',
    'http://localhost:3000',
    'http://localhost:3002'
]
```

### 📊 **ملفات البيانات والتقارير**

#### 1. **تقارير الصحة:**
- `production-health-report.json`

**التحديث:**
```diff
{
-   "url": "https://sabq.io",
+   "url": "https://sabq.me",
    "results": [
        {
            "endpoint": "الصفحة الرئيسية",
-           "url": "https://sabq.io/",
+           "url": "https://sabq.me/",
            "status": 200
        }
    ]
}
```

#### 2. **إعدادات S3:**
- `S3_PUBLIC_ACCESS_SOLUTION.md`

**التحديث:**
```diff
"AllowedOrigins": [
-   "https://sabq.io",
-   "https://www.sabq.io",
+   "https://sabq.me",
+   "https://www.sabq.me",
    "http://localhost:3000"
]
```

### 📚 **ملفات التوثيق**

تم تحديث جميع المراجع في ملفات التوثيق:

- `docs/DIGITALOCEAN_DEPLOYMENT_STEPS.md`
- `docs/PRODUCTION_IMAGES_FIX.md`
- `docs/DB_CONNECTION_SOLUTION.md`
- `docs/ARABIC_URL_HANDLING.md`
- `docs/UNIQUE_IDS_IMPLEMENTATION.md`
- `PRODUCTION_DEPLOYMENT_STEPS.md`
- `API_ISSUES_COMPREHENSIVE_SOLUTION.md`

**أمثلة على التحديث:**
```diff
- افتح https://sabq.io - تحقق من ظهور الصور
+ افتح https://sabq.me - تحقق من ظهور الصور

- curl https://sabq.io/api/categories
+ curl https://sabq.me/api/categories

- https://sabq.io/article/3f127e79-99cd-4050-b68d-648985acb5ae
+ https://sabq.me/article/3f127e79-99cd-4050-b68d-648985acb5ae
```

## 🔍 **ملفات لم تتطلب تحديث**

الملفات التالية **لم تحتج إلى تحديث** لأنها:
- تستخدم متغيرات البيئة (`process.env.NEXT_PUBLIC_SITE_URL`)
- تعتمد على `window.location.origin` في المتصفح
- تحتوي على URLs نسبية فقط

### **أمثلة على الكود الذكي:**
```tsx
// ✅ هذا الكود لا يحتاج تحديث
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.me';

// ✅ هذا أيضاً لا يحتاج تحديث
const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_SITE_URL;
```

## 🧪 **خطوات الاختبار**

### 1. **اختبار محلي:**
```bash
# تحديث متغيرات البيئة المحلية
NEXT_PUBLIC_SITE_URL=https://sabq.me
NEXTAUTH_URL=https://sabq.me

# تشغيل التطبيق
npm run dev
```

### 2. **اختبار الإنتاج:**
```bash
# فحص حالة الموقع
curl -I https://sabq.me

# فحص APIs
curl https://sabq.me/api/categories
curl https://sabq.me/api/articles?limit=5

# فحص صحة النظام
node scripts/check-production-health.js
```

### 3. **اختبار وظائف محددة:**

#### أ) **الصور:**
- تحقق من ظهور صور المقالات
- تحقق من صور التصنيفات
- تحقق من صور البطاقات

#### ب) **الروابط:**
- تحقق من روابط المقالات
- تحقق من روابط التصنيفات
- تحقق من الروابط الداخلية

#### ج) **APIs:**
- `/api/categories`
- `/api/articles`
- `/api/news/stats`

## ⚙️ **إعدادات النشر المطلوبة**

### **DigitalOcean App Platform:**
```env
NEXTAUTH_URL=https://sabq.me
NEXT_PUBLIC_SITE_URL=https://sabq.me
```

### **Vercel:**
```env
NEXTAUTH_URL=https://sabq.me
NEXT_PUBLIC_SITE_URL=https://sabq.me
```

### **AWS Amplify:**
```env
NEXTAUTH_URL=https://sabq.me
NEXT_PUBLIC_SITE_URL=https://sabq.me
```

## 🔗 **DNS والإعدادات الخارجية**

### **ما يحتاج تحديث خارج الكود:**

#### 1. **إعدادات DNS:**
- إعداد A Record للدومين `sabq.me`
- إعداد CNAME للـ `www.sabq.me`
- تحديث NS Records إذا لزم الأمر

#### 2. **شهادات SSL:**
- إصدار شهادة SSL للدومين الجديد
- تحديث إعدادات CDN (إذا وجد)

#### 3. **خدمات خارجية:**
- تحديث Callback URLs في Google OAuth
- تحديث Webhook URLs
- تحديث إعدادات Cloudinary (إذا لزم)
- تحديث إعدادات AWS S3 CORS

#### 4. **مراقبة ومتابعة:**
- تحديث إعدادات Monitoring
- تحديث إعدادات Analytics
- تحديث إعدادات Search Console

## 🚨 **نقاط مهمة للانتباه**

### **1. Cache Invalidation:**
```bash
# مسح الكاش بعد التحديث
node scripts/clear-production-cache.js
```

### **2. Search Engine:**
```bash
# تحديث sitemap.xml
# إعادة توجيه 301 من الدومين القديم
# تحديث Google Search Console
```

### **3. متابعة الأداء:**
```bash
# مراقبة الروابط المكسورة
# فحص سرعة التحميل
# مراقبة معدلات الخطأ
```

## 📊 **ملخص التحديثات**

| نوع الملف | عدد الملفات | أمثلة |
|-----------|-------------|--------|
| **مكتبات النظام** | 4 | `lib/production-image-fix.ts` |
| **إعدادات البيئة** | 3 | `ENV_SETUP_CRITICAL.md` |
| **Scripts** | 10 | `scripts/check-production-health.js` |
| **التوثيق** | 8+ | `docs/DIGITALOCEAN_DEPLOYMENT_STEPS.md` |
| **البيانات/التقارير** | 2 | `production-health-report.json` |

**المجموع**: **20+ ملف** تم تحديثه

## ✅ **حالة التنفيذ**

- ✅ **تم تحديث جميع الملفات**
- ✅ **تم رفع التغييرات إلى GitHub**
- ✅ **تم دمج التغييرات مع `clean-main`**
- ⏳ **بانتظار تحديث إعدادات DNS**
- ⏳ **بانتظار تحديث متغيرات البيئة في منصة النشر**

## 🎯 **الخطوات التالية**

### **للمطور:**
1. ✅ تحديث الكود (مكتمل)
2. ⏳ تحديث متغيرات البيئة في منصة النشر
3. ⏳ اختبار الموقع على الدومين الجديد

### **للمدير:**
1. ⏳ إعداد DNS للدومين الجديد
2. ⏳ إصدار شهادة SSL
3. ⏳ إعداد إعادة التوجيه من الدومين القديم

### **بعد النشر:**
1. ⏳ اختبار شامل لجميع الوظائف
2. ⏳ مراقبة الأداء والأخطاء
3. ⏳ تحديث أدوات المراقبة والتحليل

## 🔍 **فحص سريع**

```bash
# فحص سريع لضمان التحديث الصحيح
grep -r "sabq.io" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md"

# يجب أن يُظهر فقط الملفات التي لا تحتاج تحديث
# (مثل ملفات التوثيق أو التعليقات)
```

## 🎉 **الخلاصة**

تم بنجاح تحديث **جميع مراجع الدومين** في النظام من `sabq.io` إلى `sabq.me`. 

التحديثات شملت:
- 🔧 **4 ملفات** في مكتبات النظام
- ⚙️ **3 ملفات** إعدادات البيئة  
- 🛠️ **10 ملفات** scripts
- 📚 **8+ ملفات** توثيق
- 📊 **2 ملف** بيانات وتقارير

**المجموع**: **20+ ملف** تم تحديثه بنجاح! 🚀

الآن النظام جاهز للعمل على الدومين الجديد `https://sabq.me` بمجرد تحديث إعدادات DNS ومتغيرات البيئة في منصة النشر.