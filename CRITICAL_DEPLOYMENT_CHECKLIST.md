# ✅ قائمة المراجعة الحرجة للنشر

## قبل النشر:
- [ ] السماح بـ GitHub secrets من الروابط المرسلة
- [ ] أو استخدام أحد البدائل في `MANUAL_DEPLOYMENT_ALTERNATIVE.md`

## أثناء النشر:
- [ ] تحديث `DATABASE_URL` في منصة النشر (Vercel/Railway/etc):
```
DATABASE_URL="postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/sabq_app_pool?sslmode=require&pgbouncer=true&connection_limit=1"
```

- [ ] تشغيل في بيئة الإنتاج:
```bash
npx prisma generate
```

- [ ] إضافة IP خادم الإنتاج في DigitalOcean trusted sources

## بعد النشر:
- [ ] زيارة الموقع والتحقق من ظهور المقالات
- [ ] اختبار `/api/articles` 
- [ ] اختبار `/api/categories`

## ⚠️ تحذير:
**بدون هذه الخطوات، سيستمر الموقع في عرض "لا توجد مقالات منشورة"** 