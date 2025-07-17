#!/bin/sh

echo "🚀 بدء تشغيل تطبيق SABQ AI CMS..."

# التحقق من وجود متغيرات البيئة المطلوبة
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  تحذير: DATABASE_URL غير محدد"
fi

# تعيين المنفذ (افتراضي 3000)
PORT=${PORT:-3000}
export PORT
echo "📡 المنفذ المحدد: $PORT"

# التحقق من وجود prerender-manifest.json وإنشاؤه إذا لزم الأمر
if [ ! -f ".next/prerender-manifest.json" ]; then
  echo "⚠️  prerender-manifest.json مفقود، جاري إنشاؤه..."
  mkdir -p .next
  echo '{
    "version": 3,
    "routes": {},
    "dynamicRoutes": {},
    "notFoundRoutes": [],
    "preview": {
      "previewModeId": "preview-mode-id",
      "previewModeSigningKey": "preview-mode-signing-key",
      "previewModeEncryptionKey": "preview-mode-encryption-key"
    }
  }' > .next/prerender-manifest.json
  echo "✅ تم إنشاء prerender-manifest.json"
fi

# محاولة تشغيل التطبيق بطرق مختلفة
if [ -f ".next/standalone/server.js" ]; then
  echo "✅ تشغيل السيرفر المستقل (standalone)..."
  cd .next/standalone && HOSTNAME=0.0.0.0 node server.js
elif [ -f "node_modules/next/dist/bin/next" ]; then
  echo "✅ تشغيل باستخدام next start..."
  HOSTNAME=0.0.0.0 node node_modules/next/dist/bin/next start -H 0.0.0.0 -p $PORT
elif [ -f "node_modules/.bin/next" ]; then
  echo "✅ تشغيل باستخدام next binary..."
  HOSTNAME=0.0.0.0 ./node_modules/.bin/next start -H 0.0.0.0 -p $PORT
else
  echo "✅ تشغيل باستخدام npm start..."
  HOSTNAME=0.0.0.0 npm start
fi 