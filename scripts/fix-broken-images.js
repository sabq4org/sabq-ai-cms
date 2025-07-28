#!/usr/bin/env node

/**
 * Script لإصلاح روابط الصور المعطلة في قاعدة البيانات
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// قائمة الروابط المعطلة المعروفة
const BROKEN_IMAGES = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b47c',
  'https://images.unsplash.com/photo-1594736797933-d0411e042d9e',
  'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/mubarak-al-ati.jpg'
];

// دالة لإنشاء صورة افتراضية
function getDefaultImage(type = 'article', name = 'صورة') {
  const colors = {
    article: '0D8ABC',
    author: '00A86B',
    category: '9333EA'
  };
  const color = colors[type] || '1E40AF';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=800&font-size=0.33&rounded=false`;
}

// دالة للتحقق من الصور المعطلة
function isBrokenImage(url) {
  if (!url) return true;
  return BROKEN_IMAGES.some(broken => url.includes(broken));
}

async function fixBrokenImages() {
  console.log('🔧 بدء إصلاح الصور المعطلة...\n');
  
  try {
    // إصلاح صور المقالات
    console.log('📝 فحص صور المقالات...');
    const articles = await prisma.articles.findMany({
      where: {
        OR: [
          { featured_image: { not: null } },
          { image: { not: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        featured_image: true,
        image: true
      }
    });
    
    let fixedArticles = 0;
    for (const article of articles) {
      let needsUpdate = false;
      const updates = {};
      
      if (article.featured_image && isBrokenImage(article.featured_image)) {
        updates.featured_image = getDefaultImage('article', article.title);
        needsUpdate = true;
      }
      
      if (article.image && isBrokenImage(article.image)) {
        updates.image = getDefaultImage('article', article.title);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await prisma.articles.update({
          where: { id: article.id },
          data: updates
        });
        fixedArticles++;
        console.log(`✅ تم إصلاح صور المقال: ${article.title}`);
      }
    }
    
    console.log(`\n✨ تم إصلاح ${fixedArticles} مقال من أصل ${articles.length}\n`);
    
    // إصلاح صور المؤلفين  
    console.log('👤 فحص صور المؤلفين...');
    const authors = await prisma.authors.findMany({
      where: {
        avatar: { not: null }
      },
      select: {
        id: true,
        name: true,
        avatar: true
      }
    });
    
    let fixedAuthors = 0;
    for (const author of authors) {
      if (isBrokenImage(author.avatar)) {
        await prisma.authors.update({
          where: { id: author.id },
          data: { 
            avatar: getDefaultImage('author', author.name)
          }
        });
        fixedAuthors++;
        console.log(`✅ تم إصلاح صورة المؤلف: ${author.name}`);
      }
    }
    
    console.log(`\n✨ تم إصلاح ${fixedAuthors} مؤلف من أصل ${authors.length}\n`);
    
    // إصلاح صور التصنيفات
    console.log('📁 فحص صور التصنيفات...');
    const categories = await prisma.categories.findMany({
      where: {
        cover_image: { not: null }
      },
      select: {
        id: true,
        name: true,
        name_ar: true,
        cover_image: true
      }
    });
    
    let fixedCategories = 0;
    for (const category of categories) {
      if (isBrokenImage(category.cover_image)) {
        const categoryName = category.name_ar || category.name;
        await prisma.categories.update({
          where: { id: category.id },
          data: { 
            cover_image: getDefaultImage('category', categoryName)
          }
        });
        fixedCategories++;
        console.log(`✅ تم إصلاح صورة التصنيف: ${categoryName}`);
      }
    }
    
    console.log(`\n✨ تم إصلاح ${fixedCategories} تصنيف من أصل ${categories.length}\n`);
    
    console.log('🎉 تم الانتهاء من إصلاح جميع الصور المعطلة!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
fixBrokenImages().catch(console.error); 