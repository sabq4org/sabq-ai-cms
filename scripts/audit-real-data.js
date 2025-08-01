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
        avatar_url: true,
        bio: true
      }
    });
    
    console.log(`   📊 العدد الإجمالي: ${realTeamMembers.length} عضو`);
    realTeamMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (${member.role})`);
      console.log(`      📧 البريد: ${member.email}`);
      console.log(`      🖼️ الصورة: ${member.avatar_url ? 'موجودة' : '❌ غير موجودة'}`);
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
        views: true,
        likes: true,
        shares: true,
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
      member.avatar_url && (
        member.avatar_url.includes('ui-avatars.com') ||
        member.avatar_url.includes('unsplash.com') ||
        member.avatar_url.includes('placeholder')
      )
    );
    
    const membersWithRealImages = realTeamMembers.filter(member => 
      member.avatar_url && !(
        member.avatar_url.includes('ui-avatars.com') ||
        member.avatar_url.includes('unsplash.com') ||
        member.avatar_url.includes('placeholder')
      )
    );
    
    const membersWithoutImages = realTeamMembers.filter(member => !member.avatar_url);
    
    console.log(`   ✅ أعضاء بصور حقيقية: ${membersWithRealImages.length}`);
    console.log(`   ⚠️ أعضاء بصور وهمية: ${membersWithFakeImages.length}`);
    console.log(`   ❌ أعضاء بدون صور: ${membersWithoutImages.length}`);
    
    if (membersWithFakeImages.length > 0) {
      console.log('\n   🚫 أعضاء يستخدمون صور وهمية (يجب إصلاحها):');
      membersWithFakeImages.forEach(member => {
        console.log(`      - ${member.name}: ${member.avatar_url}`);
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
    
    // 5. توصيات الإصلاح
    console.log('\n💡 توصيات الإصلاح المطلوبة:');
    
    if (membersWithFakeImages.length > 0) {
      console.log(`   🔧 إزالة الصور الوهمية لـ ${membersWithFakeImages.length} أعضاء`);
    }
    
    if (membersWithoutImages.length > 0) {
      console.log(`   📸 إضافة صور حقيقية لـ ${membersWithoutImages.length} أعضاء أو إخفاء عرض الصورة`);
    }
    
    if (publishedArticles.length === 0) {
      console.log(`   📰 ضرورة وجود مقالات منشورة حقيقية في النظام`);
    }
    
    if (articlesWithoutViews.length > 0) {
      console.log(`   📊 ${articlesWithoutViews.length} مقال بدون إحصائيات مشاهدة`);
    }
    
    console.log('\n✅ انتهت المراجعة الشاملة.');
    
  } catch (error) {
    console.error('❌ خطأ في المراجعة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditRealData();
