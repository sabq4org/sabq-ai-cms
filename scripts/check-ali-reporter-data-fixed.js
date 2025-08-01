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
    
    console.log('📊 بيانات المراسل الحالية في جدول reporters:');
    console.log(`   👤 الاسم: ${reporter.full_name}`);
    console.log(`   🏷️ المنصب: ${reporter.title || 'غير محدد'}`);
    console.log(`   �� النبذة: ${reporter.bio || 'غير موجودة'}`);
    console.log(`   🖼️ الصورة: ${reporter.avatar_url || 'غير موجودة'}`);
    console.log(`   📰 عدد المقالات: ${reporter.total_articles || 0}`);
    console.log(`   👁️ المشاهدات: ${reporter.total_views || 0}`);
    console.log(`   ❤️ الإعجابات: ${reporter.total_likes || 0}`);
    console.log(`   📤 المشاركات: ${reporter.total_shares || 0}`);
    console.log(`   ✅ مُعتمد: ${reporter.is_verified ? 'نعم' : 'لا'}`);
    
    // 2. البحث عن المقالات الفعلية لهذا المراسل (بالحقول الصحيحة)
    const userArticles = await prisma.articles.findMany({
      where: {
        author_id: reporter.user_id,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        views: true,         // استخدام views بدلاً من views_count
        likes: true,         // استخدام likes بدلاً من likes_count
        shares: true,        // استخدام shares بدلاً من shares_count
        published_at: true,
        featured_image: true,
        slug: true
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 10
    });
    
    console.log(`\n📚 المقالات الفعلية للمراسل (${userArticles.length} مقال):`);
    if (userArticles.length > 0) {
      userArticles.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      👁️ ${article.views || 0} مشاهدة | ❤️ ${article.likes || 0} إعجاب | 📤 ${article.shares || 0} مشاركة`);
        console.log(`      📅 ${article.published_at ? article.published_at.toLocaleDateString('ar') : 'غير منشور'}`);
        console.log(`      🖼️ صورة: ${article.featured_image ? 'موجودة' : 'غير موجودة'}`);
        console.log(`      🔗 الرابط: /article/${article.id}\n`);
      });
      
      // حساب الإحصائيات الحقيقية
      const totalViews = userArticles.reduce((sum, article) => sum + (article.views || 0), 0);
      const totalLikes = userArticles.reduce((sum, article) => sum + (article.likes || 0), 0);
      const totalShares = userArticles.reduce((sum, article) => sum + (article.shares || 0), 0);
      
      console.log('📊 الإحصائيات الحقيقية المحسوبة:');
      console.log(`   📰 المقالات: ${userArticles.length}`);
      console.log(`   👁️ إجمالي المشاهدات: ${totalViews}`);
      console.log(`   ❤️ إجمالي الإعجابات: ${totalLikes}`);
      console.log(`   📤 إجمالي المشاركات: ${totalShares}`);
      
      console.log('\n🔄 يجب تحديث جدول reporters بهذه الإحصائيات الحقيقية!');
    } else {
      console.log('   ❌ لا توجد مقالات منشورة لهذا المراسل');
      
      // البحث عن جميع المقالات (بما في ذلك المسودات)
      const allArticles = await prisma.articles.findMany({
        where: {
          author_id: reporter.user_id
        },
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      console.log(`\n📋 جميع المقالات (بجميع الحالات): ${allArticles.length} مقال`);
      allArticles.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title} - الحالة: ${article.status}`);
      });
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
    
    // 4. اقتراحات للتحسين
    console.log('\n💡 التوصيات:');
    if (!reporter.avatar_url || reporter.avatar_url.includes('ui-avatars.com')) {
      console.log('   🖼️ يُنصح برفع صورة شخصية حقيقية للمراسل');
    }
    if (userArticles.length === 0) {
      console.log('   📰 يجب إضافة مقالات منشورة للمراسل');
    }
    if (reporter.total_articles === 0 && userArticles.length > 0) {
      console.log('   📊 يجب تحديث الإحصائيات في جدول reporters');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAliReporterData();
