#!/usr/bin/env node
const { PrismaClient } = require('../lib/generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 بدء إضافة البيانات...');

  try {
    // 1. إنشاء مستخدمين بسيطين
    console.log('👥 إنشاء المستخدمين...');
    
    const admin = await prisma.users.create({
      data: {
        id: 'user-admin-' + Date.now(),
        email: 'admin@sabq.ai',
        password_hash: 'test123', // كلمة مرور مؤقتة
        name: 'المدير',
        role: 'admin',
        is_admin: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const editor = await prisma.users.create({
      data: {
        id: 'user-editor-' + Date.now(),
        email: 'editor@sabq.ai',
        password_hash: 'test123',
        name: 'محرر',
        role: 'editor',
        is_admin: false,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إنشاء المستخدمين');

    // 2. إنشاء مقالات بسيطة
    console.log('📰 إنشاء المقالات...');
    const categories = await prisma.categories.findMany();
    
    if (categories.length === 0) {
      console.log('❌ لا توجد تصنيفات');
      return;
    }

    for (let i = 0; i < 5; i++) {
      await prisma.articles.create({
        data: {
          id: crypto.randomUUID(),
          title: `مقال تجريبي رقم ${i + 1}`,
          slug: `article-${Date.now()}-${i}`,
          excerpt: 'هذا مقال تجريبي للاختبار',
          content: '<p>محتوى المقال التجريبي</p>',
          status: 'published',
          featured: false,
          views: Math.floor(Math.random() * 100),
          readingTime: 3,
          publishedAt: new Date(),
          categoryId: categories[i % categories.length].id,
          authorId: i % 2 === 0 ? admin.id : editor.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    
    console.log('✅ تم إنشاء 5 مقالات');
    console.log('\n🎉 تم إضافة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 