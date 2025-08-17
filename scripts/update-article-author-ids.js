const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateArticleAuthorIds() {
  try {
    console.log('🔄 تحديث author_id في المقالات للربط بالمراسلين الصحيحين...\n');
    
    // 1. جلب جميع المقالات المنشورة
    const articles = await prisma.articles.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        author_id: true
      }
    });
    
    console.log(`📰 وجدت ${articles.length} مقال منشور للفحص`);
    
    // 2. جلب جميع المراسلين
    const reporters = await prisma.reporters.findMany({
      select: {
        id: true,
        user_id: true,
        full_name: true
      }
    });
    
    console.log(`👥 وجدت ${reporters.length} مراسل في قاعدة البيانات`);
    
    // 3. معالجة كل مقال
    let updatedCount = 0;
    let alreadyCorrect = 0;
    let noReporter = 0;
    
    console.log('\n🔍 فحص وتحديث المقالات:');
    
    for (const article of articles) {
      // التحقق إذا كان author_id يشير لمراسل مباشرة
      const directReporter = reporters.find(r => r.id === article.author_id);
      
      if (directReporter) {
        console.log(`   ✅ "${article.title.substring(0, 40)}..." - مرتبط صحيح`);
        alreadyCorrect++;
        continue;
      }
      
      // البحث عن مراسل بـ user_id
      const userReporter = reporters.find(r => r.user_id === article.author_id);
      
      if (userReporter) {
        console.log(`   🔄 "${article.title.substring(0, 40)}..."`);
        console.log(`      من: ${article.author_id} (user_id)`);
        console.log(`      إلى: ${userReporter.id} (${userReporter.full_name})`);
        
        try {
          await prisma.articles.update({
            where: { id: article.id },
            data: { author_id: userReporter.id }
          });
          
          console.log(`      ✅ تم التحديث`);
          updatedCount++;
          
        } catch (updateError) {
          console.log(`      ❌ فشل التحديث: ${updateError.message}`);
        }
        
      } else {
        console.log(`   ⚠️ "${article.title.substring(0, 40)}..." - لا يوجد مراسل مطابق`);
        console.log(`      author_id: ${article.author_id}`);
        noReporter++;
      }
    }
    
    // 4. تحديث إحصائيات المراسلين بعد التغيير
    console.log('\n📊 تحديث إحصائيات المراسلين:');
    
    for (const reporter of reporters) {
      // حساب المقالات الجديدة المرتبطة بهذا المراسل
      const articleStats = await prisma.articles.aggregate({
        where: {
          author_id: reporter.id,
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
      
      // تحديث الإحصائيات
      await prisma.reporters.update({
        where: { id: reporter.id },
        data: {
          total_articles: totalArticles,
          total_views: totalViews,
          total_likes: totalLikes,
          total_shares: totalShares,
          updated_at: new Date()
        }
      });
      
      if (totalArticles > 0) {
        console.log(`   📈 ${reporter.full_name}: ${totalArticles} مقال، ${totalViews} مشاهدة`);
      }
    }
    
    // 5. التحقق النهائي
    console.log('\n🔍 التحقق النهائي من الربط:');
    
    const finalCheck = await prisma.articles.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        author_id: true
      },
      take: 5,
      orderBy: { created_at: 'desc' }
    });
    
    let finalCorrect = 0;
    let finalIncorrect = 0;
    
    for (const article of finalCheck) {
      const reporter = reporters.find(r => r.id === article.author_id);
      
      if (reporter) {
        console.log(`   ✅ "${article.title.substring(0, 40)}..." → ${reporter.full_name}`);
        finalCorrect++;
      } else {
        console.log(`   ❌ "${article.title.substring(0, 40)}..." → غير مرتبط`);
        finalIncorrect++;
      }
    }
    
    // 6. تقرير النتائج
    console.log('\n📊 تقرير التحديث النهائي:');
    console.log(`   🔄 مقالات محدثة: ${updatedCount}`);
    console.log(`   ✅ مقالات كانت صحيحة: ${alreadyCorrect}`);
    console.log(`   ⚠️ مقالات بدون مراسل: ${noReporter}`);
    console.log(`   📈 نسبة النجاح: ${Math.round((updatedCount + alreadyCorrect) / articles.length * 100)}%`);
    
    if (finalCorrect === 5 && finalIncorrect === 0) {
      console.log('\n🎉 تم إصلاح جميع الروابط بنجاح!');
      console.log('✅ حقل المراسل الآن يعمل بشكل مثالي');
    } else if (finalIncorrect > 0) {
      console.log(`\n⚠️ لا تزال هناك ${finalIncorrect} مقالات تحتاج إصلاح يدوي`);
    }
    
    console.log('\n🔧 خطوات ما بعد الإصلاح:');
    console.log('   1. اختبار صفحة تعديل المقال - يجب أن تظهر قائمة المراسلين');
    console.log('   2. اختبار حفظ مقال جديد مع مراسل محدد');
    console.log('   3. التحقق من عرض اسم المراسل في صفحة المقال');
    console.log('   4. اختبار رابط بروفايل المراسل');
    
  } catch (error) {
    console.error('❌ خطأ في تحديث author_id:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateArticleAuthorIds();