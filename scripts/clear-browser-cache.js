#!/usr/bin/env node

/**
 * سكريبت لمساعدة المستخدم في حل مشاكل التخزين المؤقت
 * يوضح كيفية مسح cache المتصفح والخادم
 */

console.log(`
🔧 دليل إصلاح مشاكل التخزين المؤقت
════════════════════════════════════════

📋 المشكلة المحتملة:
   خطأ "undefined is not an object (evaluating 'W.published')"
   قد يكون بسبب التخزين المؤقت للمتصفح أو الخادم.

🛠️ الحلول المقترحة:

1️⃣ مسح Cache المتصفح:
   • Safari: Develop > Empty Caches (Cmd+Opt+E)
   • Chrome: DevTools > Application > Storage > Clear Storage
   • Firefox: DevTools > Storage > Clear All

2️⃣ Hard Refresh:
   • Mac: Cmd + Shift + R
   • PC: Ctrl + Shift + R
   • أو: Cmd/Ctrl + F5

3️⃣ إعادة تشغيل الخادم:
   • أوقف الخادم: Ctrl+C
   • شغل الخادم: npm run dev

4️⃣ مسح Next.js Cache:
   • rm -rf .next
   • npm run dev

5️⃣ مسح node_modules (إذا لزم الأمر):
   • rm -rf node_modules
   • rm package-lock.json
   • npm install
   • npm run dev

📊 تم إصلاح الكود أيضاً:
   ✅ إضافة حماية ضد البيانات المعطلة
   ✅ تحسين معالجة الأخطاء
   ✅ فحص سلامة البيانات

🎯 بعد تطبيق الحلول:
   1. افتح /admin/news في المتصفح
   2. تحقق من عدم ظهور الخطأ
   3. تأكد من تحميل البيانات بشكل صحيح

💡 إذا استمر الخطأ:
   تحقق من console المتصفح للمزيد من التفاصيل
   وتأكد من تحديث الصفحة بالكامل.
`);

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('هل تريد مسح Next.js cache الآن؟ (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    const { execSync } = require('child_process');
    
    try {
      console.log('🗑️ مسح .next cache...');
      execSync('rm -rf .next', { cwd: process.cwd() });
      console.log('✅ تم مسح cache بنجاح');
      console.log('💡 شغل الخادم مرة أخرى: npm run dev');
    } catch (error) {
      console.error('❌ خطأ في مسح cache:', error.message);
    }
  } else {
    console.log('👍 لم يتم مسح cache');
  }
  
  rl.close();
});