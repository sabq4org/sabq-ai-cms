# 🚀 رفع النسخة الاحتياطية إلى Northflank

## الملف المطلوب:
- المضغوط: sabq-northflank-2025-08-30T20-05-20.sql.gz (18.90 MB)
- العادي: sabq-northflank-2025-08-30T20-05-20.sql (25.85 MB)

## الخطوات:
1. افتح Northflank Dashboard
2. اذهب إلى قاعدة البيانات > Import  
3. اختر "Import a backup from an existing source"
4. ارفع الملف المضغوط
5. انتظر الاستيراد (2-5 دقائق)

## بعد الاستيراد:
حدث متغيرات Amplify:

DATABASE_URL
postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7

DIRECT_URL  
postgresql://_63675d59e8b3f9b1:_0128ce8b926fef059a8992b4b8a048@primary.sabq--7mcgps947hwt.addon.code.run:5432/_f730d16e1ad7

## اختبار:
npm run dev

## النشر:
git add . && git commit -m "Switch to Northflank" && git push
