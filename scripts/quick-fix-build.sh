#!/bin/bash

# حل سريع لمشكلة صلاحيات البناء

echo "🚀 حل سريع لمشكلة البناء..."

# 1. حذف المجلدات المشكلة
echo "1️⃣ حذف المجلدات القديمة..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# 2. إنشاء مجلد .next نظيف
echo "2️⃣ إنشاء مجلد .next جديد..."
mkdir -p .next
chmod 755 .next

# 3. تنظيف npm cache
echo "3️⃣ تنظيف npm cache..."
npm cache clean --force

# 4. البناء مباشرة
echo "4️⃣ بدء البناء..."
npm run build

echo "✅ انتهى!" 