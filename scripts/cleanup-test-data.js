const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('🧹 بدء تنظيف البيانات التجريبية...\n');
  
  try {
    // 1. حذف الأخبار التجريبية
    console.log('1️⃣ حذف الأخبار التجريبية...');
    
    // البحث عن المقالات التجريبية
    const testArticles = await prisma.articles.findMany({
      where: {
        OR: [
          { title: { contains: 'test', mode: 'insensitive' } },
          { title: { contains: 'اختبار', mode: 'insensitive' } },
          { title: { contains: 'تجريبي', mode: 'insensitive' } },
          { title: { contains: 'تجربة', mode: 'insensitive' } },
          { content: { contains: 'test', mode: 'insensitive' } },
          { content: { contains: 'اختبار', mode: 'insensitive' } },
          { content: { contains: 'تجريبي', mode: 'insensitive' } }
        ]
      },
      select: { id: true, title: true, created_at: true }
    });
    
    console.log(`📋 وُجد ${testArticles.length} مقال تجريبي:`);
    testArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title} (${article.id})`);
    });
    
    if (testArticles.length > 0) {
      const articleIds = testArticles.map(article => article.id);
      
      // حذف البيانات المرتبطة أولاً
      console.log('🔗 حذف البيانات المرتبطة...');
      
      // حذف التفاعلات المرتبطة
      const deletedInteractions = await prisma.interactions.deleteMany({
        where: { article_id: { in: articleIds } }
      });
      console.log(`   - تم حذف ${deletedInteractions.count} تفاعل`);
      
      // حذف التعليقات المرتبطة (إن وجدت)
      try {
        const deletedComments = await prisma.comments.deleteMany({
          where: { article_id: { in: articleIds } }
        });
        console.log(`   - تم حذف ${deletedComments.count} تعليق`);
      } catch (e) {
        console.log('   - لا يوجد تعليقات للحذف');
      }
      
      // حذف البيانات التحليلية المرتبطة (إن وجدت)
      try {
        const deletedAnalytics = await prisma.analytics_data.deleteMany({
          where: { 
            AND: [
              { metric_name: 'article_views' },
              { dimensions: { path: ['article_id'], in: articleIds } }
            ]
          }
        });
        console.log(`   - تم حذف ${deletedAnalytics.count} بيانات تحليلية`);
      } catch (e) {
        console.log('   - لا يوجد بيانات تحليلية للحذف');
      }
      
      // الآن حذف المقالات
      const deletedArticles = await prisma.articles.deleteMany({
        where: {
          id: { in: articleIds }
        }
      });
      
      console.log(`✅ تم حذف ${deletedArticles.count} مقال تجريبي`);
    } else {
      console.log('✅ لا يوجد مقالات تجريبية للحذف');
    }
    
    // 2. حذف أعضاء الفريق التجريبيين
    console.log('\n2️⃣ حذف أعضاء الفريق التجريبيين...');
    
    // البحث عن أعضاء الفريق التجريبيين
    const testTeamMembers = await prisma.team_members.findMany({
      where: {
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { name: { contains: 'اختبار', mode: 'insensitive' } },
          { name: { contains: 'تجريبي', mode: 'insensitive' } },
          { email: { contains: 'test', mode: 'insensitive' } },
          { email: { contains: 'example', mode: 'insensitive' } },
          { email: { contains: 'demo', mode: 'insensitive' } },
          // أعضاء مضافين حديثاً (آخر 24 ساعة) قد يكونوا تجريبيين
          {
            AND: [
              { created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
              { id: { startsWith: 'team-' } }
            ]
          }
        ]
      },
      select: { id: true, name: true, email: true, created_at: true }
    });
    
    console.log(`👥 وُجد ${testTeamMembers.length} عضو فريق تجريبي:`);
    testTeamMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (${member.email}) - ${member.id}`);
    });
    
    if (testTeamMembers.length > 0) {
      const memberIds = testTeamMembers.map(member => member.id);
      
      const deletedMembers = await prisma.team_members.deleteMany({
        where: {
          id: { in: memberIds }
        }
      });
      
      console.log(`✅ تم حذف ${deletedMembers.count} عضو فريق تجريبي`);
    } else {
      console.log('✅ لا يوجد أعضاء فريق تجريبيين للحذف');
    }
    
    // 3. حذف الكلمات المفتاحية التجريبية
    console.log('\n3️⃣ حذف الكلمات المفتاحية التجريبية...');
    
    const testKeywords = await prisma.keywords.findMany({
      where: {
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { name: { contains: 'اختبار', mode: 'insensitive' } },
          { name: { contains: 'تجريبي', mode: 'insensitive' } },
          { name: { contains: 'API', mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, created_at: true }
    });
    
    console.log(`🔑 وُجد ${testKeywords.length} كلمة مفتاحية تجريبية:`);
    testKeywords.forEach((keyword, index) => {
      console.log(`   ${index + 1}. ${keyword.name} (${keyword.id})`);
    });
    
    if (testKeywords.length > 0) {
      const keywordIds = testKeywords.map(keyword => keyword.id);
      
      const deletedKeywords = await prisma.keywords.deleteMany({
        where: {
          id: { in: keywordIds }
        }
      });
      
      console.log(`✅ تم حذف ${deletedKeywords.count} كلمة مفتاحية تجريبية`);
    } else {
      console.log('✅ لا يوجد كلمات مفتاحية تجريبية للحذف');
    }
    
    // 4. إحصائيات نهائية
    console.log('\n📊 إحصائيات قاعدة البيانات بعد التنظيف:');
    
    const [articlesCount, teamMembersCount, keywordsCount] = await Promise.all([
      prisma.articles.count({ where: { status: { not: 'deleted' } } }),
      prisma.team_members.count(),
      prisma.keywords.count()
    ]);
    
    console.log(`📰 المقالات المتبقية: ${articlesCount}`);
    console.log(`👥 أعضاء الفريق المتبقين: ${teamMembersCount}`);
    console.log(`🔑 الكلمات المفتاحية المتبقية: ${keywordsCount}`);
    
    console.log('\n✅ تم تنظيف البيانات التجريبية بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestData();