# حل مشكلة Runtime Error في صفحة Moment by Moment

## المشكلة
كان هناك خطأ في Runtime مع Next.js 15.4.1:
```
ENOENT: no such file or directory, open '/Users/alialhazmi/sabq-ai-cms/.next/server/app/moment-by-moment/page.js'
```

## السبب
المشكلة كانت في build cache حيث أن Next.js لم يتمكن من العثور على ملف JavaScript المُترجم لصفحة `moment-by-moment`.

## الحل
1. **إيقاف جميع عمليات Next.js**: 
   ```bash
   pkill -f "next dev"
   ```

2. **حذف مجلد .next**:
   ```bash
   rm -rf .next
   ```

3. **إيقاف العمليات على المنافذ المستخدمة**:
   ```bash
   lsof -i :3000,3001 | grep LISTEN
   kill [PID]
   ```

4. **إعادة تشغيل الخادم**:
   ```bash
   npm run dev
   ```

## النتيجة
- الخادم يعمل الآن بنجاح على http://localhost:3000
- صفحة moment-by-moment يجب أن تكون متاحة على http://localhost:3000/moment-by-moment

## ملاحظات
- هذا النوع من الأخطاء شائع في Next.js عند حدوث مشاكل في build cache
- يُنصح بحذف مجلد `.next` عند مواجهة مشاكل مماثلة
- التأكد من عدم وجود عمليات قديمة تستخدم نفس المنافذ 