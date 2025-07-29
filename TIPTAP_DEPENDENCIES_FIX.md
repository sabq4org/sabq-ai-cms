# 🔧 إصلاح تعارض إصدارات @tiptap

## 📅 التاريخ: 28 يناير 2025

## ❌ المشكلة
```
npm error While resolving: @tiptap/extension-table@3.0.7
npm error Found: @tiptap/core@2.26.1
npm error Could not resolve dependency:
npm error peer @tiptap/core@"^3.0.7" from @tiptap/extension-table@3.0.7
```

## 🔍 السبب
كان هناك خليط من إصدارات @tiptap:
- بعض الحزم تستخدم v2.26.1
- بعض الحزم تستخدم v3.0.7
- عدم وجود @tiptap/core بشكل صريح

## ✅ الحل

### 1. **توحيد الإصدارات**
تم تحديث جميع حزم @tiptap إلى الإصدار v2.26.1:
```json
"@tiptap/core": "^2.26.1",
"@tiptap/extension-blockquote": "^2.26.1",
"@tiptap/extension-character-count": "^2.26.1",
"@tiptap/extension-color": "^2.26.1",
"@tiptap/extension-image": "^2.26.1",
"@tiptap/extension-link": "^2.26.1",
"@tiptap/extension-placeholder": "^2.26.1",
"@tiptap/extension-table": "^2.26.1",
"@tiptap/extension-table-cell": "^2.26.1",
"@tiptap/extension-table-header": "^2.26.1",
"@tiptap/extension-table-row": "^2.26.1",
"@tiptap/extension-text-align": "^2.26.1",
"@tiptap/extension-text-style": "^2.26.1",
"@tiptap/extension-underline": "^2.26.1",
"@tiptap/extension-youtube": "^2.26.1",
"@tiptap/react": "^2.26.1",
"@tiptap/starter-kit": "^2.26.1"
```

### 2. **تحديث Dockerfile**
```dockerfile
# تثبيت التبعيات مع دعم sharp للـ Alpine
RUN npm ci --legacy-peer-deps --include=optional
RUN npm install sharp@0.33.2 --platform=linuxmusl --arch=x64 --legacy-peer-deps
```

### 3. **إضافة متغيرات البيئة**
```dockerfile
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
```

## 📝 الملفات المحدثة
1. `package.json` - توحيد إصدارات @tiptap
2. `package-lock.json` - إعادة إنشاء مع --legacy-peer-deps
3. `Dockerfile` - إضافة --legacy-peer-deps

## 🚀 البناء في Docker
```bash
docker build -t sabq-ai-cms .
```

## ⚠️ ملاحظات مهمة
- استخدم دائماً `--legacy-peer-deps` عند تثبيت التبعيات
- لا تخلط بين إصدارات @tiptap v2 و v3
- تأكد من وجود @tiptap/core بشكل صريح في package.json

## 📊 النتيجة
✅ **تم حل تعارض التبعيات بنجاح**

**Commit**: `d574650e` 