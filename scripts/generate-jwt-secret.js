#!/usr/bin/env node

/**
 * سكريبت لتوليد JWT_SECRET عشوائي وآمن
 * يمكن استخدامه لإنشاء قيمة JWT_SECRET للاستخدام في متغيرات البيئة
 */

const crypto = require('crypto');

// توليد سر عشوائي بطول 32 بايت (256 بت)
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// توليد عدة أسرار
console.log('🔐 توليد JWT Secrets...\n');

console.log('JWT_SECRET (استخدم هذا في متغيرات البيئة):');
console.log(generateSecret());
console.log('\n');

console.log('NEXTAUTH_SECRET (يمكن استخدام نفس القيمة أو توليد جديدة):');
console.log(generateSecret());
console.log('\n');

console.log('CRON_SECRET (اختياري - لحماية مهام cron):');
console.log(generateSecret());
console.log('\n');

console.log('💡 نصائح:');
console.log('1. انسخ القيم أعلاه واحفظها في مكان آمن');
console.log('2. لا تشارك هذه القيم مع أي شخص');
console.log('3. استخدم قيم مختلفة لكل بيئة (development, staging, production)');
console.log('4. في DigitalOcean، استخدم خيار "Encrypt" عند إضافة هذه المتغيرات'); 