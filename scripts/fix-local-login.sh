#!/bin/bash

echo "🔧 إصلاح مشكلة تسجيل الدخول المحلي..."

# 1. إيقاف أي عمليات Next.js قيد التشغيل
echo "🛑 إيقاف العمليات القديمة..."
pkill -f "next dev" 2>/dev/null || true

# 2. حذف ملفات البناء والكاش
echo "🗑️  تنظيف الملفات المؤقتة..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# 3. مسح بيانات المتصفح المحلية
echo "🧹 تعليمات مسح بيانات المتصفح:"
echo "  1. افتح http://localhost:3000 في المتصفح"
echo "  2. اضغط F12 لفتح أدوات المطور"
echo "  3. اذهب إلى تبويب Application"
echo "  4. من القائمة الجانبية، امسح:"
echo "     - Local Storage > localhost:3000"
echo "     - Session Storage > localhost:3000"
echo "     - Cookies > localhost:3000"
echo ""

# 4. إعادة تثبيت التبعيات (اختياري)
read -p "هل تريد إعادة تثبيت node_modules؟ (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "📦 إعادة تثبيت التبعيات..."
  rm -rf node_modules
  npm install
fi

# 5. تشغيل السيرفر المحلي
echo "🚀 تشغيل السيرفر المحلي..."
npm run dev 