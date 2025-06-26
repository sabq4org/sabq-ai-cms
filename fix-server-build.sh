#!/bin/bash

# سكريبت سريع لحل مشكلة البناء على السيرفر
echo "🔧 إصلاح مشكلة البناء على السيرفر..."
echo ""

# سحب آخر التحديثات
echo "📥 سحب آخر التحديثات من GitHub..."
git pull
echo ""

# حذف node_modules القديم
echo "🗑️  حذف node_modules و package-lock.json..."
rm -rf node_modules package-lock.json
echo ""

# تثبيت الحزم
echo "📦 تثبيت جميع الحزم..."
npm install
echo ""

# بناء المشروع
echo "🏗️  بناء المشروع..."
npm run build

echo ""
echo "✅ تم الانتهاء!"
echo "يمكنك الآن تشغيل المشروع باستخدام: npm start" 