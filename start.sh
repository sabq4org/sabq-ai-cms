#!/bin/sh

echo "🚀 بدء تشغيل تطبيق SABQ AI CMS..."

# التحقق من وجود متغيرات البيئة المطلوبة
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  تحذير: DATABASE_URL غير محدد"
fi

# محاولة تشغيل التطبيق بطرق مختلفة
if [ -f ".next/standalone/server.js" ]; then
  echo "✅ تشغيل السيرفر المستقل (standalone)..."
  cd .next/standalone && node server.js
elif [ -f "node_modules/next/dist/bin/next" ]; then
  echo "✅ تشغيل باستخدام next start..."
  node node_modules/next/dist/bin/next start
elif [ -f "node_modules/.bin/next" ]; then
  echo "✅ تشغيل باستخدام next binary..."
  ./node_modules/.bin/next start
else
  echo "✅ تشغيل باستخدام npm start..."
  npm start
fi 