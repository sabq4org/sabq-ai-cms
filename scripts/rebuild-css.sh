#!/bin/bash

echo "🔧 إعادة بناء CSS..."

# حذف ملفات البناء القديمة
echo "🗑️  حذف ملفات البناء القديمة..."
rm -rf .next
rm -rf node_modules/.cache

# إعادة تثبيت التبعيات
echo "📦 إعادة تثبيت التبعيات..."
npm install

# بناء المشروع
echo "🏗️  بناء المشروع..."
npm run build

echo "✅ تم إعادة بناء CSS بنجاح!"
echo "🚀 يمكنك الآن تشغيل: npm start" 