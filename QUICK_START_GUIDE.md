# 🚀 دليل التشغيل السريع - نظام الرصد الإعلامي وبوابة سبق الذكية

## 📋 المتطلبات الأساسية

### 🖥️ متطلبات النظام
- **Node.js**: الإصدار 18 أو أحدث
- **npm**: الإصدار 9 أو أحدث  
- **Docker**: للنشر بالحاويات
- **PostgreSQL**: قاعدة البيانات الرئيسية
- **Redis**: للتخزين المؤقت

### 🔧 أدوات التطوير
```bash
# تحقق من الإصدارات
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
docker --version  # أي إصدار حديث
```

## 🏁 التشغيل السريع (5 دقائق)

### الخطوة 1: استنساخ المشروع
```bash
git clone https://github.com/sabq4org/sabq-ai-cms.git
cd sabq-ai-cms
```

### الخطوة 2: إعداد متغيرات البيئة
```bash
# انسخ ملف البيئة النموذجي
cp .env.example .env.local

# عدّل المتغيرات الأساسية
nano .env.local
```

**المتغيرات المطلوبة:**
```env
# قاعدة البيانات
DATABASE_URL="postgresql://user:password@localhost:5432/sabq_ai_cms"

# التوثيق
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI للذكاء الاصطناعي  
OPENAI_API_KEY="your-openai-api-key"

# Cloudinary لإدارة الصور
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"  
CLOUDINARY_API_SECRET="your-api-secret"
```

### الخطوة 3: تثبيت التبعيات
```bash
npm install
```

### الخطوة 4: إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات وتطبيق المخطط
npx prisma migrate dev
npx prisma generate

# (اختياري) إضافة بيانات تجريبية
npm run seed-data
```

### الخطوة 5: تشغيل التطبيق
```bash
# تشغيل في وضع التطوير
npm run dev

# أو تشغيل في وضع الإنتاج
npm run build
npm start
```

**🎉 التطبيق يعمل الآن على:** `http://localhost:3000`

## 🐳 التشغيل بـ Docker (بديل سريع)

```bash
# إنشاء ملف البيئة
cp .env.example .env

# تشغيل جميع الخدمات
docker-compose up -d

# متابعة السجلات
docker-compose logs -f
```

**الخدمات المتاحة:**
- 🌐 التطبيق الرئيسي: `http://localhost:3000`
- 📊 Grafana (المراقبة): `http://localhost:3001`
- 🔍 Adminer (إدارة قاعدة البيانات): `http://localhost:8080`
- 📈 Prometheus: `http://localhost:9090`

## 🧪 تشغيل الاختبارات

### اختبارات شاملة
```bash
# تشغيل جميع الاختبارات
./run-comprehensive-tests.sh

# أو خطوة بخطوة:
npm test                    # اختبارات الوحدة
npm run test:e2e           # اختبارات شاملة
npm run test:performance   # اختبارات الأداء
npm run test:security      # اختبارات الأمان
```

### اختبارات سريعة
```bash
# اختبارات الوحدة فقط
./run-comprehensive-tests.sh --unit-only

# بدون Docker
./run-comprehensive-tests.sh --no-docker
```

## 👥 إعداد المستخدم الأول

### إنشاء مدير النظام
```bash
# تشغيل سكريبت إنشاء المدير
node scripts/create-admin-user.js

# أو يدوياً عبر المتصفح:
# انتقل إلى: http://localhost:3000/register
# سجل حساب جديد ثم اجعله مديراً عبر قاعدة البيانات
```

### الصفحات الإدارية
- 🏠 **لوحة التحكم**: `/admin`
- 📝 **إدارة المقالات**: `/admin/articles`  
- 👥 **إدارة المستخدمين**: `/admin/users`
- ⚙️ **الإعدادات**: `/admin/settings`

## 🎯 الميزات الرئيسية

### 🤖 الذكاء الاصطناعي
- **تلخيص المقالات**: تلقائي بـ OpenAI
- **تصنيف المحتوى**: ذكي ومتطور
- **التوصيات**: مخصصة لكل مستخدم
- **تحليل المشاعر**: للنصوص العربية

### 📱 تجربة المستخدم
- **تصميم متجاوب**: يعمل على جميع الأجهزة  
- **الوضع الليلي**: تبديل ذكي
- **ألوان تفاعلية**: 7 أنظمة لونية
- **أداء محسّن**: تحميل سريع وسلس

### 📊 التحليلات والمراقبة
- **إحصائيات مفصلة**: للمقالات والمستخدمين
- **تتبع التفاعل**: إعجاب، تعليق، مشاركة
- **مراقبة الأداء**: في الوقت الفعلي
- **تقارير شاملة**: يومية وأسبوعية

## 🔧 الصيانة والتحديث

### النسخ الاحتياطي
```bash
# نسخة احتياطية كاملة
npm run backup:full

# نسخة احتياطية لقاعدة البيانات فقط  
npm run backup:database

# حالة النسخ الاحتياطية
npm run backup:status
```

### تحسين الأداء
```bash
# تحسين قاعدة البيانات
node scripts/optimize-database-performance.js

# تنظيف الملفات المؤقتة
npm run clean

# تحديث التبعيات
npm update && npm audit fix
```

## 🆘 استكشاف الأخطاء

### مشاكل شائعة

**❌ خطأ اتصال قاعدة البيانات:**
```bash
# تحقق من حالة قاعدة البيانات
node scripts/check-database.js

# إعادة تطبيق المخطط
npx prisma db push
```

**❌ مشاكل في بناء التطبيق:**
```bash
# تنظيف ذاكرة التخزين المؤقت
npm run clean
rm -rf .next node_modules
npm install

# إعادة البناء
npm run build
```

**❌ أخطاء في الصور:**
```bash
# إعادة تحميل الصور المفقودة
node scripts/fix-missing-images.js

# تحسين صور Cloudinary
node scripts/optimize-existing-images.js
```

### أدوات التشخيص
```bash
# تشخيص شامل للنظام
node scripts/system-diagnostics.js

# فحص صحة الإنتاج
node scripts/check-production-health.js

# مراقبة الأداء
node scripts/monitor-performance.js
```

## 📞 الدعم والمساعدة

### 📚 الوثائق المتاحة
- `PROJECT_READINESS_ASSESSMENT.md` - تقييم جاهزية المشروع
- `IMPLEMENTATION_PLAN.md` - خطة التنفيذ التفصيلية  
- `TEST_EXECUTION_REPORT.md` - تقارير الاختبار
- مجلد `docs/` - وثائق تقنية مفصلة

### 🐛 الإبلاغ عن الأخطاء
1. تشغيل التشخيص: `node scripts/system-diagnostics.js`
2. إنشاء issue في GitHub
3. إرفاق ملفات السجل والتشخيص

### ✨ طلب ميزات جديدة
- إنشاء Feature Request في GitHub
- شرح الميزة المطلوبة بالتفصيل
- إضافة أمثلة أو مقترحات للتنفيذ

---

## 🎊 مبروك! 

النظام يعمل الآن بكامل إمكانياته. يمكنك الآن:
- ✅ إضافة المحتوى والمقالات
- ✅ تخصيص التصميم والألوان  
- ✅ مراقبة الأداء والإحصائيات
- ✅ الاستفادة من ميزات الذكاء الاصطناعي
- ✅ النشر على الخوادم الإنتاجية

**للحصول على أفضل تجربة، ننصح بمراجعة دليل المستخدم الكامل في مجلد `docs/`.**
