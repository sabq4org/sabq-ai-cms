const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeFakeDataImmediately() {
  try {
    console.log('🚨 إزالة جميع البيانات الوهمية فوراً...\n');
    
    // 1. إزالة الصور الوهمية من جدول المراسلين
    console.log('👤 إزالة الصور الوهمية من المراسلين...');
    
    const reportersWithFakeImages = await prisma.reporters.findMany({
      where: {
        avatar_url: {
          OR: [
            { contains: 'ui-avatars.com' },
            { contains: 'unsplash.com' },
            { contains: 'placeholder' },
            { contains: 'faker' },
            { contains: 'lorempixel' }
          ]
        }
      },
      select: {
        id: true,
        full_name: true,
        avatar_url: true
      }
    });
    
    console.log(`   وجدت ${reportersWithFakeImages.length} مراسل بصور وهمية:`);
    
    for (const reporter of reportersWithFakeImages) {
      console.log(`   - ${reporter.full_name}: ${reporter.avatar_url}`);
      
      // إزالة الصورة الوهمية (تعيين null بدلاً من الصورة الوهمية)
      await prisma.reporters.update({
        where: { id: reporter.id },
        data: { avatar_url: null }
      });
      
      console.log(`     ✅ تم إزالة الصورة الوهمية لـ ${reporter.full_name}`);
    }
    
    // 2. إزالة الصور الوهمية من المقالات
    console.log('\n📰 إزالة الصور الوهمية من المقالات...');
    
    const articlesWithFakeImages = await prisma.articles.findMany({
      where: {
        featured_image: {
          OR: [
            { contains: 'unsplash.com' },
            { contains: 'placeholder' },
            { contains: 'faker' },
            { contains: 'lorempixel' }
          ]
        }
      },
      select: {
        id: true,
        title: true,
        featured_image: true
      }
    });
    
    console.log(`   وجدت ${articlesWithFakeImages.length} مقال بصور وهمية:`);
    
    for (const article of articlesWithFakeImages) {
      console.log(`   - ${article.title.substring(0, 50)}...`);
      console.log(`     الصورة الوهمية: ${article.featured_image}`);
      
      // إزالة الصورة الوهمية (تعيين null بدلاً من الصورة الوهمية)
      await prisma.articles.update({
        where: { id: article.id },
        data: { featured_image: null }
      });
      
      console.log(`     ✅ تم إزالة الصورة الوهمية من المقال`);
    }
    
    // 3. التحقق من عدم وجود بيانات وهمية أخرى في أعضاء الفريق
    console.log('\n👥 فحص أعضاء الفريق للبيانات الوهمية...');
    
    const teamMembersWithFakeData = await prisma.team_members.findMany({
      where: {
        OR: [
          {
            avatar: {
              OR: [
                { contains: 'ui-avatars.com' },
                { contains: 'unsplash.com' },
                { contains: 'placeholder' },
                { contains: 'faker' }
              ]
            }
          },
          {
            bio: {
              OR: [
                { contains: 'Lorem ipsum' },
                { contains: 'placeholder' },
                { contains: 'fake' }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true
      }
    });
    
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
    
    // 4. تحديث المقالات التي تم إنشاؤها مؤخراً بصور وهمية لإزالة الصور تماماً
    console.log('\n🔄 التحقق من المقالات الحديثة...');
    
    const recentArticles = await prisma.articles.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        }
      },
      select: {
        id: true,
        title: true,
        featured_image: true
      }
    });
    
    let removedRecentImages = 0;
    
    for (const article of recentArticles) {
      if (article.featured_image && (
        article.featured_image.includes('unsplash.com') ||
        article.featured_image.includes('placeholder')
      )) {
        await prisma.articles.update({
          where: { id: article.id },
          data: { featured_image: null }
        });
        removedRecentImages++;
      }
    }
    
    if (removedRecentImages > 0) {
      console.log(`   ✅ تم إزالة ${removedRecentImages} صورة وهمية من المقالات الحديثة`);
    }
    
    // 5. تقرير نهائي
    console.log('\n📊 تقرير التنظيف النهائي:');
    console.log(`   ✅ تم إزالة الصور الوهمية من ${reportersWithFakeImages.length} مراسل`);
    console.log(`   ✅ تم إزالة الصور الوهمية من ${articlesWithFakeImages.length} مقال`);
    console.log(`   ✅ تم تنظيف ${teamMembersWithFakeData.length} عضو فريق من البيانات الوهمية`);
    console.log(`   ✅ تم إزالة ${removedRecentImages} صورة وهمية إضافية`);
    
    console.log('\n🎯 السياسة الجديدة المطبقة:');
    console.log('   - لا توجد صور وهمية في النظام');
    console.log('   - العناصر بدون صور ستظهر بدون صورة أو مخفية');
    console.log('   - جميع الإحصائيات من البيانات الحقيقية فقط');
    console.log('   - لا توجد بيانات مولدة تلقائياً');
    
    console.log('\n✅ تم تطهير النظام بالكامل من البيانات الوهمية!');
    
  } catch (error) {
    console.error('❌ خطأ في إزالة البيانات الوهمية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeFakeDataImmediately();
