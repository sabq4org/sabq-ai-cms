# تبسيط إعدادات Prisma Binary Targets

## تاريخ التنفيذ
2025-01-17

## المشكلة
فشل البناء في DigitalOcean مع الخطأ:
```
Error: Unknown binaryTarget ["debian-openssl-3.0.x" and no custom engine files were provided
```

## السبب
- DigitalOcean لا يدعم `debian-openssl-3.0.x` كـ binary target بشكل مباشر
- محاولة استخدام أهداف متعددة كانت تسبب تعقيدات غير ضرورية

## الحل
تبسيط إعدادات `binaryTargets` في `prisma/schema.prisma`:
```prisma
binaryTargets = ["native"]
```

## التغييرات
1. **prisma/schema.prisma**: تغيير `binaryTargets` من قائمة معقدة إلى `["native"]` فقط
2. **scripts/digitalocean-build-v2.js**: إزالة `PRISMA_CLI_BINARY_TARGETS` من environment variables

## النتيجة
- `native` كافية للعمل في معظم البيئات
- تبسيط عملية البناء والنشر
- حل مشكلة البناء في DigitalOcean 