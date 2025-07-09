#!/bin/bash

# 🧪 سكريبت اختبار التحسينات الجديدة للموبايل - مشروع سبق

echo "🧪 بدء اختبار التحسينات الجديدة للموبايل..."
echo ""

# التحقق من وجود الملفات الجديدة
echo "📁 التحقق من الملفات الجديدة:"

if [ -f "styles/mobile-critical-fixes.css" ]; then
    echo "✅ ملف mobile-critical-fixes.css موجود"
else
    echo "❌ ملف mobile-critical-fixes.css مفقود"
fi

if [ -f "components/mobile/EnhancedMobileHeader.tsx" ]; then
    echo "✅ ملف EnhancedMobileHeader.tsx موجود"
else
    echo "❌ ملف EnhancedMobileHeader.tsx مفقود"
fi

if [ -f "components/mobile/EnhancedMobileArticleCard.tsx" ]; then
    echo "✅ ملف EnhancedMobileArticleCard.tsx موجود"
else
    echo "❌ ملف EnhancedMobileArticleCard.tsx مفقود"
fi

if [ -f "components/mobile/EnhancedMobileLayout.tsx" ]; then
    echo "✅ ملف EnhancedMobileLayout.tsx موجود"
else
    echo "❌ ملف EnhancedMobileLayout.tsx مفقود"
fi

echo ""

# التحقق من تحميل CSS في layout.tsx
echo "🔍 التحقق من تحميل CSS في layout.tsx:"

if grep -q "mobile-critical-fixes.css" "app/layout.tsx"; then
    echo "✅ ملف CSS محمل في layout.tsx"
else
    echo "❌ ملف CSS غير محمل في layout.tsx"
fi

echo ""

# بناء المشروع
echo "🏗️ بناء المشروع للتأكد من عدم وجود أخطاء..."

npm run build

if [ $? -eq 0 ]; then
    echo "✅ البناء نجح بدون أخطاء"
else
    echo "❌ هناك أخطاء في البناء"
fi

echo ""

# اختبار TypeScript
echo "🔧 اختبار TypeScript..."

npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript لا يحتوي على أخطاء"
else
    echo "❌ هناك أخطاء في TypeScript"
fi

echo ""

# اختبار ESLint
echo "🔍 اختبار ESLint..."

npx eslint . --ext .ts,.tsx --max-warnings 0

if [ $? -eq 0 ]; then
    echo "✅ ESLint لا يحتوي على أخطاء"
else
    echo "❌ هناك أخطاء في ESLint"
fi

echo ""

# التحقق من حجم CSS
echo "📊 حجم ملفات CSS:"

if [ -f "styles/mobile-critical-fixes.css" ]; then
    size=$(wc -c < "styles/mobile-critical-fixes.css")
    echo "📄 mobile-critical-fixes.css: $size bytes"
fi

echo ""

# ملخص التحسينات
echo "📋 ملخص التحسينات المطبقة:"
echo "✅ إصلاح البطاقات والكروت"
echo "✅ إصلاح الأزرار والتفاعل"
echo "✅ إصلاح الألوان والتباين"
echo "✅ إصلاح الهيدر والتنقل"
echo "✅ إصلاح التخطيط العام"
echo "✅ إصلاح الصور والوسائط"
echo "✅ إصلاح المعلومات والبيانات"
echo "✅ تحسينات خاصة بالشاشات الصغيرة"
echo "✅ تحسينات الوضع الليلي"
echo "✅ تحسينات الأداء"
echo "✅ إصلاحات نهائية"
echo "✅ استجابة للشاشات المختلفة"
echo "✅ إصلاحات نهائية للتأكد من الجودة"

echo ""

echo "🎉 اختبار التحسينات مكتمل!"
echo "🚀 المشروع جاهز للاختبار على الأجهزة المختلفة"
echo ""
echo "📱 للاختبار على الموبايل:"
echo "   1. افتح http://localhost:3000 على الموبايل"
echo "   2. اختبر جميع الصفحات"
echo "   3. تأكد من وضوح الأزرار والبطاقات"
echo "   4. اختبر الوضع الليلي"
echo "   5. اختبر القوائم الجانبية"
echo ""
echo "🔧 للاختبار على المتصفح:"
echo "   1. افتح أدوات المطور (F12)"
echo "   2. اختر وضع الموبايل"
echo "   3. اختبر أحجام شاشات مختلفة"
echo "   4. تأكد من عدم وجود أخطاء في Console" 