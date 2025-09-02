# تحليل وتحسين حجم الحزم

## المشكلة الحالية
```
asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
- 50509.js (10.4 MiB) 
- vendor-48b883da36534f7c.js (2.08 MiB)
```

## المكتبات المشتبه بها (كبيرة الحجم)

### 1. مكتبات التحرير الثقيلة
```json
"@tiptap/core": "^2.26.1",
"@tiptap/react": "^2.26.1", 
"@tiptap/starter-kit": "^2.26.1",
"@tiptap/extension-collaboration": "^3.0.9",
```
**الحل**: تحميل ديناميكي للمحرر فقط في صفحات التحرير

### 2. مكتبات الرسوم البيانية
```json
"chart.js": "^4.5.0",
"react-chartjs-2": "^5.3.0",
"recharts": "^3.1.0",
"d3-cloud": "^1.2.7",
"react-wordcloud": "^1.2.7"
```
**الحل**: تحميل ديناميكي للرسوم في Dashboard فقط

### 3. AWS SDK
```json
"aws-sdk": "^2.1692.0"
```
**الحل**: استخدام AWS SDK v3 المحدث والأصغر حجماً

## خطة التحسين

### المرحلة 1: التحميل الديناميكي
```typescript
// بدلاً من
import { TipTap } from '@tiptap/react'

// استخدم
const TipTap = dynamic(() => import('@tiptap/react'), { ssr: false })
```

### المرحلة 2: تقسيم الكود
```typescript
// تحميل مكتبات الرسوم فقط في dashboard
const Charts = dynamic(() => import('@/components/Charts'), {
  loading: () => <div>Loading charts...</div>
})
```

### المرحلة 3: إزالة المكتبات غير المستخدمة
- مراجعة جميع المكتبات في package.json
- إزالة dependencies غير المستخدمة
- استخدام tree-shaking

## النتائج المتوقعة
- تقليل الحزمة الأولية بنسبة 60-70%
- تحسين LCP من 4s إلى 2s
- تحسين FCP وCLS
