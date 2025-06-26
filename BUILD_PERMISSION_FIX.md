# 🔧 دليل حل مشكلة صلاحيات البناء

## المشكلة
```
EACCES: permission denied, open '/home/j3uar/sabq-ai-cms/.next/trace'
```

## الحلول المتاحة

### 🚀 الحل السريع (موصى به)
```bash
# على السيرفر، شغل هذا الأمر
npm run fix:build
```

### 📋 أو الحل اليدوي خطوة بخطوة
```bash
# 1. حذف المجلدات المشكلة
rm -rf .next
rm -rf node_modules/.cache

# 2. البناء من جديد
npm run build
```

### 🛠️ الحل الشامل (لجميع المشاكل)
```bash
# تشغيل سكريبت إصلاح الصلاحيات
npm run fix:permissions
```

## الأوامر الجديدة المتاحة

| الأمر | الوظيفة |
|------|---------|
| `npm run fix:build` | حل سريع لمشكلة البناء |
| `npm run fix:permissions` | إصلاح شامل لجميع الصلاحيات |
| `npm run clean:build` | تنظيف مجلدات البناء فقط |

## 🎯 خطوات التطبيق على السيرفر

```bash
# 1. جلب آخر التحديثات
git pull origin main

# 2. حل مشكلة الصلاحيات
npm run fix:build

# 3. إذا نجح البناء، شغل التطبيق
npm start
# أو
pm2 restart jur3a-cms
```

## ⚠️ إذا استمرت المشكلة

### استخدم sudo (آخر حل)
```bash
# حذف بـ sudo
sudo rm -rf .next node_modules

# إعادة التثبيت والبناء
npm install
npm run build
```

### تغيير ملكية المجلد بالكامل
```bash
sudo chown -R $USER:$USER ~/sabq-ai-cms
chmod -R 755 ~/sabq-ai-cms
```

## 📝 نصائح لتجنب المشكلة

1. **لا تستخدم sudo مع npm** - يسبب مشاكل صلاحيات
2. **نظف مجلد .next دورياً** - خاصة بعد تحديثات كبيرة
3. **استخدم الأوامر الجديدة** - `npm run fix:build` للحل السريع

---

✅ **الحل الأسرع:** `npm run fix:build` 