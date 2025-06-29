#!/bin/bash

# سكريبت إعداد وتشغيل المشروع على السيرفر
echo "🚀 إعداد المشروع على السيرفر..."

# 1. تثبيت التبعيات
echo "📦 تثبيت التبعيات..."
npm install --production

# 2. إنشاء ملفات Prisma
echo "🔧 إعداد Prisma..."
npx prisma generate

# 3. تحديث قاعدة البيانات
echo "🗄️ تحديث قاعدة البيانات..."
npx prisma db push --skip-generate

# 4. بناء المشروع (إذا لم يكن مبني)
if [ ! -d ".next" ]; then
  echo "🏗️ بناء المشروع..."
  npm run build
fi

# 5. التحقق من PM2
if command -v pm2 &> /dev/null; then
  echo "🔄 إعادة تشغيل التطبيق عبر PM2..."
  pm2 restart ecosystem.config.js --update-env
  pm2 save
  echo "✅ تم إعادة تشغيل التطبيق"
else
  echo "⚠️ PM2 غير مثبت. تشغيل التطبيق مباشرة..."
  npm run start
fi

echo ""
echo "✅ تم إعداد المشروع بنجاح!"
echo ""
echo "📋 للتحقق من حالة التطبيق:"
echo "   pm2 status"
echo "   pm2 logs" 