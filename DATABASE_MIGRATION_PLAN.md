# 📋 خطة نقل قاعدة البيانات إلى Northflank

## ✅ مكتمل:
- [x] إنشاء نسخة احتياطية (38.22 MB, 2,298 سجل)
- [x] تحديث .env.local
- [x] إعداد متغيرات Amplify

## 🔄 التالي - اختر طريقة واحدة:

### الطريقة 1: النقل التلقائي (الأسهل) ⭐
```bash
# سيتطلب اتصال خارجي لـ Northflank
./migrate-to-northflank.sh
```

### الطريقة 2: النقل باستخدام Prisma (للخبراء)
```bash
# تأكد أن Northflank DB يقبل اتصالات خارجية
node migrate-data-prisma.js
```

### الطريقة 3: البداية من جديد (إذا فشل النقل)
```bash
# إنشاء الجداول فقط بدون بيانات
npx prisma db push
# ثم إدخال البيانات المهمة يدوياً
```

## 🚀 بعد نقل البيانات:

1. **اختبار محلي:**
   ```bash
   npm run dev
   # تحقق من: تسجيل الدخول، المقالات، التعليقات
   ```

2. **تحديث Amplify:**
   - افتح AWS Amplify Console
   - اذهب إلى Environment variables
   - انسخ المتغيرات من AMPLIFY_ENV_VARIABLES.txt

3. **النشر:**
   ```bash
   git add .
   git commit -m "Migrate to Northflank database"
   git push
   ```

## ⚠️ ملاحظات مهمة:

- قاعدة البيانات الجديدة قد لا تقبل اتصالات خارجية
- إذا فشل النقل، يمكن استعادة النسخة الاحتياطية
- تأكد من اختبار جميع الوظائف بعد النقل

## 🆘 في حالة وجود مشاكل:

1. **قاعدة البيانات لا تستجيب:**
   - تحقق من Northflank Dashboard
   - تأكد أن قاعدة البيانات تعمل
   - جرب Internal connection بدلاً من External

2. **أخطاء في البيانات:**
   - استخدم النسخة الاحتياطية للمقارنة
   - تحقق من Prisma schema compatibility

3. **أخطاء في Amplify:**
   - تحقق من متغيرات البيئة
   - راجع build logs في Amplify Console
