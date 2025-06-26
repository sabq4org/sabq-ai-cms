# 🚀 البدء السريع مع SQLite (5 دقائق)

بدلاً من الانتظار لحل مشكلة الاتصال بالخادم، ابدأ فوراً مع SQLite!

## خطوات سريعة:

### 1. حدّث `.env.local`:
```env
# قاعدة بيانات محلية
DATABASE_URL="file:./dev.db"

# باقي الإعدادات
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=dev-secret-key
```

### 2. حدّث `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"  // غيّر من mysql إلى sqlite
  url      = env("DATABASE_URL")
}
```

### 3. أنشئ قاعدة البيانات:
```bash
# توليد Client
npx prisma generate

# إنشاء الجداول
npx prisma db push
```

### 4. انقل البيانات (اختياري):
```bash
npm run db:migrate
```

### 5. شغّل المشروع:
```bash
npm run dev
```

## ✅ مميزات SQLite للتطوير:
- **فوري**: لا يحتاج إعدادات
- **محلي**: يعمل بدون إنترنت
- **سريع**: أداء ممتاز للتطوير
- **بسيط**: ملف واحد `dev.db`

## 🔄 لاحقاً عندما يعمل الخادم:
1. غيّر provider إلى "mysql"
2. حدّث DATABASE_URL
3. انقل البيانات بـ:
```bash
# صدّر من SQLite
npx prisma db pull

# ارفع إلى MySQL
npx prisma db push
```

## 💡 نصيحة:
ابدأ العمل على المشروع الآن مع SQLite، ولا تضيع وقتك في انتظار حل مشكلة الخادم. يمكنك النقل لاحقاً بسهولة! 