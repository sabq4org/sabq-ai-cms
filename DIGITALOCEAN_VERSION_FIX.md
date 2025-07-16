# 🔧 حل مشكلة اكتشاف النسخة في DigitalOcean

## المشكلة
DigitalOcean لا يكتشف رقم نسخة التطبيق تلقائياً من `package.json`.

## الحلول المطبقة

### 1. **ملفات تعريف النسخة**
تم إنشاء عدة ملفات لمساعدة DigitalOcean على اكتشاف النسخة:

#### أ. `app.json` (الملف الرئيسي)
```json
{
  "name": "sabq-ai-cms",
  "version": "0.2.2"
}
```

#### ب. `version.json`
```json
{
  "version": "0.2.2",
  "name": "sabq-ai-cms"
}
```

#### ج. `.version`
```
0.2.2
```

### 2. **تحديث ملف `.do/app.yaml`**
تم إضافة متغيرات البيئة الخاصة بالنسخة:

```yaml
envs:
  - key: APP_VERSION
    value: "0.2.2"
  - key: APP_NAME
    value: "sabq-ai-cms"
```

### 3. **ملف `.do/deploy.template.yaml`**
ملف نموذج للنشر يحتوي على metadata:

```yaml
metadata:
  app_version: "0.2.2"
  framework: "next.js"
  node_version: ">=18.0.0"
```

### 4. **سكريبت عرض النسخة**
`scripts/show-version.js` - يعرض معلومات النسخة ويكتبها إلى ملف:

```bash
node scripts/show-version.js
```

### 5. **ملف `app/BUILD_VERSION.tsx`**
يحتوي على معلومات البناء:

```typescript
export const BUILD_VERSION = '0.2.2';
```

## كيفية التحقق في DigitalOcean

### 1. من لوحة التحكم:
- اذهب إلى App Platform
- اختر التطبيق `sabq-ai-cms`
- انظر في قسم "App Info" أو "Overview"

### 2. من CLI:
```bash
doctl apps list
doctl apps get <app-id>
```

### 3. من متغيرات البيئة:
في التطبيق المنشور، يمكنك الوصول للنسخة عبر:
```javascript
process.env.APP_VERSION // "0.2.2"
```

## إذا استمرت المشكلة

### 1. تأكد من Git tags:
```bash
git tag v0.2.2
git push origin v0.2.2
```

### 2. أضف في Build Command:
```yaml
build_command: node scripts/show-version.js && npm run build:do
```

### 3. استخدم API:
```javascript
// في صفحة API
export async function GET() {
  return Response.json({
    version: process.env.APP_VERSION || "0.2.2",
    package_version: require('./package.json').version
  });
}
```

## التحديث المستقبلي للنسخة

عند تحديث النسخة، يجب تحديث:
1. `package.json`
2. `app.json`
3. `version.json`
4. `.version`
5. `.do/app.yaml` (APP_VERSION)
6. `app/BUILD_VERSION.tsx`

يمكن استخدام سكريبت لتحديث كل الملفات:
```bash
npm version patch # أو minor أو major
node scripts/update-version-files.js
``` 