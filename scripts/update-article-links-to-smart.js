#!/usr/bin/env node

/**
 * سكريبت تحديث روابط المقالات للتصميم الذكي الجديد
 * يحدث جميع الروابط من /article/${id} إلى getSmartArticleLink()
 */

const fs = require('fs');
const path = require('path');

// قائمة الملفات المهمة لتحديثها
const criticalFiles = [
  'app/home/page.tsx',
  'app/articles/page.tsx',
  'components/home/PersonalizedContent.tsx',
  'components/PersonalizedFeed.tsx',
  'app/dashboard/page.tsx',
  'app/news/category/[slug]/page.tsx'
];

// قائمة الملفات التي تم تحديثها
let updatedFiles = [];
let failedFiles = [];

function updateFileArticleLinks(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️ تخطي: ${filePath} (غير موجود)`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;

    // 1. إضافة import للدالة الجديدة (إذا لم تكن موجودة)
    if (!content.includes('getSmartArticleLink')) {
      // البحث عن السطر المناسب لإضافة import
      const importRegex = /(import.*from\s+['"]@\/lib\/utils['"];?)/;
      
      if (importRegex.test(content)) {
        // إذا كان هناك import من utils، نحدثه
        content = content.replace(
          importRegex,
          (match) => {
            if (match.includes('getSmartArticleLink')) {
              return match; // موجود بالفعل
            }
            return match.replace(
              /from\s+['"]@\/lib\/utils['"];?/,
              `from '@/lib/utils';\nimport { getSmartArticleLink } from '@/lib/utils';`
            );
          }
        );
      } else {
        // إضافة import جديد بعد آخر import
        const lastImportMatch = content.match(/import.*?;[\r\n]/g);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          content = content.replace(
            lastImport,
            lastImport + "import { getSmartArticleLink } from '@/lib/utils';\n"
          );
        }
      }
      hasChanges = true;
    }

    // 2. تحديث روابط المقالات المباشرة
    const linkPatterns = [
      // نمط href={`/article/${article.id}`}
      {
        pattern: /href=\{`\/article\/\$\{([^}]+)\.id\}`\}/g,
        replacement: 'href={getSmartArticleLink($1)}'
      },
      // نمط href={`/article/${article.slug}`}
      {
        pattern: /href=\{`\/article\/\$\{([^}]+)\.slug\}`\}/g,
        replacement: 'href={getSmartArticleLink($1)}'
      },
      // نمط href={"/article/" + article.id}
      {
        pattern: /href=\{"\/article\/"\s*\+\s*([^}]+)\.id\}/g,
        replacement: 'href={getSmartArticleLink($1)}'
      }
    ];

    linkPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        hasChanges = true;
      }
    });

    // 3. حفظ التغييرات
    if (hasChanges && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ تم تحديث: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ لا تغيير في: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ خطأ في تحديث ${filePath}:`, error.message);
    return false;
  }
}

function updateAllFiles() {
  console.log('🚀 بدء تحديث روابط المقالات للتصميم الذكي...\n');

  // تحديث الملفات المهمة
  criticalFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    try {
      if (updateFileArticleLinks(fullPath)) {
        updatedFiles.push(filePath);
      }
    } catch (error) {
      console.error(`❌ فشل تحديث ${filePath}:`, error.message);
      failedFiles.push(filePath);
    }
  });

  // تقرير النتائج
  console.log('\n📋 تقرير التحديث:');
  console.log('═══════════════════════════');
  console.log(`✅ ملفات تم تحديثها: ${updatedFiles.length}`);
  
  if (updatedFiles.length > 0) {
    updatedFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  if (failedFiles.length > 0) {
    console.log(`❌ ملفات فشل تحديثها: ${failedFiles.length}`);
    failedFiles.forEach(file => console.log(`  - ${file}`));
  }

  // نصائح للمستخدم
  console.log('\n💡 خطوات ما بعد التحديث:');
  console.log('1. تأكد من عدم وجود أخطاء syntax');
  console.log('2. اختبر الروابط في المتصفح');
  console.log('3. تحقق من أن التصميم الذكي يعمل');
  
  if (updatedFiles.length > 0) {
    console.log('\n🎉 تم تحديث الروابط بنجاح! المقالات الآن تستخدم التصميم الذكي الجديد.');
  }
}

// تشغيل السكريبت
if (require.main === module) {
  updateAllFiles();
}

module.exports = {
  updateFileArticleLinks,
  criticalFiles
};