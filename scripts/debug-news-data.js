#!/usr/bin/env node

/**
 * تشخيص بيانات الأخبار في قاعدة البيانات
 * يتحقق من وجود الأخبار ويظهر إحصائياتها
 */

const { PrismaClient } = require('@prisma/client');

async function debugNewsData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 تشخيص بيانات الأخبار...\n');
    
    // 1. إحصائيات عامة للمقالات
    const totalArticles = await prisma.articles.count();
    console.log(`📊 إجمالي المقالات في قاعدة البيانات: ${totalArticles}`);
    
    // 2. إحصائيات حسب الحالة
    const statusStats = await prisma.articles.groupBy({
      by: ['status'],
      _count: true
    });
    
    console.log('\n📈 إحصائيات حسب الحالة:');
    statusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count} مقال`);
    });
    
    // 3. إحصائيات حسب نوع المقال
    const typeStats = await prisma.articles.groupBy({
      by: ['article_type'],
      _count: true
    });
    
    console.log('\n📈 إحصائيات حسب نوع المقال:');
    typeStats.forEach(stat => {
      console.log(`  ${stat.article_type || 'غير محدد'}: ${stat._count} مقال`);
    });
    
    // 4. البحث عن الأخبار المنشورة (استبعاد مقالات الرأي)
    const newsArticles = await prisma.articles.findMany({
      where: {
        article_type: {
          notIn: ['opinion', 'analysis', 'interview']
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        article_type: true,
        published_at: true,
        created_at: true,
        categories: {
          select: {
            name: true
          }
        }
      },
      take: 10, // أول 10 أخبار
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`\n📰 عينة من الأخبار المتاحة (${newsArticles.length} من ${totalArticles}):`);
    
    if (newsArticles.length === 0) {
      console.log('❌ لا توجد أخبار في قاعدة البيانات!');
      console.log('\n🔍 دعنا نتحقق من جميع المقالات:');
      
      const allArticles = await prisma.articles.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          article_type: true,
          published_at: true
        },
        take: 5,
        orderBy: {
          created_at: 'desc'
        }
      });
      
      allArticles.forEach((article, index) => {
        console.log(`  ${index + 1}. "${article.title.substring(0, 50)}..."`);
        console.log(`     النوع: ${article.article_type || 'غير محدد'}`);
        console.log(`     الحالة: ${article.status}`);
        console.log(`     تاريخ النشر: ${article.published_at || 'غير منشور'}`);
        console.log('');
      });
    } else {
      newsArticles.forEach((article, index) => {
        console.log(`  ${index + 1}. "${article.title.substring(0, 50)}..."`);
        console.log(`     الحالة: ${article.status}`);
        console.log(`     النوع: ${article.article_type || 'غير محدد'}`);
        console.log(`     التصنيف: ${article.categories?.name || 'غير مصنف'}`);
        console.log(`     تاريخ النشر: ${article.published_at || 'غير منشور'}`);
        console.log('');
      });
    }
    
    // 5. فحص المقالات المنشورة فقط
    const publishedNews = await prisma.articles.count({
      where: {
        status: 'published',
        article_type: {
          notIn: ['opinion', 'analysis', 'interview']
        }
      }
    });
    
    console.log(`\n✅ الأخبار المنشورة: ${publishedNews}`);
    
    // 6. فحص التصنيفات المتاحة
    const categories = await prisma.categories.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    });
    
    console.log(`\n🏷️  التصنيفات المتاحة (${categories.length}):`);
    categories.forEach(cat => {
      console.log(`  ${cat.name}: ${cat._count.articles} مقال`);
    });
    
    // 7. توصيات للحل
    console.log('\n💡 توصيات:');
    
    if (totalArticles === 0) {
      console.log('  ❌ لا توجد مقالات في قاعدة البيانات');
      console.log('  🔧 يجب إنشاء بعض الأخبار التجريبية');
    } else if (publishedNews === 0) {
      console.log('  ❌ لا توجد أخبار منشورة');
      console.log('  🔧 يجب نشر بعض الأخبار أو تغيير حالتها إلى "published"');
    } else {
      console.log('  ✅ توجد أخبار في قاعدة البيانات');
      console.log('  🔧 تحقق من فلاتر الواجهة الأمامية أو API');
    }
    
  } catch (error) {
    console.error('❌ خطأ في تشخيص البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التشخيص
if (require.main === module) {
  debugNewsData().catch(console.error);
}

module.exports = debugNewsData;