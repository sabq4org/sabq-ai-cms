const fs = require('fs');
const path = require('path');

console.log('🔧 بدء إصلاح Prisma schema...');

// قراءة ملف schema.prisma
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// عدّاد للتغييرات
let changesCount = 0;

// إزالة جميع أنواع PostgreSQL
const replacements = [
  // أنواع النصوص
  { pattern: /@db\.Text/g, replacement: '', name: '@db.Text' },
  { pattern: /@db\.VarChar\(\d+\)/g, replacement: '', name: '@db.VarChar' },
  
  // أنواع التواريخ
  { pattern: /@db\.Timestamp\(\d+\)/g, replacement: '', name: '@db.Timestamp' },
  { pattern: /@db\.Timestamptz\(\d+\)/g, replacement: '', name: '@db.Timestamptz' },
  { pattern: /@db\.Date/g, replacement: '', name: '@db.Date' },
  
  // أنواع الأرقام
  { pattern: /@db\.Decimal/g, replacement: '', name: '@db.Decimal' },
  
  // إزالة معاملات الدقة من Decimal
  { pattern: /Decimal\s*\(\d+,\s*\d+\)/g, replacement: 'Decimal', name: 'Decimal precision' }
];

// تطبيق جميع الاستبدالات
replacements.forEach(({ pattern, replacement, name }) => {
  const matches = schema.match(pattern);
  if (matches) {
    changesCount += matches.length;
    console.log(`  ✓ إزالة ${matches.length} من ${name}`);
    schema = schema.replace(pattern, replacement);
  }
});

// تنظيف المسافات الزائدة
schema = schema.split('\n').map(line => line.trimEnd()).join('\n');

// حفظ النسخة المصلحة
fs.writeFileSync(schemaPath, schema);

console.log(`\n✅ تم إصلاح Prisma schema بنجاح!`);
console.log(`📊 إجمالي التغييرات: ${changesCount}`);
console.log(`\n💡 الخطوات التالية:`);
console.log(`   1. npx prisma generate`);
console.log(`   2. DATABASE_URL="file:./dev.db" npx prisma db push`); 