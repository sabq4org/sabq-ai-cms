const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeFakeDataCorrect() {
  try {
    console.log('🚨 إزالة جميع البيانات الوهمية فوراً...\n');
    
    // 1. إزالة الصور الوهمية من جدول المراسلين
    console.log('👤 إزالة الصور الوهمية من المراسلين...');
    
    // البحث عن المراسلين بصور وهمية
    const allReporters = await prisma.reporters.findMany({
      select: {
        id: true,
        full_name: true,
        avatar_url: true
      }
    });
    
    const reportersWithFakeImages = allReporters.filter(reporter =>
      reporter.avatar_url && (
        reporter.avatar_url.includes('ui-avatars.com') ||
        reporter.avatar_url.includes('unsplash.com') ||
        reporter.avatar_url.includes('placeholder') ||
        reporter.avatar_url.includes('faker') ||
        reporter.avatar_url.includes('lorempixel')
      )
    );
    
    console.log(`   وجدت ${reportersWithFakeImages.length} مراسل بصور وهمية:`);
    
    for (const reporter of reportersWithFakeImages) {
      console.log(`   - ${reporter.full_name}: ${reporter.avatar_url}`);
      
      // إزالة الصورة الوهمية
      await prisma.reporters.update({
        where: { id: reporter.id },
        data: { avatar_url: null }
      });
      
      console.log(`     ✅ تم إزالة الصورة الوهمية لـ ${reporter.full_name}`);
    }
    
    // 2. إزالة الصور الوهمية من المقالات
    console.log('\n📰 إزالة الصور الوهمية من المقالات...');
    
    const allArticles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        featured_image: true
      }
    });
    
    const articlesWithFakeImages = allArticles.filter(article =>
      article.featured_image && (
        article.featured_image.includes('unsplash.com') ||
        article.featured_image.includes('placeholder') ||
        article.featured_image.includes('faker') ||
        article.featured_image.includes('lorempixel')
      )
    );
    
    console.log(`   وجدت ${articlesWithFakeImages.length} مقال بصور وهمية:`);
    
    for (const article of articlesWithFakeImages) {
      console.log(`   - ${article.title.substring(0, 50)}...`);
      
      // إزالة الصورة الوهمية
      await prisma.articles.update({
        where: { id: article.id },
        data: { featured_image: null }
      });
      
      console.log(`     ✅ تم إزالة الصورة الوهمية من المقال`);
    }
    
    // 3. فحص أعضاء الفريق
    console.log('\n👥 فحص أعضاء الفريق للبيانات الوهمية...');
    
    const allTeamMembers = await prisma.team_members.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true
      }
    });
    
    const teamMembersWithFakeData = allTeamMembers.filter(member =>
      (member.avatar && (
        member.avatar.includes('ui-avatars.com') ||
        member.avatar.includes('unsplash.com') ||
        member.avatar.includes('placeholder') ||
        member.avatar.includes('faker')
      )) ||
      (member.bio && (
        member.bio.includes('Lorem ipsum') ||
        member.bio.includes('placeholder') ||
        member.bio.includes('fake')
      ))
    );
    
    console.log(`   وجدت ${teamMembersWithFakeData.length} عضو فريق ببيانات وهمية:`);
    
    for (const member of teamMembersWithFakeData) {
      console.log(`   - ${member.name}`);
      
      const updateData = {};
      
      if (member.avatar && (
        member.avatar.includes('ui-avatars.com') ||
        member.avatar.includes('unsplash.com') ||
        member.avatar.includes('placeholder') ||
        member.avatar.includes('faker')
      )) {
        updateData.avatar = null;
        console.log(`     ✅ إزالة الصورة الوهمية`);
      }
      
      if (member.bio && (
        member.bio.includes('Lorem ipsum') ||
        member.bio.includes('placeholder') ||
        member.bio.includes('fake')
      )) {
        updateData.bio = null;
        console.log(`     ✅ إزالة النبذة الوهمية`);
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.team_members.update({
          where: { id: member.id },
          data: updateData
        });
      }
    }
    
    // 4. تقرير نهائي مع التحقق
    console.log('\n🔍 التحقق النهائي من التنظيف...');
    
    // التحقق من المراسلين
    const remainingFakeReporters = await prisma.reporters.findMany({
      select: { id: true, full_name: true, avatar_url: true }
    });
    
    const stillFakeReporters = remainingFakeReporters.filter(reporter =>
      reporter.avatar_url && (
        reporter.avatar_url.includes('ui-avatars.com') ||
        reporter.avatar_url.includes('unsplash.com') ||
        reporter.avatar_url.includes('placeholder')
      )
    );
    
    // التحقق من المقالات
    const remainingFakeArticles = await prisma.articles.findMany({
      select: { id: true, title: true, featured_image: true }
    });
    
    const stillFakeArticles = remainingFakeArticles.filter(article =>
      article.featured_image && (
        article.featured_image.includes('unsplash.com') ||
        article.featured_image.includes('placeholder')
      )
    );
    
    console.log('\n📊 تقرير التنظيف النهائي:');
    console.log(`   ✅ تم إزالة الصور الوهمية من ${reportersWithFakeImages.length} مراسل`);
    console.log(`   ✅ تم إزالة الصور الوهمية من ${articlesWithFakeImages.length} مقال`);
    console.log(`   ✅ تم تنظيف ${teamMembersWithFakeData.length} عضو فريق من البيانات الوهمية`);
    
    console.log('\n🎯 حالة النظام بعد التنظيف:');
    console.log(`   📊 مراسلين بصور وهمية متبقية: ${stillFakeReporters.length}`);
    console.log(`   📰 مقالات بصور وهمية متبقية: ${stillFakeArticles.length}`);
    
    if (stillFakeReporters.length === 0 && stillFakeArticles.length === 0) {
      console.log('\n🎉 تم تطهير النظام بالكامل من البيانات الوهمية!');
    } else {
      console.log('\n⚠️ لا تزال هناك بيانات وهمية تحتاج إلى إزالة يدوية');
    }
    
    console.log('\n✅ السياسة الجديدة مطبقة:');
    console.log('   - لا صور وهمية في النظام');
    console.log('   - البيانات الحقيقية فقط');
    console.log('   - إخفاء العناصر عند عدم توفر بيانات حقيقية');
    
  } catch (error) {
    console.error('❌ خطأ في إزالة البيانات الوهمية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeFakeDataCorrect();
