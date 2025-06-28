#!/bin/bash

# سكريبت إعداد بيئة الإنتاج
echo "🚀 إعداد بيئة الإنتاج..."

# 1. تثبيت الحزم
echo "📦 تثبيت الحزم..."
npm install --omit=dev

# 2. توليد Prisma
echo "🔧 توليد Prisma Client..."
npx prisma generate

# 3. بناء التطبيق
echo "🏗️ بناء التطبيق..."
npm run build

echo "✅ اكتمل الإعداد!"
echo "يمكنك الآن تشغيل: npm start أو pm2 restart all" 