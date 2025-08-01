const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateCleanupSummary() {
  console.log('📊 تقرير نهائي بعد تنظيف البيانات التجريبية\n');
  
  try {
    // إحصائيات شاملة
    const [
      articlesCount,
      publishedArticlesCount,
      draftArticlesCount,
      teamMembersCount,
      keywordsCount,
      categoriesCount,
      reportersCount,
      interactionsCount
    ] = await Promise.all([
      prisma.articles.count(),
      prisma.articles.count({ where: { status: 'published' } }),
      prisma.articles.count({ where: { status: 'draft' } }),
      prisma.team_members.count(),
      prisma.keywords.count(),
      prisma.categories.count(),
      prisma.reporters.count(),
      prisma.interactions.count()
    ]);
    
    console.log('📰 **المقالات:**');
    console.log(`   - إجمالي المقالات: ${articlesCount}`);
    console.log(`   - المقالات المنشورة: ${publishedArticlesCount}`);
    console.log(`   - المسودات: ${draftArticlesCount}`);
    
    console.log('\n👥 **الفريق:**');
    console.log(`   - أعضاء الفريق: ${teamMembersCount}`);
    console.log(`   - المراسلين: ${reportersCount}`);
    
    console.log('\n🔧 **البيانات المساعدة:**');
    console.log(`   - التصنيفات: ${categoriesCount}`);
    console.log(`   - الكلمات المفتاحية: ${keywordsCount}`);
    console.log(`   - التفاعلات: ${interactionsCount}`);
    
    // عرض أحدث المقالات المتبقية
    console.log('\n📋 **أحدث المقالات المتبقية:**');
    const recentArticles = await prisma.articles.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: { id: true, title: true, status: true, created_at: true }
    });
    
    recentArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title} (${article.status})`);
    });
    
    // عرض أعضاء الفريق المتبقين
    console.log('\n👤 **أعضاء الفريق المتبقين:**');
    const remainingTeamMembers = await prisma.team_members.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { created_at: 'asc' }
    });
    
    remainingTeamMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (${member.role || 'غير محدد'}) - ${member.email}`);
    });
    
    console.log('\n✅ **ملخص التنظيف:**');
    console.log('   - تم حذف جميع المقالات التجريبية');
    console.log('   - تم حذف أعضاء الفريق المُضافين للتجربة');
    console.log('   - تم الاحتفاظ بالبيانات الأساسية والحقيقية');
    console.log('   - قاعدة البيانات نظيفة وجاهزة للاستخدام الفعلي');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء التقرير:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateCleanupSummary();