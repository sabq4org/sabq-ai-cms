#!/usr/bin/env node

/**
 * سكريبت إصلاح أخطاء البيئة المباشرة
 * Production Error Fixing Script
 */

const { PrismaClient } = require('@prisma/client');

async function fixProductionErrors() {
  const prisma = new PrismaClient();

  console.log('🔧 بدء إصلاح أخطاء البيئة المباشرة...');

  try {
    // 1. فحص الاتصال بقاعدة البيانات
    console.log('📡 فحص الاتصال بقاعدة البيانات...');
    await prisma.$connect();
    console.log('✅ الاتصال بقاعدة البيانات يعمل');

    // 2. فحص جداول أساسية
    console.log('🗃️ فحص الجداول الأساسية...');
    
    const usersCount = await prisma.users.count();
    console.log(`👥 عدد المستخدمين: ${usersCount}`);

    const articlesCount = await prisma.articles.count();
    console.log(`📰 عدد المقالات: ${articlesCount}`);

    // 3. فحص البيانات المفقودة أو المعطلة
    console.log('🔍 فحص البيانات المعطلة...');
    
    // فحص المقالات بدون صور
    const articlesWithoutImages = await prisma.articles.count({
      where: {
        featured_image: null,
        is_published: true
      }
    });
    console.log(`🖼️ مقالات منشورة بدون صورة: ${articlesWithoutImages}`);

    // فحص المستخدمين بدون أسماء
    const usersWithoutNames = await prisma.users.count({
      where: {
        name: null
      }
    });
    console.log(`👤 مستخدمين بدون أسماء: ${usersWithoutNames}`);

    // 4. إصلاح البيانات المعطلة
    console.log('🛠️ إصلاح البيانات المعطلة...');

    // إصلاح المستخدمين بدون أسماء
    if (usersWithoutNames > 0) {
      await prisma.users.updateMany({
        where: { name: null },
        data: { name: 'مستخدم' }
      });
      console.log('✅ تم إصلاح المستخدمين بدون أسماء');
    }

    // إصلاح المقالات بدون صور
    if (articlesWithoutImages > 0) {
      await prisma.articles.updateMany({
        where: { 
          featured_image: null,
          is_published: true 
        },
        data: { 
          featured_image: 'https://via.placeholder.com/800x400/2563eb/ffffff?text=سبق'
        }
      });
      console.log('✅ تم إصلاح المقالات بدون صور');
    }

    // 5. فحص APIs المعطلة
    console.log('🌐 فحص APIs...');
    
    // يمكن إضافة اختبارات API هنا
    const envVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY'
    ];

    envVars.forEach(env => {
      if (!process.env[env]) {
        console.log(`⚠️ متغير البيئة مفقود: ${env}`);
      } else {
        console.log(`✅ متغير البيئة موجود: ${env}`);
      }
    });

    console.log('🎉 تم الانتهاء من فحص وإصلاح الأخطاء!');

  } catch (error) {
    console.error('❌ خطأ أثناء الإصلاح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  fixProductionErrors()
    .then(() => {
      console.log('✅ تم الانتهاء من السكريبت');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ فشل السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { fixProductionErrors };