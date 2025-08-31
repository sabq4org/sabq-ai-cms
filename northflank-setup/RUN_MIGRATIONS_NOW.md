# 🚨 الجداول غير موجودة - شغّل Migrations الآن!

## المشكلة
```
The table `public.articles` does not exist in the current database
```

## الحل الفوري

### في Northflank، أنشئ Job جديد:

#### إعدادات Job:
- **Image**: نفس image الخدمة الحالية
- **Environment Variables**: انسخ نفس متغيرات البيئة من الخدمة
- **Command**: أحد الأوامر التالية

#### جرب بالترتيب:

### 1️⃣ الأمر الأول (Migrations):
```bash
npx prisma migrate deploy
```

### 2️⃣ إذا فشل، جرب (Push مباشر):
```bash
npx prisma db push --skip-generate
```

### 3️⃣ إذا فشل أيضاً، جرب (Force):
```bash
npx prisma db push --force-reset --skip-generate
```
⚠️ تحذير: هذا سيحذف البيانات الموجودة (إن وجدت)

### 4️⃣ بعد نجاح إنشاء الجداول، أضف البيانات:
```bash
node northflank-setup/seed-basic-data.js
```

## التحقق من النجاح

```bash
# تحقق من وجود الجداول
curl https://site--sabqai--7mcgps947hwt.code.run/api/test-db

# تحقق من التصنيفات
curl https://site--sabqai--7mcgps947hwt.code.run/api/categories

# تحقق من الأخبار
curl https://site--sabqai--7mcgps947hwt.code.run/api/articles?status=published
```

## نصائح مهمة

1. **تأكد من DATABASE_URL**: يجب أن يكون نفس القيمة في الخدمة
2. **انتظر اكتمال Job**: قد يستغرق دقيقة أو دقيقتين
3. **راجع Logs**: في حالة الفشل، اقرأ رسالة الخطأ

## بديل: SQL مباشر

إذا فشلت جميع المحاولات، يمكنك إنشاء الجداول يدوياً عبر SQL، لكن Prisma هو الطريقة الأفضل.
