#!/usr/bin/env node

/**
 * استبدال صفحات "من نحن" و"سياسة الخصوصية" بالنسخ المحسنة
 * 
 * هذا السكريبت سيقوم بـ:
 * 1. إنشاء نسخ احتياطية من الصفحات الأصلية
 * 2. استبدالها بالنسخ المحسنة الجديدة
 * 3. تحديث المراجع إذا لزم الأمر
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 بدء عملية استبدال الصفحات بالنسخ المحسنة...\n');

const replacements = [
  {
    original: 'app/about/page.tsx',
    enhanced: 'app/about/page-enhanced.tsx',
    backup: 'app/about/page-original.tsx',
    name: 'صفحة من نحن'
  },
  {
    original: 'app/privacy-policy/page.tsx',
    enhanced: 'app/privacy-policy/page-enhanced.tsx',
    backup: 'app/privacy-policy/page-original.tsx',
    name: 'صفحة سياسة الخصوصية'
  }
];

function backupAndReplace() {
  try {
    replacements.forEach(({ original, enhanced, backup, name }) => {
      console.log(`📄 معالجة ${name}...`);
      
      // التحقق من وجود الملفات
      if (!fs.existsSync(original)) {
        console.log(`   ⚠️  الملف الأصلي غير موجود: ${original}`);
        return;
      }
      
      if (!fs.existsSync(enhanced)) {
        console.log(`   ⚠️  النسخة المحسنة غير موجودة: ${enhanced}`);
        return;
      }
      
      // إنشاء نسخة احتياطية من الأصلي
      if (!fs.existsSync(backup)) {
        fs.copyFileSync(original, backup);
        console.log(`   💾 تم إنشاء نسخة احتياطية: ${backup}`);
      } else {
        console.log(`   ℹ️  النسخة الاحتياطية موجودة مسبقاً: ${backup}`);
      }
      
      // استبدال الملف الأصلي بالنسخة المحسنة
      fs.copyFileSync(enhanced, original);
      console.log(`   ✅ تم استبدال ${name} بالنسخة المحسنة`);
      
      console.log('');
    });
    
    console.log('🎉 تمت عملية الاستبدال بنجاح!');
    console.log('\n📝 ملاحظات هامة:');
    console.log('• تم حفظ النسخ الأصلية كملفات احتياطية');
    console.log('• الصفحات الآن تستخدم التصميم الجديد المحسن');
    console.log('• يُنصح بمسح الكاش بعد التحديث');
    
  } catch (error) {
    console.error('❌ خطأ أثناء عملية الاستبدال:', error.message);
    process.exit(1);
  }
}

// تشغيل العملية
backupAndReplace(); 