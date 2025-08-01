const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditRealData() {
  try {
    console.log('🔍 مراجعة شاملة للبيانات الحقيقية في النظام...\n');
    
    // 1. فحص أعضاء الفريق الحقيقيين
    console.log('👥 أعضاء الفريق الحقيقيين:');
    const realTeamMembers = await prisma.team_members.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,      // الحقل الصحيح
        bio: true
      }
    });
    
    console.log(`   📊 العدد الإجمالي: ${realTeamMembers.length} عضو`);
    realTeamMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (${member.role})`);
      console.log(`      📧 البريد: ${member.email || 'غير محدد'}`);
      console.log(`      🖼️ الصورة: ${member.avatar ? 'موجودة' : '❌ غير موجودة'}`);
      console.log(`      📝 النبذة: ${member.bio ? 'موجودة' : '❌ غير موجودة'}\n`);
    });
    
    // 2. فحص المقالات المنشورة الحقيقية
    console.log('\n📰 المقالات المنشورة الحقيقية:');
    const publishedArticles = await prisma.articles.findMany({
      where: { 
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        author_id: true,
        views: true,          // الحقل الصحيح
        likes: true,          // الحقل الصحيح  
        shares: true,         // الحقل الصحيح
        published_at: true,
        featured_image: true
      },
      orderBy: {
        published_at: 'desc'
      }
    });
    
    console.log(`   📊 العدد الإجمالي: ${publishedArticles.length} مقال منشور`);
    
    if (publishedArticles.length > 0) {
      console.log('\n   📋 آخر 5 مقالات:');
      publishedArticles.slice(0, 5).forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      👁️ المشاهدات: ${article.views || 0}`);
        console.log(`      ❤️ الإعجابات: ${article.likes || 0}`);
        console.log(`      📤 المشاركات: ${article.shares || 0}`);
        console.log(`      📅 تاريخ النشر: ${article.published_at ? article.published_at.toLocaleDateString('ar') : 'غير محدد'}`);
        console.log(`      🖼️ الصورة: ${article.featured_image ? 'موجودة' : '❌ غير موجودة'}\n`);
      });
    } else {
      console.log('   ❌ لا توجد مقالات منشورة في قاعدة البيانات');
    }
    
    // 3. فحص الصور الحقيقية vs الوهمية
    console.log('\n🖼️ تحليل الصور المستخدمة:');
    
    const membersWithFakeImages = realTeamMembers.filter(member => 
      member.avatar && (
        member.avatar.includes('ui-avatars.com') ||
        member.avatar.includes('unsplash.com') ||
        member.avatar.includes('placeholder') ||
        member.avatar.includes('faker') ||
        member.avatar.includes('lorempixel')
      )
    );
    
    const membersWithRealImages = realTeamMembers.filter(member => 
      member.avatar && !(
        member.avatar.includes('ui-avatars.com') ||
        member.avatar.includes('unsplash.com') ||
        member.avatar.includes('placeholder') ||
        member.avatar.includes('faker') ||
        member.avatar.includes('lorempixel')
      )
    );
    
    const membersWithoutImages = realTeamMembers.filter(member => !member.avatar);
    
    console.log(`   ✅ أعضاء بصور حقيقية: ${membersWithRealImages.length}`);
    console.log(`   ⚠️ أعضاء بصور وهمية: ${membersWithFakeImages.length}`);
    console.log(`   ❌ أعضاء بدون صور: ${membersWithoutImages.length}`);
    
    if (membersWithFakeImages.length > 0) {
      console.log('\n   🚫 أعضاء يستخدمون صور وهمية (يجب إصلاحها):');
      membersWithFakeImages.forEach(member => {
        console.log(`      - ${member.name}: ${member.avatar}`);
      });
    }
    
    // 4. فحص البيانات الوهمية في المقالات
    console.log('\n📊 تحليل بيانات المقالات:');
    
    const articlesWithViews = publishedArticles.filter(article => (article.views || 0) > 0);
    const articlesWithoutViews = publishedArticles.filter(article => (article.views || 0) === 0);
    
    console.log(`   ✅ مقالات بمشاهدات حقيقية: ${articlesWithViews.length}`);
    console.log(`   ⚠️ مقالات بدون مشاهدات: ${articlesWithoutViews.length}`);
    
    const totalViews = publishedArticles.reduce((sum, article) => sum + (article.views || 0), 0);
    const totalLikes = publishedArticles.reduce((sum, article) => sum + (article.likes || 0), 0);
    const totalShares = publishedArticles.reduce((sum, article) => sum + (article.shares || 0), 0);
    
    console.log(`   📈 إجمالي المشاهدات الحقيقية: ${totalViews}`);
    console.log(`   ❤️ إجمالي الإعجابات الحقيقية: ${totalLikes}`);
    console.log(`   📤 إجمالي المشاركات الحقيقية: ${totalShares}`);
    
    // 5. فحص مقالات بصور وهمية
    const articlesWithFakeImages = publishedArticles.filter(article =>
      article.featured_image && (
        article.featured_image.includes('unsplash.com') ||
        article.featured_image.includes('placeholder') ||
        article.featured_image.includes('lorempixel') ||
        article.featured_image.includes('faker')
      )
    );
    
    console.log(`   🖼️ مقالات بصور وهمية: ${articlesWithFakeImages.length}`);
    
    // 6. فحص جدول reporters للصور الوهمية
    console.log('\n👤 فحص جدول المراسلين:');
    const reporters = await prisma.reporters.findMany({
      where: { is_active: true },
      select: {
        id: true,
        full_name: true,
        avatar_url: true,
        total_articles: true,
        total_views: true
      }
    });
    
    const reportersWithFakeImages = reporters.filter(reporter =>
      reporter.avatar_url && (
        reporter.avatar_url.includes('ui-avatars.com') ||
        reporter.avatar_url.includes('unsplash.com') ||
        reporter.avatar_url.includes('placeholder')
      )
    );
    
    console.log(`   📊 إجمالي المراسلين: ${reporters.length}`);
    console.log(`   ⚠️ مراسلين بصور وهمية: ${reportersWithFakeImages.length}`);
    
    // 7. توصيات الإصلاح الفورية
    console.log('\n🚨 الإجراءات المطلوبة فوراً:');
    
    let actionsRequired = [];
    
    if (membersWithFakeImages.length > 0) {
      actionsRequired.push(`إزالة الصور الوهمية لـ ${membersWithFakeImages.length} أعضاء فريق`);
    }
    
    if (reportersWithFakeImages.length > 0) {
      actionsRequired.push(`إزالة الصور الوهمية لـ ${reportersWithFakeImages.length} مراسلين`);
    }
    
    if (articlesWithFakeImages.length > 0) {
      actionsRequired.push(`إزالة الصور الوهمية من ${articlesWithFakeImages.length} مقال`);
    }
    
    if (publishedArticles.length === 0) {
      actionsRequired.push('ضرورة وجود مقالات منشورة حقيقية');
    }
    
    if (actionsRequired.length > 0) {
      actionsRequired.forEach((action, index) => {
        console.log(`   ${index + 1}. ${action}`);
      });
    } else {
      console.log('   ✅ جميع البيانات حقيقية - لا توجد إجراءات مطلوبة');
    }
    
    console.log('\n📋 ملخص التقييم النهائي:');
    console.log(`   📊 أعضاء الفريق: ${realTeamMembers.length} (${membersWithFakeImages.length} بصور وهمية)`);
    console.log(`   📰 المقالات المنشورة: ${publishedArticles.length} (${articlesWithFakeImages.length} بصور وهمية)`);
    console.log(`   👤 المراسلين: ${reporters.length} (${reportersWithFakeImages.length} بصور وهمية)`);
    console.log(`   📈 إجمالي المشاهدات: ${totalViews}`);
    
  } catch (error) {
    console.error('❌ خطأ في المراجعة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditRealData();
