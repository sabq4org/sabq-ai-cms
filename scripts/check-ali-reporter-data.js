const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAliReporterData() {
  try {
    console.log('🔍 فحص بيانات المراسل علي الحازمي...\n');
    
    // 1. البحث عن المراسل في جدول reporters
    const reporter = await prisma.reporters.findFirst({
      where: { slug: 'ali-alhazmi-389657' },
      select: {
        id: true,
        user_id: true,
        full_name: true,
        slug: true,
        title: true,
        bio: true,
        avatar_url: true,
        total_articles: true,
        total_views: true,
        total_likes: true,
        total_shares: true,
        is_verified: true,
        verification_badge: true,
        is_active: true
      }
    });
    
    if (!reporter) {
      console.log('❌ لا يوجد مراسل بهذا الـ slug');
      return;
    }
    
    console.log('📊 بيانات المراسل الحالية:');
    console.log(`   👤 الاسم: ${reporter.full_name}`);
    console.log(`   🏷️ المنصب: ${reporter.title || 'غير محدد'}`);
    console.log(`   📝 النبذة: ${reporter.bio || 'غير موجودة'}`);
    console.log(`   🖼️ الصورة: ${reporter.avatar_url || 'غير موجودة'}`);
    console.log(`   📰 عدد المقالات: ${reporter.total_articles || 0}`);
    console.log(`   👁️ المشاهدات: ${reporter.total_views || 0}`);
    console.log(`   ❤️ الإعجابات: ${reporter.total_likes || 0}`);
    console.log(`   📤 المشاركات: ${reporter.total_shares || 0}`);
    console.log(`   ✅ مُعتمد: ${reporter.is_verified ? 'نعم' : 'لا'}`);
    
    // 2. البحث عن المقالات الفعلية لهذا المراسل
    const userArticles = await prisma.articles.findMany({
      where: {
        author_id: reporter.user_id,
        status: 'published',
        is_deleted: false
      },
      select: {
        id: true,
        title: true,
        views_count: true,
        likes_count: true,
        shares_count: true,
        published_at: true,
        featured_image: true
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 5
    });
    
    console.log(`\n📚 المقالات الفعلية للمراسل (${userArticles.length} مقال):`);
    if (userArticles.length > 0) {
      userArticles.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      👁️ ${article.views_count || 0} مشاهدة | ❤️ ${article.likes_count || 0} إعجاب`);
        console.log(`      📅 ${article.published_at ? article.published_at.toLocaleDateString('ar') : 'غير منشور'}`);
        console.log(`      🖼️ صورة: ${article.featured_image ? 'موجودة' : 'غير موجودة'}\n`);
      });
      
      // حساب الإحصائيات الحقيقية
      const totalViews = userArticles.reduce((sum, article) => sum + (article.views_count || 0), 0);
      const totalLikes = userArticles.reduce((sum, article) => sum + (article.likes_count || 0), 0);
      const totalShares = userArticles.reduce((sum, article) => sum + (article.shares_count || 0), 0);
      
      console.log('📊 الإحصائيات الحقيقية المحسوبة:');
      console.log(`   📰 المقالات: ${userArticles.length}`);
      console.log(`   👁️ إجمالي المشاهدات: ${totalViews}`);
      console.log(`   ❤️ إجمالي الإعجابات: ${totalLikes}`);
      console.log(`   📤 إجمالي المشاركات: ${totalShares}`);
    } else {
      console.log('   ❌ لا توجد مقالات منشورة لهذا المراسل');
    }
    
    // 3. البحث عن بيانات المستخدم
    const user = await prisma.users.findUnique({
      where: { id: reporter.user_id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true
      }
    });
    
    if (user) {
      console.log('\n👤 بيانات المستخدم المرتبط:');
      console.log(`   📧 البريد: ${user.email}`);
      console.log(`   🖼️ صورة المستخدم: ${user.avatar_url || 'غير موجودة'}`);
      console.log(`   📅 تاريخ التسجيل: ${user.created_at.toLocaleDateString('ar')}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAliReporterData();
