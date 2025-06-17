#!/bin/bash

echo "🧹 بدء تنظيف مشروع سبق..."
echo "========================="

# إنشاء مجلد النسخ الاحتياطي إن لم يكن موجوداً
mkdir -p __dev__/cleanup-$(date +%Y%m%d)

# 1. حذف ملفات السجلات
echo "📋 حذف ملفات السجلات..."
find . -name "*.log" -not -path "./node_modules/*" -not -path "./__dev__/*" -exec rm -f {} \;

# 2. حذف مجلدات البناء المؤقتة
echo "🏗️ حذف مجلدات البناء المؤقتة..."
rm -rf .next .cache .turbo

# 3. حذف ملفات النسخ الاحتياطي القديمة
echo "💾 نقل ملفات النسخ الاحتياطي..."
find . -name "*.backup*" -not -path "./node_modules/*" -not -path "./__dev__/*" -exec mv {} __dev__/cleanup-$(date +%Y%m%d)/ \; 2>/dev/null

# 4. تنظيف node_modules cache
echo "📦 تنظيف ذاكرة التخزين المؤقت..."
rm -rf node_modules/.cache

# 5. حذف ملفات DS_Store
echo "🗑️ حذف ملفات النظام..."
find . -name ".DS_Store" -exec rm -f {} \;

# 6. تشغيل npm prune
echo "🔧 تحسين حزم npm..."
npm prune --production=false

# 7. عرض حجم المشروع
echo ""
echo "📊 إحصائيات المشروع:"
echo "===================="
echo "حجم المشروع الكلي: $(du -sh . | cut -f1)"
echo "حجم node_modules: $(du -sh node_modules 2>/dev/null | cut -f1 || echo '0')"
echo "عدد الملفات: $(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | wc -l)"

echo ""
echo "✅ تم التنظيف بنجاح!"
echo "💡 نصيحة: شغل هذا السكريبت أسبوعياً للحفاظ على نظافة المشروع" 