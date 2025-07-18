# حل مشكلة ENOENT في Next.js

## المشكلة
خطأ `ENOENT: no such file or directory` عند محاولة فتح ملفات في مجلد `.next/server/app/`

## الأعراض
```
Runtime Error
ENOENT: no such file or directory, open '/path/to/project/.next/server/app/page.js'
```

## السبب
- ملفات البناء المؤقتة تالفة أو غير متزامنة
- تغييرات في الكود أثناء عمل الخادم
- مشاكل في webpack-runtime

## الحل السريع
```bash
# 1. إيقاف خادم التطوير
pkill -f "next dev"

# 2. حذف مجلد البناء المؤقت
rm -rf .next

# 3. حذف cache المكتبات (اختياري)
rm -rf node_modules/.cache

# 4. إعادة تشغيل الخادم
npm run dev
```

## نصائح للوقاية
1. عند إجراء تغييرات كبيرة على الهيكل، أوقف الخادم أولاً
2. احذف `.next` بانتظام عند مواجهة مشاكل غريبة
3. تأكد من أن جميع الملفات محفوظة قبل إعادة التشغيل

## مشاكل مشابهة
- `MODULE_NOT_FOUND` في webpack-runtime
- `InvariantError: Expected clientReferenceManifest`
- أخطاء في prerender-manifest.json

جميعها تُحل بنفس الطريقة! 