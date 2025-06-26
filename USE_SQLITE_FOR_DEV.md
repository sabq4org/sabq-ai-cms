# 🚀 البدء السريع مع SQLite للتطوير

## خطوات سريعة:

### 1. حدّث DATABASE_URL في .env أو .env.local:
```env
DATABASE_URL="file:./dev.db"
```

### 2. تأكد من تحديث schema.prisma (تم ✅)

### 3. أنشئ قاعدة البيانات:
```bash
npx prisma generate
npx prisma db push
```

### 4. (اختياري) انقل البيانات من JSON:
```bash
npm run db:migrate
```

## مميزات SQLite للتطوير:
- ✅ لا يحتاج تثبيت
- ✅ سريع جداً
- ✅ ملف واحد (dev.db)
- ✅ سهل النسخ والمشاركة

## لاحقاً للإنتاج:
عندما تكون جاهزاً للإنتاج، يمكنك:
1. الحصول على قاعدة بيانات MySQL/PostgreSQL
2. تغيير DATABASE_URL
3. تغيير provider في schema.prisma
4. نقل البيانات

## ملاحظة مهمة:
SQLite لا يدعم بعض الميزات المتقدمة، لكنه ممتاز للتطوير والاختبار! 