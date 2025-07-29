/**
 * Script لفحص وإصلاح صور البطاقات على سيرفر الإنتاج
 * يفحص جميع أنواع الصور ويحولها إلى Cloudinary
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cloudinary defaults
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dlaibl7id/image/upload';
const CLOUDINARY_DEFAULTS = {
  article: `${CLOUDINARY_BASE}/v1753111461/defaults/article-placeholder.jpg`,
  category: `${CLOUDINARY_BASE}/v1753111461/defaults/category-placeholder.jpg`,
  author: `${CLOUDINARY_BASE}/v1753111461/defaults/default-avatar.png`
};

async function checkAndFixImages() {
  console.log('🔍 بدء فحص صور البطاقات...\n');
  
  try {
    // 1. فحص المقالات
    console.log('📄 فحص صور المقالات...');
    const articles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        featured_image: true,
        social_image: true,
        metadata: true
      }
    });
    
    let articlesFixed = 0;
    for (const article of articles) {
      let needsUpdate = false;
      const updates = {};
      
      // فحص featured_image
      if (!article.featured_image || 
          article.featured_image === '' ||
          article.featured_image === 'null' ||
          article.featured_image === 'undefined' ||
          article.featured_image.includes('/uploads/') ||
          article.featured_image.includes('s3.amazonaws.com')) {
        
        updates.featured_image = CLOUDINARY_DEFAULTS.article;
        needsUpdate = true;
        console.log(`  ⚠️  المقال "${article.title.substring(0, 50)}..." يحتاج لصورة جديدة`);
      }
      
      // تحديث إذا لزم الأمر
      if (needsUpdate) {
        await prisma.articles.update({
          where: { id: article.id },
          data: updates
        });
        articlesFixed++;
      }
    }
    
    console.log(`✅ تم إصلاح ${articlesFixed} مقال\n`);
    
    // 2. فحص التصنيفات
    console.log('📁 فحص صور التصنيفات...');
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        image_url: true,
        metadata: true
      }
    });
    
    let categoriesFixed = 0;
    for (const category of categories) {
      let needsUpdate = false;
      const updates = {};
      
      // فحص image_url
      if (!category.image_url || 
          category.image_url === '' ||
          category.image_url === 'null' ||
          category.image_url === 'undefined' ||
          category.image_url.includes('/uploads/') ||
          category.image_url.includes('s3.amazonaws.com')) {
        
        updates.image_url = CLOUDINARY_DEFAULTS.category;
        needsUpdate = true;
        console.log(`  ⚠️  التصنيف "${category.name}" يحتاج لصورة جديدة`);
      }
      
      // فحص metadata.image_url
      if (category.metadata && typeof category.metadata === 'object') {
        const metadata = category.metadata;
        if (metadata.image_url && (
            metadata.image_url.includes('/uploads/') ||
            metadata.image_url.includes('s3.amazonaws.com'))) {
          
          updates.metadata = {
            ...metadata,
            image_url: CLOUDINARY_DEFAULTS.category
          };
          needsUpdate = true;
        }
      }
      
      // تحديث إذا لزم الأمر
      if (needsUpdate) {
        await prisma.categories.update({
          where: { id: category.id },
          data: updates
        });
        categoriesFixed++;
      }
    }
    
    console.log(`✅ تم إصلاح ${categoriesFixed} تصنيف\n`);
    
    // 3. فحص المؤلفين
    console.log('👤 فحص صور المؤلفين...');
    const authors = await prisma.authors.findMany({
      select: {
        id: true,
        name: true,
        avatar: true
      }
    });
    
    let authorsFixed = 0;
    for (const author of authors) {
      if (!author.avatar || 
          author.avatar === '' ||
          author.avatar === 'null' ||
          author.avatar === 'undefined' ||
          author.avatar.includes('/uploads/') ||
          author.avatar.includes('s3.amazonaws.com')) {
        
        await prisma.authors.update({
          where: { id: author.id },
          data: { avatar: CLOUDINARY_DEFAULTS.author }
        });
        authorsFixed++;
        console.log(`  ⚠️  المؤلف "${author.name}" تم تحديث صورته`);
      }
    }
    
    console.log(`✅ تم إصلاح ${authorsFixed} مؤلف\n`);
    
    // 4. إحصائيات نهائية
    console.log('📊 ملخص الإصلاحات:');
    console.log(`  - المقالات: ${articlesFixed}`);
    console.log(`  - التصنيفات: ${categoriesFixed}`);
    console.log(`  - المؤلفين: ${authorsFixed}`);
    console.log(`  - المجموع: ${articlesFixed + categoriesFixed + authorsFixed}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkAndFixImages().catch(console.error); 