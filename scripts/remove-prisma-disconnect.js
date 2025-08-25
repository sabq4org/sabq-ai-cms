#!/usr/bin/env node

/**
 * Script لإزالة جميع استدعاءات prisma.$disconnect() من ملفات API
 * هذه الاستدعاءات تسبب مشاكل في الاتصال بقاعدة البيانات
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// البحث عن جميع ملفات route.ts في مجلد app/api
const apiDir = path.join(process.cwd(), 'app/api');
const pattern = path.join(apiDir, '**/*.ts');

console.log('🔍 البحث عن ملفات API...');

glob(pattern, (err, files) => {
  if (err) {
    console.error('❌ خطأ في البحث:', err);
    process.exit(1);
  }

  console.log(`📁 تم العثور على ${files.length} ملف`);
  
  let totalRemoved = 0;
  let filesModified = 0;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // البحث عن أنماط $disconnect
    const patterns = [
      /await\s+prisma\.\$disconnect\(\)\s*;?/g,
      /prisma\.\$disconnect\(\)\s*;?/g,
      /\.finally\(\s*\(\)\s*=>\s*prisma\.\$disconnect\(\)\s*\)/g,
      /\.finally\(\s*async\s*\(\)\s*=>\s*await\s+prisma\.\$disconnect\(\)\s*\)/g
    ];
    
    let newContent = content;
    let changes = 0;
    
    patterns.forEach(pattern => {
      const matches = newContent.match(pattern);
      if (matches) {
        changes += matches.length;
        newContent = newContent.replace(pattern, '// Removed: $disconnect() - causes connection issues');
      }
    });
    
    if (changes > 0) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`✅ ${path.relative(process.cwd(), file)}: تم إزالة ${changes} استدعاء`);
      totalRemoved += changes;
      filesModified++;
    }
  });

  console.log('\n📊 ملخص التغييرات:');
  console.log(`   - الملفات المعدلة: ${filesModified}`);
  console.log(`   - الاستدعاءات المزالة: ${totalRemoved}`);
  console.log('\n✨ تم الانتهاء بنجاح!');
});
