#!/usr/bin/env node

const { PrismaClient } = require('../lib/generated/prisma');

async function checkCategories() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 فحص التصنيفات في قاعدة البيانات...');
    
    // عد جميع التصنيفات
    const totalCategories = await prisma.categories.count();
    console.log(`📊 إجمالي التصنيفات: ${totalCategories}`);
    
    // عد التصنيفات النشطة
    const activeCategories = await prisma.categories.count({
      where: { is_active: true }
    });
    console.log(`✅ التصنيفات النشطة: ${activeCategories}`);
    
    // جلب جميع التصنيفات مع التفاصيل
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        _count: {
          select: {
            articles: {
              where: { status: 'published' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 قائمة التصنيفات:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug}) - ${cat.is_active ? '✅ نشط' : '❌ غير نشط'} - ${cat._count.articles} مقال`);
    });
    
    // فحص المقالات
    const totalArticles = await prisma.articles.count();
    const publishedArticles = await prisma.articles.count({
      where: { status: 'published' }
    });
    
    console.log(`\n📰 إجمالي المقالات: ${totalArticles}`);
    console.log(`📰 المقالات المنشورة: ${publishedArticles}`);
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
