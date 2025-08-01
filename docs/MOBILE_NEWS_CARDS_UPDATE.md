# تحديثات بطاقات الأخبار للنسخة الخفيفة

## ملخص التغييرات

تم تحديث بطاقات الأخبار في النسخة الخفيفة للهواتف وقسم الأخبار بناءً على الطلبات التالية:

1. **إزالة التصنيفات** - تم إخفاء جميع التصنيفات من البطاقات
2. **تخفيف الخط** - تم تغيير العناوين من Bold إلى SemiBold  
3. **زيادة عدد الأسطر** - تم تحديد عناوين الأخبار بحد أقصى 3 أسطر بدلاً من 2

## الملفات المحدثة

### 1. مكونات النسخة الخفيفة

#### `components/mobile/EnhancedMobileNewsCard.tsx`
- إزالة عرض التصنيف من البطاقات
- تغيير `font-bold` إلى `font-semibold` 
- تغيير `line-clamp-2` إلى `line-clamp-3`

#### `components/mobile/MobileNewsCard.tsx`
- إزالة قسم التصنيف بالكامل
- تحديث العناوين لاستخدام `font-semibold`
- زيادة عدد الأسطر المسموحة للعناوين

### 2. الصفحة الرئيسية

#### `app/page-client.tsx`
- إزالة شارة التصنيف من بطاقات الأخبار
- تحديث وزن الخط في العناوين
- زيادة حد الأسطر إلى 3

### 3. المكونات الذكية

#### `components/smart-blocks/CardGridBlock.tsx`
- تحديث العناوين لاستخدام `font-medium`
- إضافة `line-clamp-3`

#### `components/smart-blocks/SmartDigestBlock.tsx`
- إزالة عرض التصنيفات ونوع المحتوى
- تحديث وزن خط العناوين
- زيادة عدد الأسطر المسموحة

### 4. ملف CSS جديد

#### `styles/mobile-news-cards.css`
- قواعد CSS لتطبيق التغييرات بشكل موحد
- إخفاء جميع عناصر التصنيف
- تحديد line-clamp-3
- تحسينات في الأداء والقابلية للقراءة

## مثال على البطاقة المحدثة

### قبل التحديث:
```
[التصنيف: تقنية]
عنوان الخبر الطويل جداً الذي يمكن أن...
```

### بعد التحديث:
```
عنوان الخبر الطويل جداً الذي يمكن أن يمتد
إلى ثلاثة أسطر كاملة بدلاً من سطرين فقط
مما يوفر مساحة أكبر لعرض العنوان...
```

## الفوائد

1. **مساحة أكبر للعناوين** - 3 أسطر تسمح بعرض عناوين أطول وأكثر وضوحاً
2. **تصميم أنظف** - إزالة التصنيف يوفر مساحة ويقلل الفوضى البصرية
3. **قراءة أسهل** - الخط الأخف وزناً (SemiBold) أقل إزعاجاً وأسهل في القراءة
4. **تجربة موحدة** - نفس التصميم في جميع أقسام التطبيق

## ملاحظات للمطورين

- جميع التغييرات متوافقة مع الوضع الليلي والنهاري
- التغييرات لا تؤثر على الأداء
- يمكن إعادة التصنيفات بسهولة بإزالة قواعد CSS المضافة
- الخط SemiBold (وزن 600) يوفر توازناً جيداً بين الوضوح والأناقة 