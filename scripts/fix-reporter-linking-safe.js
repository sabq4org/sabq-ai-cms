const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixReporterLinkingSafe() {
  try {
    console.log('🔧 إصلاح ربط المراسلين - الطريقة الآمنة...\n');
    
    // 1. تحليل الوضع الحالي
    console.log('📊 تحليل الوضع الحالي:');
    
    const totalArticles = await prisma.articles.count({
      where: { status: 'published' }
    });
    
    const uniqueAuthorIds = await prisma.articles.findMany({
      where: { status: 'published' },
      select: { author_id: true },
      distinct: ['author_id']
    });
    
    console.log(`   📰 إجمالي المقالات: ${totalArticles}`);
    console.log(`   👤 عدد المؤلفين الفريدين: ${uniqueAuthorIds.length}`);
    
    // 2. جلب المؤلفين من جدول users
    console.log('\n👥 جلب بيانات المؤلفين من جدول users:');
    
    const authorDetails = [];
    
    for (const authorRecord of uniqueAuthorIds) {
      const user = await prisma.users.findUnique({
        where: { id: authorRecord.author_id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      if (user) {
        // عدد المقالات لهذا المؤلف
        const articleCount = await prisma.articles.count({
          where: {
            author_id: user.id,
            status: 'published'
          }
        });
        
        // التحقق من وجود بروفايل مراسل
        const existingReporter = await prisma.reporters.findFirst({
          where: { user_id: user.id }
        });
        
        authorDetails.push({
          user: user,
          articleCount: articleCount,
          hasReporterProfile: !!existingReporter,
          reporterProfile: existingReporter
        });
        
        console.log(`   ${user.name} (${user.email}): ${articleCount} مقال`);
        console.log(`      دور: ${user.role || 'غير محدد'}`);
        console.log(`      بروفايل مراسل: ${existingReporter ? '✅ موجود' : '❌ غير موجود'}`);
      } else {
        console.log(`   ⚠️ author_id غير صالح: ${authorRecord.author_id}`);
      }
    }
    
    // 3. إنشاء بروفايلات مراسلين للمؤلفين الذين لا يملكونها
    console.log('\n🆕 إنشاء بروفايلات مراسلين مفقودة:');
    
    let createdProfiles = 0;
    
    for (const authorDetail of authorDetails) {
      if (!authorDetail.hasReporterProfile && authorDetail.articleCount > 0) {
        const user = authorDetail.user;
        
        console.log(`\n   📝 إنشاء بروفايل لـ ${user.name}:`);
        
        // إنشاء slug فريد
        const baseSlug = user.name
          .toLowerCase()
          .replace(/[أإآء]/g, 'ا')
          .replace(/[ة]/g, 'ه')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '');
        
        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;
        
        // تحديد المنصب حسب الدور
        let title = 'مراسل صحفي';
        if (user.role === 'editor') title = 'محرر';
        else if (user.role === 'chief_editor') title = 'رئيس تحرير';
        else if (user.role === 'admin') title = 'مدير تحرير';
        
        try {
          const newReporter = await prisma.reporters.create({
            data: {
              id: `reporter_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
              user_id: user.id,
              full_name: user.name,
              slug: slug,
              title: title,
              bio: `${title} في صحيفة سبق الإلكترونية`,
              avatar_url: null, // لا صور وهمية
              specializations: [],
              coverage_areas: ['السعودية'],
              is_verified: user.role === 'admin' || user.role === 'chief_editor',
              verification_badge: user.role === 'admin' ? 'chief_editor' : (user.role === 'chief_editor' ? 'verified' : null),
              is_active: true,
              total_articles: authorDetail.articleCount,
              total_views: 0,
              total_likes: 0,
              total_shares: 0,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          
          console.log(`      ✅ تم إنشاء البروفايل: ${slug}`);
          console.log(`      🎯 المنصب: ${title}`);
          console.log(`      🔗 معرف المراسل: ${newReporter.id}`);
          
          createdProfiles++;
          
          // تحديث إحصائيات المراسل الجديد
          await updateReporterStats(newReporter.id, user.id);
          
        } catch (createError) {
          console.error(`      ❌ خطأ في إنشاء البروفايل: ${createError.message}`);
        }
      }
    }
    
    console.log(`\n📊 تم إنشاء ${createdProfiles} بروفايل مراسل جديد`);
    
    // 4. إنشاء مراجع بديلة في جدول مساعد (إذا احتجنا)
    console.log('\n🔗 إنشاء فهرس ربط المقالات بالمراسلين:');
    
    // هذا يحل مشكلة foreign key constraint
    const allReporters = await prisma.reporters.findMany({
      select: {
        id: true,
        user_id: true,
        full_name: true
      }
    });
    
    console.log('   📋 فهرس الربط:');
    for (const reporter of allReporters) {
      const userArticles = await prisma.articles.count({
        where: {
          author_id: reporter.user_id,
          status: 'published'
        }
      });
      
      if (userArticles > 0) {
        console.log(`      ${reporter.full_name}: ${userArticles} مقال (user_id: ${reporter.user_id} → reporter_id: ${reporter.id})`);
      }
    }
    
    // 5. تحديث إحصائيات جميع المراسلين
    console.log('\n📊 تحديث إحصائيات المراسلين:');
    
    for (const reporter of allReporters) {
      await updateReporterStats(reporter.id, reporter.user_id);
    }
    
    // 6. تقرير نهائي
    console.log('\n✅ تقرير الإصلاح النهائي:');
    
    const finalReporterCount = await prisma.reporters.count({
      where: { is_active: true }
    });
    
    const reportersWithArticles = await prisma.reporters.count({
      where: {
        is_active: true,
        total_articles: { gt: 0 }
      }
    });
    
    console.log(`   👥 إجمالي المراسلين النشطين: ${finalReporterCount}`);
    console.log(`   📰 مراسلين لديهم مقالات: ${reportersWithArticles}`);
    console.log(`   📊 المقالات المنشورة: ${totalArticles}`);
    
    console.log('\n🎯 كيفية الاستخدام في الواجهة:');
    console.log('   1. في صفحة تعديل المقال، سيتم عرض قائمة المراسلين من جدول reporters');
    console.log('   2. عند اختيار مراسل، سيتم حفظ reporter.id في author_id');
    console.log('   3. لعرض اسم المؤلف، استخدم العلاقة مع جدول reporters بدلاً من users');
    
    console.log('\n🔄 خطوات إضافية مطلوبة:');
    console.log('   • تحديث صفحة عرض المقال لاستخدام جدول reporters للمؤلف');
    console.log('   • تحديث API المقالات لإرجاع بيانات المراسل بدلاً من المستخدم');
    console.log('   • تحديث صفحة تعديل المقال لاستخدام API /api/reporters');
    
    console.log('\n🎉 تم إصلاح ربط المراسلين بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function updateReporterStats(reporterId, userId) {
  try {
    // حساب إحصائيات المقالات المرتبطة بـ user_id
    const articleStats = await prisma.articles.aggregate({
      where: {
        author_id: userId,
        status: 'published'
      },
      _count: { id: true },
      _sum: {
        views: true,
        likes: true,
        shares: true
      }
    });
    
    const totalArticles = articleStats._count.id || 0;
    const totalViews = articleStats._sum.views || 0;
    const totalLikes = articleStats._sum.likes || 0;
    const totalShares = articleStats._sum.shares || 0;
    
    // تحديث إحصائيات المراسل
    await prisma.reporters.update({
      where: { id: reporterId },
      data: {
        total_articles: totalArticles,
        total_views: totalViews,
        total_likes: totalLikes,
        total_shares: totalShares,
        updated_at: new Date()
      }
    });
    
    if (totalArticles > 0) {
      console.log(`      📊 محدث: ${totalArticles} مقال، ${totalViews} مشاهدة`);
    }
    
  } catch (error) {
    console.error(`❌ خطأ في تحديث إحصائيات المراسل ${reporterId}:`, error.message);
  }
}

fixReporterLinkingSafe();