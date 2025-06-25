const fs = require('fs').promises;
const path = require('path');

async function fixPageSyntax() {
  try {
    console.log('🔧 بدء إصلاح أخطاء الصفحة الرئيسية...');
    
    const filePath = path.join(__dirname, '../app/page.tsx');
    let content = await fs.readFile(filePath, 'utf-8');
    
    // حفظ نسخة احتياطية
    await fs.writeFile(filePath + '.backup', content);
    console.log('✅ تم حفظ نسخة احتياطية');
    
    // إصلاح المشاكل الشائعة في className
    console.log('🔧 إصلاح أخطاء className...');
    
    // إصلاح className مع اقتباسات مكسورة
    content = content.replace(/className=\{`([^`]*)`\s*\}/g, (match, classes) => {
      // تنظيف الفواصل والمسافات الزائدة
      const cleanedClasses = classes
        .replace(/\s+/g, ' ')
        .replace(/'\s+'/g, ' ')
        .replace(/"\s+"/g, ' ')
        .trim();
      return `className="${cleanedClasses}"`;
    });
    
    // إصلاح template literals المعقدة
    content = content.replace(/className=\{`([^`]*)\$\{([^}]*)\}([^`]*)`\}/g, (match, before, condition, after) => {
      // إذا كان الشرط بسيط، حوله إلى className عادي
      if (condition.includes('darkMode')) {
        return match; // احتفظ بالشروط المعقدة
      }
      return `className="${before.trim()} ${after.trim()}"`;
    });
    
    // إصلاح الأخطاء المحددة
    console.log('🔧 إصلاح الأخطاء المحددة...');
    
    // إصلاح السطر 806 - Link مع className
    content = content.replace(
      /<Link href=\{`\/article\/\$\{news\.id\}`\} className="block" prefetch=\{true\}>\s*<div/g,
      '<Link href={`/article/${news.id}`} className="block" prefetch={true}>\n        <div'
    );
    
    // إصلاح className المكسورة في NewsCard
    content = content.replace(
      /className=\{`group rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-\[1\.02\] \$\{\s*'bg-white'\s*\}/g,
      'className="group rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-white"'
    );
    
    // إصلاح أخطاء className في البلوكات
    content = content.replace(
      /className="rounded-2xl p-6 transition-all duration-300 bg-white\s+border-gray-200\s+border shadow-lg hover:shadow-xl transform hover:scale-105"/g,
      'className="rounded-2xl p-6 transition-all duration-300 bg-white border-gray-200 border shadow-lg hover:shadow-xl transform hover:scale-105"'
    );
    
    // إصلاح أخطاء darkMode conditions
    content = content.replace(
      /\$\{\s*darkMode\s*\?\s*'([^']*)'\s*:\s*'([^']*)'\s*\}/g,
      (match, darkClass, lightClass) => {
        return `\${darkMode ? '${darkClass}' : '${lightClass}'}`;
      }
    );
    
    // إصلاح الأقواس المفقودة
    content = content.replace(
      /className=\{`([^`]*)`\s*\}\s*>/g,
      'className={`$1`}>'
    );
    
    // حفظ الملف المصحح
    await fs.writeFile(filePath, content);
    console.log('✅ تم حفظ الملف المصحح');
    
    // التحقق من الأخطاء المتبقية
    const remainingErrors = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // البحث عن أنماط مشبوهة
      if (line.includes('className={`') && !line.includes('`}')) {
        remainingErrors.push(`السطر ${index + 1}: className غير مغلق`);
      }
      if (line.includes("'bg-white'") && line.includes('className')) {
        remainingErrors.push(`السطر ${index + 1}: اقتباسات مشبوهة في className`);
      }
    });
    
    if (remainingErrors.length > 0) {
      console.log('\n⚠️ أخطاء محتملة متبقية:');
      remainingErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ لم يتم العثور على أخطاء إضافية');
    }
    
    console.log('\n✅ اكتمل إصلاح الملف!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

// تشغيل السكريبت
fixPageSyntax(); 