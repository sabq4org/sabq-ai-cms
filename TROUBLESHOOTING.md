# دليل حل المشاكل - صحيفة سبق

## 🚨 المشاكل الشائعة وحلولها

### 1. البيانات لا تظهر في لوحة التحكم
**الحل:**
```bash
# تحقق من تشغيل الخادم
npm run dev

# أعد تحميل الصفحة
Ctrl + F5 (Windows) أو Cmd + Shift + R (Mac)

# تحقق من تسجيل الدخول
- تأكد من استخدام حساب admin
- البريد: ali@alhazm.org
```

### 2. الصور لا تظهر
**الحل:**
```bash
# تحقق من مجلد الصور
ls public/uploads/

# أنشئ المجلدات المطلوبة
mkdir -p public/uploads/featured
mkdir -p public/uploads/article
mkdir -p public/uploads/avatars
```

### 3. خطأ في حفظ البيانات
**الحل:**
```bash
# تحقق من صلاحيات الكتابة
chmod -R 755 data/

# نسخ احتياطي للبيانات
cp -r data/ data_backup_$(date +%Y%m%d)/
```

### 4. البيانات تختفي أو تتغير
**الحل:**
```bash
# شغل سكريبت الإصلاح
node scripts/fix-data.js

# استرجع من النسخة الاحتياطية
cp -r backups/[آخر_نسخة]/* data/
```

### 5. الخادم لا يعمل
**الحل:**
```bash
# أوقف جميع العمليات
pkill -f "next dev"

# امسح الكاش
rm -rf .next/

# أعد التشغيل
npm run dev
```

## 🛠️ أوامر مفيدة

### فحص حالة المشروع
```bash
# فحص البيانات
node scripts/fix-data.js

# عرض السجلات
tail -f .next/server/app-paths-manifest.json
```

### النسخ الاحتياطي
```bash
# نسخ احتياطي كامل
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz data/ public/uploads/

# استرجاع
tar -xzf backup_[التاريخ].tar.gz
```

### تنظيف المشروع
```bash
# حذف الملفات المؤقتة
rm -rf .next/ node_modules/.cache/

# إعادة تثبيت المكتبات
npm install
```

## 📞 للمساعدة

1. **تحقق من DATA_STATUS.md** لمعرفة حالة البيانات
2. **راجع سجل التغييرات** في Git
3. **أعد تشغيل الخادم** بعد أي تعديل

## ⚡ نصائح مهمة

1. **دائماً** احتفظ بنسخة احتياطية قبل التعديل
2. **لا تحذف** ملفات JSON مباشرة
3. **استخدم السكريبتات** بدلاً من التعديل اليدوي
4. **أعد تشغيل الخادم** بعد تعديل البيانات 