#!/usr/bin/env node

/**
 * Script طارئ لإصلاح قاعدة البيانات في الإنتاج
 * يجب تشغيله على الخادم أو مع بيانات اتصال الإنتاج
 */

const { PrismaClient } = require('@prisma/client');

// استخدم DATABASE_URL من البيئة للإنتاج
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixProductionDatabase() {
  console.log('🚨 بدء إصلاح قاعدة البيانات في الإنتاج...\n');
  
  try {
    // 1. إنشاء user افتراضي
    console.log('1️⃣ إنشاء user افتراضي...');
    let defaultUser;
    try {
      defaultUser = await prisma.users.findFirst({
        where: { email: 'system@sabq.org' }
      });
      
      if (!defaultUser) {
        defaultUser = await prisma.users.create({
          data: {
            id: 'user_system_default',
            email: 'system@sabq.org',
            name: 'النظام الافتراضي',
            role: 'admin',
            email_verified_at: new Date(),
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        console.log('✅ تم إنشاء user افتراضي');
      } else {
        console.log('⚠️ User افتراضي موجود بالفعل');
      }
    } catch (e) {
      console.error('❌ خطأ في إنشاء user افتراضي:', e.message);
    }
    
    // 2. إنشاء users مطابقين للمؤلفين
    console.log('\n2️⃣ إنشاء users مطابقين للمؤلفين...');
    const authors = await prisma.article_authors.findMany({
      where: { is_active: true }
    });
    
    let created = 0;
    for (const author of authors) {
      try {
        const user = await prisma.users.create({
          data: {
            id: author.id,
            email: author.email || `${author.id}@sabq.org`,
            name: author.full_name || 'مؤلف',
            role: 'writer',
            email_verified_at: new Date(),
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        created++;
        console.log(`✅ ${author.full_name}`);
      } catch (e) {
        if (e.code !== 'P2002') {
          console.error(`❌ ${author.full_name}: ${e.message}`);
        }
      }
    }
    
    console.log(`\n✅ تم إنشاء ${created} user جديد`);
    
    // 3. التأكد من وجود تصنيف افتراضي
    console.log('\n3️⃣ التحقق من التصنيف الافتراضي...');
    const defaultCategory = await prisma.categories.findUnique({
      where: { id: 'cat-001' }
    });
    
    if (!defaultCategory) {
      await prisma.categories.create({
        data: {
          id: 'cat-001',
          name: 'محليات',
          slug: 'local',
          description: 'أخبار محلية',
          is_active: true,
          display_order: 0,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ تم إنشاء تصنيف افتراضي');
    } else {
      console.log('⚠️ التصنيف الافتراضي موجود');
    }
    
    console.log('\n✅ تم إصلاح قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل عند استدعاء الملف مباشرة
if (require.main === module) {
  fixProductionDatabase();
}

module.exports = { fixProductionDatabase };
