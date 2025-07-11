# 🚨 إصلاح عاجل لمشكلة رفع الصور

## المشكلة المكتشفة:
مفتاح `CLOUDINARY_API_SECRET` في ملف `.env.local` غير صحيح!

القيمة الحالية:
```
CLOUDINARY_API_SECRET=your-cloudinary-secret-key-here
```

## الحل السريع:

### 1. احصل على المفتاح الصحيح:
1. اذهب إلى: https://cloudinary.com/console
2. سجل الدخول
3. انسخ `API Secret` (سيكون شكله مثل: `1a2B3c4D5e6F7g8H9i0J1k2L3m4N`)

### 2. عدّل ملف `.env.local`:
```bash
# افتح الملف في محرر النصوص
nano .env.local
# أو
code .env.local
```

### 3. غيّر السطر:
من:
```
CLOUDINARY_API_SECRET=your-cloudinary-secret-key-here
```

إلى:
```
CLOUDINARY_API_SECRET=المفتاح_الحقيقي_من_Cloudinary
```

### 4. احفظ الملف وأعد تشغيل السيرفر:
```bash
# أوقف السيرفر الحالي (Ctrl+C)
# ثم أعد تشغيله
npm run dev -- --port 3001
```

### 5. اختبر رفع صورة جديدة من لوحة التحكم

## ⚠️ تنبيهات مهمة:
- لا تشارك المفتاح مع أي شخص
- تأكد من عدم وجود مسافات قبل أو بعد المفتاح
- المفتاح حساس لحالة الأحرف (case-sensitive)

## للتحقق من نجاح الإصلاح:
```bash
node scripts/test-cloudinary.js
```

يجب أن ترى: "✅ تم رفع الصورة بنجاح!" 