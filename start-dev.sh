#!/bin/bash

echo "🚀 بدء تشغيل مشروع سبق AI CMS..."

# التحقق من وجود Node.js v20
NODE_VERSION=$(node -v)
echo "📦 إصدار Node.js: $NODE_VERSION"

# التحقق من وجود .env.local
if [ ! -f .env.local ]; then
    echo "❌ لم يتم العثور على .env.local"
    echo "📝 قم بإنشاء الملف أولاً باستخدام: ./create-env.sh"
    exit 1
fi

# تنظيف الكاش
echo "🧹 تنظيف الكاش..."
rm -rf .next

# إنشاء قاعدة البيانات إذا لزم الأمر
echo "🗄️ تحضير قاعدة البيانات..."
npx prisma generate --no-hints 2>/dev/null || true

# بدء التطبيق
echo "✨ بدء خادم التطوير..."
echo "📍 التطبيق سيعمل على: http://localhost:3000"
echo "⏳ انتظر قليلاً حتى يتم التحميل..."
echo ""

# تشغيل الخادم
npm run dev 