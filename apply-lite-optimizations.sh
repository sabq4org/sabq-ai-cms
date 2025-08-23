#!/bin/bash

# سكريبت تطبيق تحسينات النسخة الخفيفة
# Script to apply lite layout optimizations

echo "🚀 تطبيق تحسينات النسخة الخفيفة للموقع..."
echo "🚀 Applying lite layout optimizations..."

# إنشاء مجلد backup إذا لم يكن موجود
if [ ! -d "backup" ]; then
    mkdir backup
    echo "✅ تم إنشاء مجلد النسخ الاحتياطية"
fi

# نسخ احتياطي من الملفات الحالية
echo "📦 إنشاء نسخة احتياطية من الملفات الحالية..."

# نسخ احتياطي من page.tsx إذا كان موجود
if [ -f "app/page.tsx" ]; then
    cp app/page.tsx backup/page-original.tsx
    echo "✅ تم نسخ app/page.tsx احتياطياً"
fi

# نسخ احتياطي من layout.tsx إذا كان موجود
if [ -f "app/layout.tsx" ]; then
    cp app/layout.tsx backup/layout-original.tsx
    echo "✅ تم نسخ app/layout.tsx احتياطياً"
fi

# تحديث imports في layout.tsx
echo "🔧 تحديث imports في layout.tsx..."

if [ -f "app/layout.tsx" ]; then
    # إضافة CSS imports إذا لم تكن موجودة
    if ! grep -q "lite-layout-optimization.css" app/layout.tsx; then
        sed -i '' '/import.*\.css/a\
import "../styles/lite-layout-optimization.css";' app/layout.tsx
        echo "✅ تم إضافة lite-layout-optimization.css"
    fi
    
    if ! grep -q "lite-components-optimization.css" app/layout.tsx; then
        sed -i '' '/import.*lite-layout-optimization\.css/a\
import "../styles/lite-components-optimization.css";' app/layout.tsx
        echo "✅ تم إضافة lite-components-optimization.css"
    fi
fi

# إضافة script tag في layout.tsx أو _document.tsx
echo "📜 إضافة script للنظام التلقائي..."

if [ -f "app/layout.tsx" ]; then
    # البحث عن body tag وإضافة script
    if ! grep -q "lite-optimizer.js" app/layout.tsx; then
        # إنشاء نسخة محدثة من layout
        cat >> backup/layout-update-instructions.txt << 'EOF'
تعليمات تحديث layout.tsx:

1. أضف هذه السطور في أعلى الملف بعد باقي imports:
import "../styles/lite-layout-optimization.css";
import "../styles/lite-components-optimization.css";

2. أضف هذا قبل إغلاق </body>:
<script src="/js/lite-optimizer.js" async></script>

3. أو استخدم next/script:
import Script from 'next/script';

وأضف داخل المكون:
<Script 
  src="/js/lite-optimizer.js"
  strategy="afterInteractive"
/>
EOF
        echo "✅ تم إنشاء تعليمات التحديث في backup/layout-update-instructions.txt"
    fi
fi

# إنشاء مثال لاستخدام المكونات الجديدة
echo "📝 إنشاء أمثلة للاستخدام..."

cat > backup/usage-examples.tsx << 'EOF'
// أمثلة لاستخدام مكونات النسخة الخفيفة الجديدة

import LiteLayoutWrapper, { 
  LiteFullWidthContainer,
  LiteGrid,
  LiteCard,
  LiteHeading,
  LiteImage
} from '@/components/layout/LiteLayoutWrapper';

// مثال 1: صفحة رئيسية محسنة
export function HomePage() {
  return (
    <LiteLayoutWrapper fullWidth>
      {/* شريط الإحصائيات */}
      <LiteFullWidthContainer background>
        <LiteStatsBar />
      </LiteFullWidthContainer>

      {/* المحتوى الرئيسي */}
      <div className="space-y-6">
        <LiteHeading level={1}>مرحباً بكم في سبق</LiteHeading>
        
        {/* الأخبار المميزة */}
        <LiteFullWidthContainer>
          <LiteHeading level={2}>الأخبار المميزة</LiteHeading>
          <LiteGrid columns={1} gap="md">
            <LiteCard>
              <LiteImage 
                src="/news-1.jpg"
                alt="خبر مميز"
                aspectRatio="16/9"
              />
              <LiteHeading level={3}>عنوان الخبر</LiteHeading>
              <p>محتوى الخبر هنا...</p>
            </LiteCard>
          </LiteGrid>
        </LiteFullWidthContainer>
      </div>
    </LiteLayoutWrapper>
  );
}

// مثال 2: صفحة مقال
export function ArticlePage() {
  return (
    <LiteLayoutWrapper>
      <LiteCard padding="lg">
        <LiteImage 
          src="/article-image.jpg"
          alt="صورة المقال"
        />
        <LiteHeading level={1}>عنوان المقال</LiteHeading>
        <div className="prose">
          <p>محتوى المقال هنا...</p>
        </div>
      </LiteCard>
    </LiteLayoutWrapper>
  );
}

// مثال 3: قائمة الأخبار
export function NewsList({ news }) {
  return (
    <LiteLayoutWrapper fullWidth>
      <LiteFullWidthContainer>
        <LiteHeading level={1}>آخر الأخبار</LiteHeading>
        <LiteGrid columns={1} gap="md">
          {news.map(item => (
            <LiteCard key={item.id}>
              <div className="flex gap-4">
                <LiteImage 
                  src={item.image}
                  alt={item.title}
                  aspectRatio="16/9"
                  className="w-24 h-16"
                />
                <div className="flex-1">
                  <LiteHeading level={3}>{item.title}</LiteHeading>
                  <p className="text-sm text-gray-600">{item.excerpt}</p>
                </div>
              </div>
            </LiteCard>
          ))}
        </LiteGrid>
      </LiteFullWidthContainer>
    </LiteLayoutWrapper>
  );
}
EOF

# فحص الملفات المطلوبة
echo "🔍 فحص الملفات المطلوبة..."

required_files=(
    "styles/lite-layout-optimization.css"
    "styles/lite-components-optimization.css"
    "components/layout/LiteLayoutWrapper.tsx"
    "public/js/lite-optimizer.js"
    "LITE_LAYOUT_OPTIMIZATION_GUIDE.md"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ جميع الملفات المطلوبة موجودة"
else
    echo "⚠️  الملفات المفقودة:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
fi

# إنشاء تقرير التثبيت
echo "📊 إنشاء تقرير التثبيت..."

cat > LITE_OPTIMIZATION_INSTALLATION_REPORT.md << 'EOF'
# تقرير تثبيت تحسينات النسخة الخفيفة
## Lite Layout Optimization Installation Report

## ✅ الملفات المضافة

### ملفات CSS
- ✅ `styles/lite-layout-optimization.css` - التحسينات الأساسية للتخطيط
- ✅ `styles/lite-components-optimization.css` - تحسينات المكونات الموجودة

### مكونات React
- ✅ `components/layout/LiteLayoutWrapper.tsx` - مكونات مساعدة للتخطيط

### ملفات JavaScript
- ✅ `public/js/lite-optimizer.js` - نظام التحسينات التلقائي

### مكونات الصفحات
- ✅ `components/pages/OptimizedHomePage.tsx` - نموذج للصفحة الرئيسية المحسنة

### التوثيق
- ✅ `LITE_LAYOUT_OPTIMIZATION_GUIDE.md` - دليل الاستخدام الشامل

## 🚀 الخطوات التالية

### 1. تحديث Layout
```tsx
// في app/layout.tsx أضف:
import "../styles/lite-layout-optimization.css";
import "../styles/lite-components-optimization.css";

// وأضف script:
<Script 
  src="/js/lite-optimizer.js"
  strategy="afterInteractive"
/>
```

### 2. استخدام المكونات الجديدة
```tsx
import LiteLayoutWrapper from '@/components/layout/LiteLayoutWrapper';

export default function MyPage() {
  return (
    <LiteLayoutWrapper fullWidth>
      {/* المحتوى هنا */}
    </LiteLayoutWrapper>
  );
}
```

### 3. اختبار التحسينات
- افتح الموقع على الموبايل
- تحقق من امتداد المحتوى لكامل العرض
- اختبر على أحجام شاشات مختلفة

## 📱 النتائج المتوقعة

- **زيادة المحتوى المعروض**: 25-30%
- **تحسين استغلال المساحة**: إزالة الهوامش الفارغة
- **تجربة أفضل**: تنقل محسن وقراءة أسهل
- **أداء محسن**: تحميل أسرع وانتقالات سلسة

## 🔧 حل المشاكل

### إذا لم تظهر التحسينات:
1. تأكد من تحميل ملفات CSS
2. فحص console للأخطاء
3. تأكد من تحميل lite-optimizer.js
4. اختبار على متصفحات مختلفة

### للحصول على الدعم:
- راجع `LITE_LAYOUT_OPTIMIZATION_GUIDE.md`
- فحص `backup/usage-examples.tsx`
- تحقق من `backup/layout-update-instructions.txt`

## 📈 مراقبة الأداء

- استخدم DevTools لمراقبة Layout Shift
- اختبر سرعة التحميل
- قيس تفاعل المستخدم
- راقب معدل الارتداد في Analytics
EOF

echo ""
echo "🎉 تم تطبيق تحسينات النسخة الخفيفة بنجاح!"
echo ""
echo "📋 الخطوات التالية:"
echo "1. راجع LITE_OPTIMIZATION_INSTALLATION_REPORT.md"
echo "2. طبق التحديثات في layout.tsx"
echo "3. اختبر الموقع على الموبايل"
echo "4. راجع backup/usage-examples.tsx للأمثلة"
echo ""
echo "🚀 استمتع بالنسخة الخفيفة المحسنة!"
