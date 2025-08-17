#!/usr/bin/env node
/**
 * إصلاح تناقضات العدادات في قاعدة البيانات
 * Database Counter Mismatch Fix Script
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 بدء إصلاح تناقضات العدادات...\n');
  
  try {
    await fixCounterMismatches();
    await addOptimizedIndexes();
    await cleanupOrphanedData();
    console.log('\n✅ تم إكمال الإصلاح بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function fixCounterMismatches() {
  console.log('📊 1. إصلاح تناقضات العدادات...');
  
  // جلب جميع المقالات مع إحصائياتها الصحيحة
  const articles = await prisma.$queryRaw`
    SELECT 
      a.id,
      a.title,
      a.likes as stored_likes,
      a.saves as stored_saves,
      COUNT(CASE WHEN i.type = 'like' THEN 1 END)::int as actual_likes,
      COUNT(CASE WHEN i.type = 'save' THEN 1 END)::int as actual_saves
    FROM articles a
    LEFT JOIN interactions i ON a.id = i.article_id
    GROUP BY a.id, a.title, a.likes, a.saves
  `;
  
  console.log(`   - فحص ${articles.length} مقال...`);
  
  let fixedCount = 0;
  const fixes = [];
  
  for (const article of articles) {
    const needsLikeFix = article.stored_likes !== article.actual_likes;
    const needsSaveFix = article.stored_saves !== article.actual_saves;
    
    if (needsLikeFix || needsSaveFix) {
      console.log(`   📝 إصلاح المقال: ${article.title?.substring(0, 40)}...`);
      console.log(`      - الإعجابات: ${article.stored_likes} → ${article.actual_likes}`);
      console.log(`      - الحفظ: ${article.stored_saves} → ${article.actual_saves}`);
      
      await prisma.articles.update({
        where: { id: article.id },
        data: {
          likes: article.actual_likes,
          saves: article.actual_saves
        }
      });
      
      fixes.push({
        id: article.id,
        title: article.title,
        likes_fixed: needsLikeFix,
        saves_fixed: needsSaveFix
      });
      
      fixedCount++;
    }
  }
  
  console.log(`   ✅ تم إصلاح ${fixedCount} مقال`);
  
  // حفظ تقرير الإصلاحات
  if (fixes.length > 0) {
    const report = {
      timestamp: new Date().toISOString(),
      fixed_articles: fixes.length,
      fixes: fixes
    };
    
    require('fs').writeFileSync(
      'counter-fix-report.json',
      JSON.stringify(report, null, 2),
      'utf8'
    );
    
    console.log(`   📄 تم حفظ التقرير في counter-fix-report.json`);
  }
}

async function addOptimizedIndexes() {
  console.log('\n🚀 2. إضافة فهارس محسنة...');
  
  const indexes = [
    {
      name: 'idx_interactions_user_article_type_fast',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_user_article_type_fast ON interactions (user_id, article_id, type, created_at DESC)',
      description: 'فهرس سريع للبحث عن التفاعلات'
    },
    {
      name: 'idx_interactions_article_stats',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_article_stats ON interactions (article_id, type) WHERE type IN (\'like\', \'save\')',
      description: 'فهرس محسن لإحصائيات المقالات'
    },
    {
      name: 'idx_articles_counters',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_counters ON articles (likes, saves) WHERE likes > 0 OR saves > 0',
      description: 'فهرس للمقالات ذات التفاعلات'
    }
  ];
  
  for (const index of indexes) {
    try {
      console.log(`   - إضافة ${index.name}...`);
      await prisma.$executeRawUnsafe(index.sql);
      console.log(`     ✅ ${index.description}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`     ℹ️ الفهرس موجود مسبقاً`);
      } else {
        console.log(`     ⚠️ فشل: ${error.message}`);
      }
    }
  }
}

async function cleanupOrphanedData() {
  console.log('\n🧹 3. تنظيف البيانات اليتيمة...');
  
  // تنظيف التفاعلات مع مقالات محذوفة
  const orphanedInteractions = await prisma.$queryRaw`
    DELETE FROM interactions 
    WHERE article_id NOT IN (SELECT id FROM articles)
    RETURNING id
  `;
  
  console.log(`   - حذف ${orphanedInteractions.length} تفاعل يتيم`);
  
  // تنظيف التفاعلات مع مستخدمين محذوفين
  const orphanedUserInteractions = await prisma.$queryRaw`
    DELETE FROM interactions 
    WHERE user_id NOT IN (SELECT id FROM users)
    RETURNING id
  `;
  
  console.log(`   - حذف ${orphanedUserInteractions.length} تفاعل مع مستخدمين محذوفين`);
  
  // إصلاح القيم السالبة
  const negativeCounters = await prisma.articles.updateMany({
    where: {
      OR: [
        { likes: { lt: 0 } },
        { saves: { lt: 0 } }
      ]
    },
    data: {
      likes: { set: 0 },
      saves: { set: 0 }
    }
  });
  
  console.log(`   - إصلاح ${negativeCounters.count} مقال بعدادات سالبة`);
  
  // إحصائيات نهائية
  console.log('\n📈 الإحصائيات النهائية:');
  
  const finalStats = await prisma.$queryRaw`
    SELECT 
      COUNT(*) as total_articles,
      COUNT(CASE WHEN likes > 0 THEN 1 END) as articles_with_likes,
      COUNT(CASE WHEN saves > 0 THEN 1 END) as articles_with_saves,
      SUM(likes) as total_likes,
      SUM(saves) as total_saves
    FROM articles
  `;
  
  const interactionStats = await prisma.$queryRaw`
    SELECT 
      COUNT(*) as total_interactions,
      COUNT(CASE WHEN type = 'like' THEN 1 END) as like_interactions,
      COUNT(CASE WHEN type = 'save' THEN 1 END) as save_interactions
    FROM interactions
  `;
  
  console.log('   المقالات:');
  finalStats.forEach(stat => {
    console.log(`   - إجمالي المقالات: ${stat.total_articles}`);
    console.log(`   - مقالات بإعجابات: ${stat.articles_with_likes}`);
    console.log(`   - مقالات محفوظة: ${stat.articles_with_saves}`);
    console.log(`   - إجمالي الإعجابات: ${stat.total_likes}`);
    console.log(`   - إجمالي المحفوظات: ${stat.total_saves}`);
  });
  
  console.log('   التفاعلات:');
  interactionStats.forEach(stat => {
    console.log(`   - إجمالي التفاعلات: ${stat.total_interactions}`);
    console.log(`   - تفاعلات الإعجاب: ${stat.like_interactions}`);
    console.log(`   - تفاعلات الحفظ: ${stat.save_interactions}`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
