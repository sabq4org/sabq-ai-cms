#!/usr/bin/env node

/**
 * سكريپت حذف المقالات التجريبية نهائياً
 * يحذف المقالات التي تحتوي على كلمات تجريبية من قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findTestArticles() {
  console.log('🔍 البحث عن المقالات التجريبية...');
  
  try {
    // البحث عن مقالات تحتوي على كلمات تجريبية
    const testArticles = await prisma.articles.findMany({
      where: {
        OR: [
          { title: { contains: 'تجريبي', mode: 'insensitive' } },
          { title: { contains: 'test', mode: 'insensitive' } },
          { title: { contains: 'demo', mode: 'insensitive' } },
          { title: { contains: 'مثال', mode: 'insensitive' } },
          { title: { contains: 'عينة', mode: 'insensitive' } },
          { title: { contains: 'sample', mode: 'insensitive' } },
          { content: { contains: 'هذا مقال تجريبي', mode: 'insensitive' } },
          { content: { contains: 'Lorem ipsum', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true,
        created_at: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (testArticles.length === 0) {
      console.log('✅ لم يتم العثور على مقالات تجريبية');
      return [];
    }
    
    console.log(`📋 تم العثور على ${testArticles.length} مقال تجريبي:`);
    testArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      ID: ${article.id}`);
      console.log(`      النوع: ${article.article_type || 'غير محدد'}`);
      console.log(`      الحالة: ${article.status}`);
      console.log(`      الكاتب: ${article.author?.name || 'غير محدد'}`);
      console.log(`      تاريخ الإنشاء: ${article.created_at}`);
      console.log('');
    });
    
    return testArticles;
    
  } catch (error) {
    console.error('❌ خطأ في البحث عن المقالات:', error);
    return [];
  }
}

async function deleteTestArticles(testArticles, force = false) {
  if (testArticles.length === 0) {
    console.log('✅ لا توجد مقالات للحذف');
    return;
  }
  
  console.log(`🗑️ بدء حذف ${testArticles.length} مقال تجريبي...`);
  
  if (!force) {
    console.log('⚠️ في وضع الاختبار - لن يتم الحذف الفعلي');
    console.log('لتفعيل الحذف الفعلي، استخدم: node scripts/delete-test-articles.js --force');
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const article of testArticles) {
    try {
      console.log(`🗑️ حذف: ${article.title}...`);
      
      // حذف نهائي من قاعدة البيانات
      await prisma.articles.delete({
        where: { id: article.id }
      });
      
      console.log(`   ✅ تم حذف ${article.title} بنجاح`);
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ خطأ في حذف ${article.title}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\\n📊 نتائج الحذف:');
  console.log(`✅ تم حذف ${successCount} مقال بنجاح`);
  if (errorCount > 0) {
    console.log(`❌ فشل حذف ${errorCount} مقال`);
  }
}

async function cleanupOpinionArticles() {
  console.log('\\n🧹 تنظيف مقالات الرأي التجريبية...');
  
  try {
    // البحث عن مقالات رأي تجريبية فقط
    const opinionTestArticles = await prisma.articles.findMany({
      where: {
        AND: [
          { article_type: 'opinion' },
          {
            OR: [
              { title: { contains: 'تجريبي', mode: 'insensitive' } },
              { title: { contains: 'test', mode: 'insensitive' } },
              { title: { contains: 'demo', mode: 'insensitive' } },
              { content: { contains: 'هذا مقال تجريبي', mode: 'insensitive' } }
            ]
          }
        ]
      }
    });
    
    console.log(`📋 تم العثور على ${opinionTestArticles.length} مقال رأي تجريبي`);
    
    return opinionTestArticles;
    
  } catch (error) {
    console.error('❌ خطأ في البحث عن مقالات الرأي:', error);
    return [];
  }
}

async function updateArticlesStatus() {
  console.log('\\n🔄 تحديث حالة المقالات المحذوفة...');
  
  try {
    // تحديث المقالات التي حالتها "deleted" لحذفها نهائياً
    const deletedArticles = await prisma.articles.findMany({
      where: { status: 'deleted' }
    });
    
    if (deletedArticles.length > 0) {
      console.log(`📋 تم العثور على ${deletedArticles.length} مقال محذوف للحذف النهائي`);
      
      for (const article of deletedArticles) {
        console.log(`🗑️ حذف نهائي: ${article.title}`);
      }
    } else {
      console.log('✅ لا توجد مقالات محذوفة مؤقتاً');
    }
    
    return deletedArticles;
    
  } catch (error) {
    console.error('❌ خطأ في البحث عن المقالات المحذوفة:', error);
    return [];
  }
}

async function runCleanup() {
  console.log('🚀 بدء تنظيف المقالات التجريبية\\n');
  
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const opinionOnly = args.includes('--opinion-only');
  
  try {
    let articlesToDelete = [];
    
    if (opinionOnly) {
      // تنظيف مقالات الرأي التجريبية فقط
      articlesToDelete = await cleanupOpinionArticles();
    } else {
      // البحث عن جميع المقالات التجريبية
      articlesToDelete = await findTestArticles();
      
      // إضافة المقالات المحذوفة مؤقتاً
      const deletedArticles = await updateArticlesStatus();
      articlesToDelete = [...articlesToDelete, ...deletedArticles];
    }
    
    // حذف المقالات
    await deleteTestArticles(articlesToDelete, force);
    
    console.log('\\n🎯 تم الانتهاء من عملية التنظيف');
    
    if (!force && articlesToDelete.length > 0) {
      console.log('\\n💡 لتنفيذ الحذف الفعلي:');
      console.log('node scripts/delete-test-articles.js --force');
      console.log('\\n💡 لحذف مقالات الرأي التجريبية فقط:');
      console.log('node scripts/delete-test-articles.js --opinion-only --force');
    }
    
  } catch (error) {
    console.error('❌ خطأ في عملية التنظيف:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التنظيف
if (require.main === module) {
  runCleanup().catch(console.error);
}

module.exports = {
  findTestArticles,
  deleteTestArticles,
  cleanupOpinionArticles,
  updateArticlesStatus,
  runCleanup
};