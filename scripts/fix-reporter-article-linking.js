const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixReporterArticleLinking() {
  try {
    console.log('🔧 إصلاح ربط المقالات بالمراسلين...\n');
    
    // 1. جلب جميع المقالات المنشورة مع author_id
    console.log('📰 جلب المقالات المنشورة:');
    const articles = await prisma.articles.findMany({
      where: { 
        status: 'published',
        author_id: { not: '' }
      },
      select: {
        id: true,
        title: true,
        author_id: true
      }
    });
    
    console.log(`   📊 وجدت ${articles.length} مقال منشور مع author_id`);
    
    // 2. جلب جميع المراسلين
    const reporters = await prisma.reporters.findMany({
      select: {
        id: true,
        user_id: true,
        full_name: true,
        slug: true
      }
    });
    
    console.log(`   👥 وجدت ${reporters.length} مراسل في جدول reporters`);
    
    // 3. جلب جميع المستخدمين
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    console.log(`   👤 وجدت ${users.length} مستخدم في جدول users`);
    
    // 4. تحليل الروابط الحالية
    console.log('\n🔍 تحليل الروابط الحالية:');
    
    const linkingStats = {
      alreadyLinkedToReporters: 0,
      needsReporterCreation: 0,
      invalidAuthorIds: 0,
      fixes: []
    };
    
    for (const article of articles) {
      // التحقق من وجود رابط مباشر مع مراسل
      const directReporterLink = reporters.find(r => r.id === article.author_id);
      
      if (directReporterLink) {
        linkingStats.alreadyLinkedToReporters++;
        continue;
      }
      
      // البحث عن المستخدم في جدول users
      const user = users.find(u => u.id === article.author_id);
      
      if (user) {
        // البحث عن مراسل مرتبط بهذا المستخدم
        const userReporter = reporters.find(r => r.user_id === user.id);
        
        if (userReporter) {
          // يوجد مراسل مرتبط، نحتاج تحديث author_id
          linkingStats.fixes.push({
            type: 'update_author_id',
            articleId: article.id,
            articleTitle: article.title,
            currentAuthorId: article.author_id,
            newAuthorId: userReporter.id,
            userName: user.name,
            reporterName: userReporter.full_name
          });
        } else {
          // المستخدم موجود لكن لا يوجد له بروفايل مراسل
          linkingStats.needsReporterCreation++;
          linkingStats.fixes.push({
            type: 'create_reporter',
            articleId: article.id,
            articleTitle: article.title,
            userId: user.id,
            userName: user.name,
            userEmail: user.email
          });
        }
      } else {
        linkingStats.invalidAuthorIds++;
        console.log(`   ⚠️ author_id غير صالح: ${article.author_id} للمقال "${article.title}"`);
      }
    }
    
    console.log('\n📊 تقرير التحليل:');
    console.log(`   ✅ مقالات مرتبطة صحيح بمراسلين: ${linkingStats.alreadyLinkedToReporters}`);
    console.log(`   🔧 مقالات تحتاج تحديث author_id: ${linkingStats.fixes.filter(f => f.type === 'update_author_id').length}`);
    console.log(`   👤 مقالات تحتاج إنشاء بروفايل مراسل: ${linkingStats.fixes.filter(f => f.type === 'create_reporter').length}`);
    console.log(`   ❌ مقالات بـ author_id غير صالح: ${linkingStats.invalidAuthorIds}`);
    
    // 5. تنفيذ الإصلاحات
    if (linkingStats.fixes.length > 0) {
      console.log('\n🔧 تنفيذ الإصلاحات:');
      
      let updatedArticles = 0;
      let createdReporters = 0;
      
      for (const fix of linkingStats.fixes) {
        if (fix.type === 'update_author_id') {
          console.log(`\n   🔄 تحديث المقال: "${fix.articleTitle.substring(0, 50)}..."`);
          console.log(`      من: ${fix.currentAuthorId} (${fix.userName})`);
          console.log(`      إلى: ${fix.newAuthorId} (${fix.reporterName})`);
          
          await prisma.articles.update({
            where: { id: fix.articleId },
            data: { author_id: fix.newAuthorId }
          });
          
          updatedArticles++;
          console.log(`      ✅ تم التحديث`);
          
        } else if (fix.type === 'create_reporter') {
          console.log(`\n   👤 إنشاء بروفايل مراسل: ${fix.userName}`);
          
          // إنشاء slug فريد
          const baseSlug = fix.userName
            .toLowerCase()
            .replace(/[أإآء]/g, 'ا')
            .replace(/[ة]/g, 'ه')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]/g, '');
          
          const slug = `${baseSlug}-${Date.now()}`;
          
          // إنشاء المراسل الجديد
          const newReporter = await prisma.reporters.create({
            data: {
              id: `reporter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              user_id: fix.userId,
              full_name: fix.userName,
              slug: slug,
              title: 'مراسل صحفي',
              bio: null,
              avatar_url: null, // لا صور وهمية
              specializations: [],
              coverage_areas: [],
              is_verified: false,
              verification_badge: null,
              is_active: true,
              total_articles: 0,
              total_views: 0,
              total_likes: 0,
              total_shares: 0,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          
          console.log(`      ✅ تم إنشاء البروفايل: ${newReporter.slug}`);
          
          // تحديث المقال ليرتبط بالمراسل الجديد
          await prisma.articles.update({
            where: { id: fix.articleId },
            data: { author_id: newReporter.id }
          });
          
          console.log(`      🔗 تم ربط المقال بالمراسل الجديد`);
          
          createdReporters++;
          updatedArticles++;
        }
      }
      
      console.log(`\n📈 نتائج الإصلاح:`);
      console.log(`   🆕 مراسلين جدد: ${createdReporters}`);
      console.log(`   🔄 مقالات محدثة: ${updatedArticles}`);
    }
    
    // 6. تحديث إحصائيات المراسلين
    console.log('\n📊 تحديث إحصائيات المراسلين:');
    
    const allReporters = await prisma.reporters.findMany({
      select: { id: true, full_name: true }
    });
    
    for (const reporter of allReporters) {
      // حساب عدد المقالات
      const articleCount = await prisma.articles.count({
        where: {
          author_id: reporter.id,
          status: 'published'
        }
      });
      
      // حساب إجمالي المشاهدات والإعجابات
      const articleStats = await prisma.articles.aggregate({
        where: {
          author_id: reporter.id,
          status: 'published'
        },
        _sum: {
          views: true,
          likes: true,
          shares: true
        }
      });
      
      const totalViews = articleStats._sum.views || 0;
      const totalLikes = articleStats._sum.likes || 0;
      const totalShares = articleStats._sum.shares || 0;
      
      // تحديث إحصائيات المراسل
      await prisma.reporters.update({
        where: { id: reporter.id },
        data: {
          total_articles: articleCount,
          total_views: totalViews,
          total_likes: totalLikes,
          total_shares: totalShares,
          updated_at: new Date()
        }
      });
      
      if (articleCount > 0) {
        console.log(`   📊 ${reporter.full_name}: ${articleCount} مقال، ${totalViews} مشاهدة`);
      }
    }
    
    // 7. تقرير نهائي
    console.log('\n✅ تقرير الإصلاح النهائي:');
    
    const finalArticleCount = await prisma.articles.count({
      where: { status: 'published' }
    });
    
    const finalLinkedArticles = await prisma.articles.count({
      where: { 
        status: 'published',
        author_id: { in: allReporters.map(r => r.id) }
      }
    });
    
    console.log(`   📰 إجمالي المقالات: ${finalArticleCount}`);
    console.log(`   🔗 مقالات مرتبطة بمراسلين: ${finalLinkedArticles}`);
    console.log(`   📊 نسبة الربط: ${Math.round(finalLinkedArticles / finalArticleCount * 100)}%`);
    
    console.log('\n🎉 تم إصلاح ربط المقالات بالمراسلين بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح الربط:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixReporterArticleLinking();