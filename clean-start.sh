#!/bin/bash

# سكريبت تنظيف وإعادة تشغيل مشروع سبق
echo "🧹 تنظيف مشروع سبق..."

# إيقاف أي عمليات Next.js قيد التشغيل
echo "⏹️  إيقاف الخوادم السابقة..."
pkill -f "next dev" 2>/dev/null || true

# حذف المجلدات المؤقتة
echo "🗑️  حذف المجلدات المؤقتة..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# حذف ملفات البناء المؤقتة
echo "📦 حذف ملفات البناء المؤقتة..."
rm -rf tsconfig.tsbuildinfo

# إعادة تثبيت التبعيات (اختياري)
read -p "هل تريد إعادة تثبيت التبعيات؟ (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📥 إعادة تثبيت التبعيات..."
    rm -rf node_modules
    npm install
fi

# تشغيل المشروع
echo "🚀 تشغيل مشروع سبق..."
npm run dev 