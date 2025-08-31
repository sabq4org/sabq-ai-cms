#!/usr/bin/env node
/**
 * Production Diagnostic Script
 * يساعد في تشخيص وإصلاح مشاكل بيئة الإنتاج
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 بدء فحص بيئة الإنتاج...\n');

// 1. فحص متغيرات البيئة
console.log('1️⃣ فحص متغيرات البيئة:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'غير محدد'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ موجود' : '❌ مفقود'}`);
console.log(`   NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'غير محدد'}`);

// 2. فحص اتصال قاعدة البيانات
console.log('\n2️⃣ فحص قاعدة البيانات:');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  prisma.articles.count().then(count => {
    console.log(`   ✅ اتصال قاعدة البيانات نجح - ${count} مقال`);
  }).catch(error => {
    console.log(`   ❌ خطأ في قاعدة البيانات: ${error.message}`);
  });
} catch (error) {
  console.log(`   ❌ خطأ في Prisma Client: ${error.message}`);
}

// 3. فحص APIs
console.log('\n3️⃣ فحص APIs:');
const testAPI = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    console.log(`   ${endpoint}: ${response.status} ${response.ok ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   ${endpoint}: ❌ ${error.message}`);
  }
};

// اختبار APIs إذا كان في بيئة محلية
if (process.env.NODE_ENV !== 'production') {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  testAPI(`${baseUrl}/api/news/latest`);
  testAPI(`${baseUrl}/api/articles`);
}

// 4. توصيات الإصلاح
console.log('\n🔧 توصيات الإصلاح:');
console.log('   - تأكد من تحديد متغيرات البيئة في منصة النشر');
console.log('   - تحقق من صحة DATABASE_URL');
console.log('   - تأكد من أن NODE_ENV=production');
console.log('   - تحديث NEXTAUTH_URL للإنتاج');

console.log('\n✅ انتهى فحص بيئة الإنتاج');
