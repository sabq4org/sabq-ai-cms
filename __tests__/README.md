# اختبارات محرر المقالات

هذا المجلد يحتوي على اختبارات شاملة لنظام محرر المقالات المحسن.

## هيكل الاختبارات

### 📁 components/
اختبارات مكونات واجهة المستخدم:
- `ErrorBoundary.test.tsx` - اختبارات مكون Error Boundary

### 📁 services/
اختبارات الخدمات الأساسية:
- `AutoSaveService.test.ts` - اختبارات خدمة الحفظ التلقائي
- `NotificationService.test.ts` - اختبارات خدمة الإشعارات

### 📁 hooks/
اختبارات React Hooks:
- `useAutoSave.test.tsx` - اختبارات hook الحفظ التلقائي

### 📁 integration/
اختبارات التكامل:
- `EditorWorkflow.test.tsx` - اختبارات سير العمل الكامل للمحرر

### 📁 performance/
اختبارات الأداء:
- `EditorPerformance.test.tsx` - اختبارات أداء المحررات

### 📁 accessibility/
اختبارات إمكانية الوصول:
- `EditorAccessibility.test.tsx` - اختبارات إمكانية الوصول

## تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
npm test
```

### تشغيل الاختبارات في وضع المراقبة
```bash
npm run test:watch
```

### تشغيل الاختبارات مع تقرير التغطية
```bash
npm run test:coverage
```

### تشغيل الاختبارات في CI/CD
```bash
npm run test:ci
```

## أنواع الاختبارات

### 🧪 اختبارات الوحدة (Unit Tests)
- تختبر مكونات فردية بمعزل عن باقي النظام
- تركز على وظائف محددة
- سريعة التنفيذ

### 🔗 اختبارات التكامل (Integration Tests)
- تختبر تفاعل عدة مكونات معاً
- تحاكي سيناريوهات المستخدم الحقيقية
- تتأكد من عمل النظام ككل

### ⚡ اختبارات الأداء (Performance Tests)
- تقيس أوقات التحميل والاستجابة
- تكتشف مشاكل الأداء
- تراقب استهلاك الذاكرة

### ♿ اختبارات إمكانية الوصول (Accessibility Tests)
- تتأكد من دعم قارئات الشاشة
- تختبر التنقل بلوحة المفاتيح
- تفحص تباين الألوان

## معايير النجاح

### تغطية الكود
- الحد الأدنى: 70%
- الهدف: 85%+

### الأداء
- وقت تحميل المحرر: < 3 ثوانٍ
- وقت الاستجابة: < 100ms
- استهلاك الذاكرة: < 50MB

### إمكانية الوصول
- جميع اختبارات axe تمر بنجاح
- دعم كامل للتنقل بلوحة المفاتيح
- تباين ألوان مناسب (4.5:1 على الأقل)

## إضافة اختبارات جديدة

### 1. اختبارات المكونات
```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('يعرض المحتوى بشكل صحيح', () => {
    render(<MyComponent />);
    expect(screen.getByText('النص المتوقع')).toBeInTheDocument();
  });
});
```

### 2. اختبارات الخدمات
```typescript
import { myService } from '@/lib/services/MyService';

describe('MyService', () => {
  it('ينفذ العملية بنجاح', async () => {
    const result = await myService.doSomething();
    expect(result).toBeDefined();
  });
});
```

### 3. اختبارات الأداء
```typescript
describe('Performance', () => {
  it('يحمل في وقت معقول', async () => {
    const startTime = performance.now();
    // تنفيذ العملية
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(1000);
  });
});
```

## نصائح للاختبار

### ✅ أفضل الممارسات
- اكتب اختبارات واضحة ومفهومة
- استخدم أسماء وصفية للاختبارات
- اختبر السيناريوهات الإيجابية والسلبية
- استخدم mocks للتبعيات الخارجية

### ❌ تجنب
- الاختبارات المعقدة جداً
- الاعتماد على ترتيب تنفيذ الاختبارات
- اختبار تفاصيل التنفيذ بدلاً من السلوك
- إهمال تنظيف الموارد بعد الاختبار

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### خطأ: "Cannot find module"
```bash
# تأكد من تثبيت التبعيات
npm install

# تحقق من مسارات الاستيراد
# استخدم @ للمسارات المطلقة
```

#### خطأ: "ReferenceError: window is not defined"
```typescript
// استخدم beforeEach لإعداد البيئة
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
});
```

#### خطأ: "act() warning"
```typescript
// استخدم act() للعمليات غير المتزامنة
import { act } from '@testing-library/react';

await act(async () => {
  // العملية غير المتزامنة
});
```

## الموارد المفيدة

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Jest Axe](https://github.com/nickcolley/jest-axe)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)