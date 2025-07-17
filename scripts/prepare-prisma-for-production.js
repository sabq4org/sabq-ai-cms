const fs = require('fs');
const path = require('path');

console.log('🚀 إعداد Prisma schema لبيئة الإنتاج...');

// قراءة ملف schema.prisma
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// تغيير provider من sqlite إلى postgresql
schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');

console.log('✅ تم تغيير provider إلى PostgreSQL');
console.log('📝 ملاحظة: تستخدم هذه النسخة أنواع بيانات عامة متوافقة مع كل من SQLite و PostgreSQL');

// حفظ النسخة المعدلة
fs.writeFileSync(schemaPath, schema);

console.log('\n✅ تم إعداد Prisma schema لبيئة الإنتاج بنجاح!'); 