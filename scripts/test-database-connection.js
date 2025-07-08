#!/usr/bin/env node

/**
 * سكريبت اختبار الاتصال بقاعدة البيانات
 * يستخدم لتشخيص مشاكل الاتصال على السيرفر
 */

const { PrismaClient } = require('@/lib/generated/prisma');

async function testDatabaseConnection() {
  console.log('🔍 بدء اختبار الاتصال بقاعدة البيانات...\n');
  
  // عرض معلومات البيئة
  console.log('📋 معلومات البيئة:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`DATABASE_URL موجود: ${!!process.env.DATABASE_URL}`);
  
  if (process.env.DATABASE_URL) {
    // إخفاء كلمة المرور في العرض
    const dbUrl = process.env.DATABASE_URL;
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`DATABASE_URL: ${maskedUrl}`);
  }
  
  console.log('\n-----------------------------------\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    // محاولة الاتصال
    console.log('🔌 محاولة الاتصال بقاعدة البيانات...');
    await prisma.$connect();
    console.log('✅ تم الاتصال بنجاح!\n');
    
    // اختبار الجداول الأساسية
    console.log('📊 اختبار الجداول:');
    
    // اختبار جدول المستخدمين
    try {
      const userCount = await prisma.users.count();
      console.log(`✅ جدول users: ${userCount} مستخدم`);
    } catch (error) {
      console.log(`❌ خطأ في جدول users: ${error.message}`);
    }
    
    // اختبار جدول المقالات
    try {
      const articleCount = await prisma.articles.count();
      console.log(`✅ جدول articles: ${articleCount} مقال`);
    } catch (error) {
      console.log(`❌ خطأ في جدول articles: ${error.message}`);
    }
    
    // اختبار جدول التصنيفات
    try {
      const categoryCount = await prisma.categories.count();
      console.log(`✅ جدول categories: ${categoryCount} تصنيف`);
    } catch (error) {
      console.log(`❌ خطأ في جدول categories: ${error.message}`);
    }
    
    // اختبار إنشاء وحذف سجل تجريبي
    console.log('\n🧪 اختبار العمليات:');
    try {
      // إنشاء تصنيف تجريبي
      const testCategory = await prisma.categories.create({
        data: {
          name: 'تصنيف تجريبي للاختبار',
          slug: `test-category-${Date.now()}`,
          description: 'هذا تصنيف تجريبي سيتم حذفه',
          is_active: false
        }
      });
      console.log('✅ تم إنشاء سجل تجريبي بنجاح');
      
      // حذف التصنيف التجريبي
      await prisma.categories.delete({
        where: { id: testCategory.id }
      });
      console.log('✅ تم حذف السجل التجريبي بنجاح');
    } catch (error) {
      console.log(`❌ خطأ في العمليات: ${error.message}`);
    }
    
    console.log('\n✅ جميع الاختبارات اكتملت بنجاح!');
    
  } catch (error) {
    console.error('\n❌ خطأ في الاتصال بقاعدة البيانات:');
    console.error(error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 تلميح: تحقق من أن عنوان قاعدة البيانات صحيح وأن السيرفر يعمل');
    } else if (error.code === 'P1002') {
      console.error('\n💡 تلميح: تحقق من أن قاعدة البيانات تقبل الاتصالات من هذا IP');
    } else if (error.code === 'P1003') {
      console.error('\n💡 تلميح: تحقق من أن اسم قاعدة البيانات موجود');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل الاختبار
testDatabaseConnection().catch(console.error); 