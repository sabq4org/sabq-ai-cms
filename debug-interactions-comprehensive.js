#!/usr/bin/env node
/**
 * تشخيص شامل لأعطال الإعجاب والحفظ
 * Comprehensive Debugging Script for Like/Bookmark Issues
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// إعدادات التشخيص
const TEST_USER_EMAIL = 'editor@sabq.ai';
const PERFORMANCE_THRESHOLD_MS = 150; // حد الأداء المطلوب

async function main() {
  console.log('🔍 بدء التشخيص الشامل لأعطال الإعجاب والحفظ...\n');
  
  try {
    await diagnoseDatabase();
    await diagnoseAPIs();
    await diagnosePerformance();
    await diagnoseConcurrency();
    await generateRecommendations();
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function diagnoseDatabase() {
  console.log('📊 1. تشخيص قاعدة البيانات...');
  
  // فحص الجداول
  console.log('   - فحص وجود الجداول...');
  
  try {
    const interactionsCount = await prisma.interactions.count();
    const userInteractionsCount = await prisma.UserInteractions.count();
    const usersCount = await prisma.users.count();
    const articlesCount = await prisma.articles.count();
    
    console.log(`   ✅ interactions: ${interactionsCount} سجل`);
    console.log(`   ✅ UserInteractions: ${userInteractionsCount} سجل`);
    console.log(`   ✅ users: ${usersCount} مستخدم`);
    console.log(`   ✅ articles: ${articlesCount} مقال`);
  } catch (error) {
    console.log(`   ❌ خطأ في الوصول للجداول: ${error.message}`);
    return;
  }
  
  // فحص الفهارس والقيود
  console.log('   - فحص الفهارس والقيود...');
  
  try {
    // فحص القيد الفريد في interactions
    const duplicateInteractions = await prisma.$queryRaw`
      SELECT user_id, article_id, type, COUNT(*) as count
      FROM interactions 
      GROUP BY user_id, article_id, type 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateInteractions.length > 0) {
      console.log(`   ❌ تفاعلات مكررة موجودة: ${duplicateInteractions.length}`);
      duplicateInteractions.forEach(dup => {
        console.log(`      - ${dup.user_id}/${dup.article_id}/${dup.type}: ${dup.count} مرة`);
      });
    } else {
      console.log('   ✅ لا توجد تفاعلات مكررة');
    }
  } catch (error) {
    console.log(`   ⚠️  تعذر فحص التفاعلات المكررة: ${error.message}`);
  }
  
  // فحص تطابق العدادات
  console.log('   - فحص تطابق العدادات...');
  
  try {
    const articlesWithMismatch = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.title,
        a.likes as article_likes,
        a.saves as article_saves,
        COUNT(CASE WHEN i.type = 'like' THEN 1 END) as actual_likes,
        COUNT(CASE WHEN i.type = 'save' THEN 1 END) as actual_saves
      FROM articles a
      LEFT JOIN interactions i ON a.id = i.article_id
      GROUP BY a.id, a.title, a.likes, a.saves
      HAVING 
        a.likes != COUNT(CASE WHEN i.type = 'like' THEN 1 END) OR
        a.saves != COUNT(CASE WHEN i.type = 'save' THEN 1 END)
      LIMIT 10
    `;
    
    if (articlesWithMismatch.length > 0) {
      console.log(`   ❌ مقالات بعدادات غير متطابقة: ${articlesWithMismatch.length}`);
      articlesWithMismatch.forEach(article => {
        console.log(`      - ${article.title?.substring(0,30)}...:`);
        console.log(`        الإعجابات: ${article.article_likes} (مسجل) vs ${article.actual_likes} (فعلي)`);
        console.log(`        الحفظ: ${article.article_saves} (مسجل) vs ${article.actual_saves} (فعلي)`);
      });
    } else {
      console.log('   ✅ العدادات متطابقة');
    }
  } catch (error) {
    console.log(`   ⚠️  تعذر فحص العدادات: ${error.message}`);
  }
  
  console.log();
}

async function diagnoseAPIs() {
  console.log('🔗 2. تشخيص APIs...');
  
  // العثور على مستخدم تجريبي
  const testUser = await prisma.users.findFirst({
    where: { email: TEST_USER_EMAIL }
  });
  
  if (!testUser) {
    console.log('   ❌ لم يتم العثور على المستخدم التجريبي');
    return;
  }
  
  // العثور على مقال للاختبار
  const testArticle = await prisma.articles.findFirst({
    where: { status: 'published' }
  });
  
  if (!testArticle) {
    console.log('   ❌ لم يتم العثور على مقال للاختبار');
    return;
  }
  
  console.log(`   - اختبار مع المستخدم: ${testUser.name} (${testUser.email})`);
  console.log(`   - اختبار مع المقال: ${testArticle.title?.substring(0,40)}...`);
  
  // تشخيص API الإعجاب
  console.log('   - اختبار Like API...');
  
  try {
    const likeStartTime = performance.now();
    
    // محاولة إعجاب
    const likeInteraction = await prisma.interactions.upsert({
      where: {
        user_id_article_id_type: {
          user_id: testUser.id,
          article_id: testArticle.id,
          type: 'like'
        }
      },
      create: {
        id: `test_like_${Date.now()}`,
        user_id: testUser.id,
        article_id: testArticle.id,
        type: 'like'
      },
      update: {}
    });
    
    const likeEndTime = performance.now();
    const likeDuration = likeEndTime - likeStartTime;
    
    console.log(`     ✅ إعجاب نجح في ${likeDuration.toFixed(2)}ms`);
    
    // إزالة الاختبار
    await prisma.interactions.delete({
      where: { id: likeInteraction.id }
    });
    
  } catch (error) {
    console.log(`     ❌ فشل الإعجاب: ${error.message}`);
    
    // تشخيص مفصل
    if (error.code === 'P2002') {
      console.log(`     📋 سبب الفشل: انتهاك القيد الفريد - تفاعل موجود مسبقاً`);
    } else if (error.code === 'P2025') {
      console.log(`     📋 سبب الفشل: سجل غير موجود`);
    } else {
      console.log(`     📋 سبب الفشل: ${error.code || 'غير محدد'}`);
    }
  }
  
  // تشخيص API الحفظ
  console.log('   - اختبار Save API...');
  
  try {
    const saveStartTime = performance.now();
    
    // محاولة حفظ
    const saveInteraction = await prisma.interactions.upsert({
      where: {
        user_id_article_id_type: {
          user_id: testUser.id,
          article_id: testArticle.id,
          type: 'save'
        }
      },
      create: {
        id: `test_save_${Date.now()}`,
        user_id: testUser.id,
        article_id: testArticle.id,
        type: 'save'
      },
      update: {}
    });
    
    const saveEndTime = performance.now();
    const saveDuration = saveEndTime - saveStartTime;
    
    console.log(`     ✅ حفظ نجح في ${saveDuration.toFixed(2)}ms`);
    
    if (saveDuration > PERFORMANCE_THRESHOLD_MS) {
      console.log(`     ⚠️  بطء في الأداء: ${saveDuration.toFixed(2)}ms > ${PERFORMANCE_THRESHOLD_MS}ms`);
    }
    
    // إزالة الاختبار
    await prisma.interactions.delete({
      where: { id: saveInteraction.id }
    });
    
  } catch (error) {
    console.log(`     ❌ فشل الحفظ: ${error.message}`);
    
    if (error.code === 'P2002') {
      console.log(`     📋 سبب الفشل: انتهاك القيد الفريد - تفاعل موجود مسبقاً`);
    }
  }
  
  console.log();
}

async function diagnosePerformance() {
  console.log('⚡ 3. تشخيص الأداء...');
  
  // فحص الفهارس
  console.log('   - فحص الفهارس...');
  
  try {
    const indexesQuery = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename IN ('interactions', 'userinteractions', 'articles', 'users')
      ORDER BY tablename, indexname
    `;
    
    const interactionIndexes = indexesQuery.filter(idx => idx.tablename === 'interactions');
    console.log(`     - interactions: ${interactionIndexes.length} فهرس`);
    
    // فحص وجود الفهارس المهمة
    const hasUserArticleIndex = interactionIndexes.some(idx => 
      idx.indexname.includes('user_id_article_id_type') || 
      idx.indexdef.includes('user_id') && idx.indexdef.includes('article_id')
    );
    
    if (hasUserArticleIndex) {
      console.log('       ✅ فهرس user_id + article_id موجود');
    } else {
      console.log('       ❌ فهرس user_id + article_id مفقود');
    }
    
  } catch (error) {
    console.log(`     ⚠️  تعذر فحص الفهارس: ${error.message}`);
  }
  
  // اختبار أداء الاستعلامات
  console.log('   - اختبار أداء الاستعلامات...');
  
  const queries = [
    {
      name: 'جلب تفاعلات مستخدم',
      query: () => prisma.interactions.findMany({
        where: { user_id: { not: null } },
        take: 100,
        orderBy: { created_at: 'desc' }
      })
    },
    {
      name: 'جلب إحصائيات مقال',
      query: () => prisma.interactions.groupBy({
        by: ['type'],
        where: { article_id: { not: null } },
        _count: true
      })
    },
    {
      name: 'فحص تفاعل محدد',
      query: () => prisma.interactions.findFirst({
        where: {
          user_id: { not: null },
          article_id: { not: null },
          type: 'like'
        }
      })
    }
  ];
  
  for (const test of queries) {
    try {
      const startTime = performance.now();
      await test.query();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const status = duration < PERFORMANCE_THRESHOLD_MS ? '✅' : '⚠️ ';
      console.log(`     ${status} ${test.name}: ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.log(`     ❌ ${test.name}: فشل (${error.message})`);
    }
  }
  
  console.log();
}

async function diagnoseConcurrency() {
  console.log('🔄 4. تشخيص التحكم بالتزامن...');
  
  // العثور على مستخدم ومقال للاختبار
  const testUser = await prisma.users.findFirst({
    where: { email: TEST_USER_EMAIL }
  });
  
  const testArticle = await prisma.articles.findFirst({
    where: { status: 'published' }
  });
  
  if (!testUser || !testArticle) {
    console.log('   ⚠️  تعذر العثور على بيانات اختبار للتزامن');
    return;
  }
  
  console.log('   - اختبار طلبات متزامنة...');
  
  // اختبار الطلبات المتزامنة
  const concurrentRequests = [];
  const requestCount = 5;
  
  for (let i = 0; i < requestCount; i++) {
    concurrentRequests.push(
      simulateToggleLike(testUser.id, testArticle.id, i)
    );
  }
  
  try {
    const results = await Promise.allSettled(concurrentRequests);
    
    let successCount = 0;
    let errorCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        console.log(`     ✅ طلب ${index + 1}: نجح`);
      } else {
        errorCount++;
        console.log(`     ❌ طلب ${index + 1}: فشل - ${result.reason?.message}`);
      }
    });
    
    console.log(`   📊 النتيجة: ${successCount} نجح، ${errorCount} فشل من ${requestCount}`);
    
    // تنظيف بيانات الاختبار
    await prisma.interactions.deleteMany({
      where: {
        user_id: testUser.id,
        article_id: testArticle.id,
        id: { contains: 'concurrent_test' }
      }
    });
    
  } catch (error) {
    console.log(`   ❌ فشل اختبار التزامن: ${error.message}`);
  }
  
  console.log();
}

async function simulateToggleLike(userId, articleId, requestId) {
  return prisma.interactions.upsert({
    where: {
      user_id_article_id_type: {
        user_id: userId,
        article_id: articleId,
        type: 'like'
      }
    },
    create: {
      id: `concurrent_test_${requestId}_${Date.now()}`,
      user_id: userId,
      article_id: articleId,
      type: 'like'
    },
    update: {}
  });
}

async function generateRecommendations() {
  console.log('💡 5. توصيات الإصلاح...\n');
  
  console.log('📋 التوصيات الفورية:');
  console.log('   1. إنشاء API موحد للإعجاب والحفظ مع معالجة أخطاء شاملة');
  console.log('   2. تطبيق معاملات قاعدة البيانات لضمان تناسق البيانات');
  console.log('   3. إضافة فهارس محسنة للأداء');
  console.log('   4. تطبيق آلية قفل للتحكم في التزامن');
  console.log('   5. إنشاء API لمزامنة حالة UI مع قاعدة البيانات');
  
  console.log('\n📋 التحسينات المتوسطة:');
  console.log('   1. نظام كاش ذكي للتفاعلات');
  console.log('   2. معالجة أخطاء UI مع rollback');
  console.log('   3. رصد الأداء والتحليلات');
  console.log('   4. تحسين الاستعلامات بـ PostgreSQL');
  
  console.log('\n📋 التحسينات طويلة المدى:');
  console.log('   1. نظام طوابير للعمليات الثقيلة');
  console.log('   2. تطبيق Event Sourcing للتفاعلات');
  console.log('   3. نظام نسخ احتياطي وإصلاح تلقائي');
  console.log('   4. تطبيق WebSockets للتحديثات الفورية');
  
  console.log('\n🎯 الأولوية القصوى:');
  console.log('   • إصلاح API الإعجاب فوراً');
  console.log('   • تحسين أداء API الحفظ');  
  console.log('   • مزامنة حالة UI مع قاعدة البيانات');
  console.log('   • إضافة معالجة أخطاء شاملة');
}

// تشغيل التشخيص
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
