#!/usr/bin/env node
/**
 * تشخيص شامل لمشاكل قاعدة البيانات
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

console.log('🔍 تشخيص شامل لقاعدة البيانات...\n');

// 1. فحص متغيرات البيئة
console.log('1️⃣ فحص متغيرات البيئة:');
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ موجود' : '❌ مفقود'}`);
console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ موجود' : '❌ مفقود'}`);

// 2. فحص الرابط
console.log('\n2️⃣ تحليل رابط قاعدة البيانات:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    console.log(`   - المضيف: ${url.hostname}`);
    console.log(`   - المنفذ: ${url.port}`);
    console.log(`   - اسم قاعدة البيانات: ${url.pathname.slice(1)}`);
    console.log(`   - المستخدم: ${url.username}`);
    console.log(`   - SSL: ${url.searchParams.get('sslmode')}`);
  } catch (error) {
    console.log(`   ❌ خطأ في تحليل الرابط: ${error.message}`);
  }
}

// 3. اختبار الاتصال بالشبكة
console.log('\n3️⃣ اختبار الاتصال بالشبكة:');
const testNetwork = async () => {
  try {
    const { stdout } = await execAsync('ping -c 3 primary.sabqdb--7mcgps947hwt.addon.code.run');
    console.log('   ✅ الاتصال بالشبكة نجح');
  } catch (error) {
    console.log('   ❌ فشل الاتصال بالشبكة');
    console.log(`   تفاصيل: ${error.message}`);
  }
};

// 4. اختبار المنفذ
console.log('\n4️⃣ اختبار المنفذ 5432:');
const testPort = async () => {
  try {
    const { stdout } = await execAsync('nc -zv primary.sabqdb--7mcgps947hwt.addon.code.run 5432');
    console.log('   ✅ المنفذ 5432 متاح');
  } catch (error) {
    console.log('   ❌ المنفذ 5432 غير متاح');
    console.log(`   تفاصيل: ${error.message}`);
  }
};

// 5. توصيات الحل
console.log('\n🔧 توصيات الحل:');
console.log('   1. تحقق من حالة قاعدة البيانات في لوحة Northflank');
console.log('   2. تأكد من أن الخادم يعمل');
console.log('   3. تحقق من إعدادات الشبكة والـ Firewall');
console.log('   4. جرب استخدام Supabase كبديل مؤقت');
console.log('   5. تحقق من صحة بيانات الاتصال');

// تشغيل الاختبارات
async function runDiagnostics() {
  await testNetwork();
  await testPort();

  console.log('\n📋 الخلاصة:');
  console.log('   - إذا كانت جميع الاختبارات تفشل، فإن قاعدة Northflank غير متاحة حالياً');
  console.log('   - استخدم Supabase كبديل حتى يتم حل المشكلة');
}

runDiagnostics().catch(console.error);
