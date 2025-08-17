// سكريبت لتصحيح جميع استخدامات categories في user_interests
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/test/check-interests/route.ts',
  'app/api/categories/personalized/route.ts',
  'app/api/user/interests/route.ts',
  'app/api/user/saved-categories/route.ts'
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ الملف غير موجود: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;

    // استبدال categories ب category في user_interests includes
    content = content.replace(
      /user_interests\.findMany\(([\s\S]*?)include:\s*{[\s\S]*?categories:/g,
      (match) => match.replace('categories:', 'category:')
    );

    // استبدال ui.categories بـ ui.category
    content = content.replace(/ui\.categories/g, 'ui.category');

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ تم إصلاح: ${filePath}`);
    } else {
      console.log(`✓ الملف سليم: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ خطأ في معالجة ${filePath}:`, error.message);
  }
}

console.log('🔧 بدء إصلاح ملفات categories...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ اكتمل الإصلاح!');
