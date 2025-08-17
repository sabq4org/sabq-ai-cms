#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategoryStats() {
  console.log('🔍 فحص إحصائيات التصنيفات...\n');
  
  try {
    // 1. جلب جميع التصنيفات النشطة
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' }
    });
    
    console.log(`📊 عدد التصنيفات النشطة: ${categories.length}\n`);
    
    // 2. فحص كل تصنيف
    for (const category of categories) {
      console.log(`\n📁 التصنيف: ${category.name} (${category.id})`);
      console.log(`   Slug: ${category.slug}`);
      
      // عدد المقالات
      const articlesCount = await prisma.articles.count({
        where: {
          category_id: category.id,
          status: 'published'
        }
      });
      console.log(`   📰 عدد المقالات المنشورة: ${articlesCount}`);
      
      if (articlesCount > 0) {
        // جلب معرفات المقالات
        const articleIds = await prisma.articles.findMany({
          where: {
            category_id: category.id,
            status: 'published'
          },
          select: { id: true }
        }).then(articles => articles.map(a => a.id));
        
        // إحصائيات المشاهدات
        const totalViews = await prisma.articles.aggregate({
          _sum: { views: true },
          where: {
            category_id: category.id,
            status: 'published'
          }
        });
        
        // إحصائيات التفاعلات
        const interactions = await prisma.interactions.groupBy({
          by: ['type'],
          _count: true,
          where: {
            article_id: { in: articleIds }
          }
        });
        
        console.log(`   👁️ إجمالي المشاهدات: ${totalViews._sum.views || 0}`);
        
        interactions.forEach(interaction => {
          const typeMap = {
            'like': '❤️ الإعجابات',
            'save': '🔖 الحفظ',
            'share': '🔗 المشاركات',
            'comment': '💬 التعليقات'
          };
          console.log(`   ${typeMap[interaction.type] || interaction.type}: ${interaction._count}`);
        });
        
        // إذا لم توجد تفاعلات
        if (interactions.length === 0) {
          console.log('   ⚠️ لا توجد تفاعلات مسجلة لمقالات هذا التصنيف');
        }
      }
    }
    
    // 3. فحص البيانات المفقودة
    console.log('\n\n🔍 فحص البيانات المفقودة...');
    
    // مقالات بدون تصنيف
    const articlesWithoutCategory = await prisma.articles.count({
      where: {
        OR: [
          { category_id: null },
          { category_id: '' }
        ],
        status: 'published'
      }
    });
    
    if (articlesWithoutCategory > 0) {
      console.log(`⚠️ عدد المقالات بدون تصنيف: ${articlesWithoutCategory}`);
    }
    
    // التحقق من أنواع category_id
    console.log('\n📊 فحص أنواع معرفات التصنيفات...');
    const sampleArticles = await prisma.articles.findMany({
      take: 5,
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        category_id: true
      }
    });
    
    sampleArticles.forEach(article => {
      console.log(`- المقال: ${article.title}`);
      console.log(`  category_id: ${article.category_id} (نوع: ${typeof article.category_id})`);
    });
    
    // 4. اختبار API الإحصائيات
    console.log('\n\n🌐 اختبار API الإحصائيات...');
    
    // اختر أول تصنيف يحتوي على مقالات
    const testCategory = categories.find(cat => articlesCount > 0);
    if (testCategory) {
      console.log(`\nاختبار التصنيف: ${testCategory.name} (${testCategory.id})`);
      
      // محاكاة استدعاء API
      const where = { 
        status: 'published',
        category_id: testCategory.id
      };
      
      const articleIds = await prisma.articles.findMany({
        where,
        select: { id: true }
      }).then(articles => articles.map(a => a.id));
      
      const [totalArticles, totalLikes, totalViews, totalSaves] = await Promise.all([
        prisma.articles.count({ where }),
        prisma.interactions.count({
          where: {
            type: 'like',
            article_id: { in: articleIds }
          }
        }),
        prisma.articles.aggregate({
          _sum: { views: true },
          where
        }),
        prisma.interactions.count({
          where: {
            type: 'save',
            article_id: { in: articleIds }
          }
        })
      ]);
      
      console.log('\nنتائج API المتوقعة:');
      console.log(`- إجمالي المقالات: ${totalArticles}`);
      console.log(`- إجمالي الإعجابات: ${totalLikes}`);
      console.log(`- إجمالي المشاهدات: ${totalViews._sum.views || 0}`);
      console.log(`- إجمالي الحفظ: ${totalSaves}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkCategoryStats(); 