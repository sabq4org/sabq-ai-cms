/**
 * سكريبت إصلاح النشرة الصوتية للصفحة الرئيسية
 * يصلح مشكلة عدم ظهور النشرة في الصفحة الرئيسية
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAudioNewsletterMainPage() {
  console.log('🔧 بدء إصلاح النشرة الصوتية للصفحة الرئيسية...\n');
  
  try {
    // 1. فحص الوضع الحالي
    console.log('🔍 فحص الوضع الحالي...');
    
    const allNewsletters = await prisma.audio_newsletters.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    if (allNewsletters.length === 0) {
      console.log('❌ لا توجد نشرات في قاعدة البيانات');
      return;
    }
    
    console.log(`📊 توجد ${allNewsletters.length} نشرة في قاعدة البيانات`);
    
    // 2. فحص النشرات المنشورة
    const publishedNewsletters = await prisma.audio_newsletters.findMany({
      where: { is_published: true },
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`📢 توجد ${publishedNewsletters.length} نشرة منشورة`);
    
    // 3. فحص النشرات في الصفحة الرئيسية
    const mainPageNewsletters = await prisma.audio_newsletters.findMany({
      where: { is_main_page: true }
    });
    
    console.log(`🏠 توجد ${mainPageNewsletters.length} نشرة مفعلة للصفحة الرئيسية`);
    
    // 4. التحقق من وجود نشرة صالحة للعرض
    const validMainNewsletter = await prisma.audio_newsletters.findFirst({
      where: {
        is_main_page: true,
        is_published: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    if (validMainNewsletter) {
      console.log('✅ توجد نشرة صالحة للعرض في الصفحة الرئيسية:');
      console.log(`   ID: ${validMainNewsletter.id}`);
      console.log(`   العنوان: ${validMainNewsletter.title || 'بدون عنوان'}`);
      console.log('🎉 لا حاجة لإصلاح - النشرة يجب أن تظهر');
      return;
    }
    
    console.log('\n🔧 بدء عملية الإصلاح...');
    
    // 5. إصلاح المشكلة
    
    // أ) إذا كان هناك نشرات مفعلة للصفحة الرئيسية لكن غير منشورة
    if (mainPageNewsletters.length > 0) {
      console.log('📝 إصلاح النشرات المفعلة للصفحة الرئيسية (تفعيل النشر)...');
      
      for (const newsletter of mainPageNewsletters) {
        await prisma.audio_newsletters.update({
          where: { id: newsletter.id },
          data: { is_published: true }
        });
        
        console.log(`✅ تم تفعيل النشر للنشرة: ${newsletter.id}`);
      }
      
      console.log('✅ تم إصلاح النشرات المفعلة');
      return;
    }
    
    // ب) إذا كان هناك نشرات منشورة لكن لا توجد نشرة مفعلة للصفحة الرئيسية
    if (publishedNewsletters.length > 0) {
      console.log('📝 تفعيل أحدث نشرة منشورة للصفحة الرئيسية...');
      
      // إلغاء تفعيل جميع النشرات الأخرى
      await prisma.audio_newsletters.updateMany({
        where: { is_main_page: true },
        data: { is_main_page: false }
      });
      
      // تفعيل أحدث نشرة منشورة
      const latestPublished = publishedNewsletters[0];
      await prisma.audio_newsletters.update({
        where: { id: latestPublished.id },
        data: { is_main_page: true }
      });
      
      console.log(`✅ تم تفعيل النشرة للصفحة الرئيسية: ${latestPublished.id}`);
      console.log(`   العنوان: ${latestPublished.title || 'بدون عنوان'}`);
      return;
    }
    
    // ج) إذا لم توجد نشرات منشورة، فعّل أحدث نشرة
    if (allNewsletters.length > 0) {
      console.log('📝 تفعيل أحدث نشرة للنشر والصفحة الرئيسية...');
      
      // إلغاء تفعيل جميع النشرات الأخرى
      await prisma.audio_newsletters.updateMany({
        where: { is_main_page: true },
        data: { is_main_page: false }
      });
      
      // تفعيل أحدث نشرة
      const latestNewsletter = allNewsletters[0];
      await prisma.audio_newsletters.update({
        where: { id: latestNewsletter.id },
        data: { 
          is_published: true,
          is_main_page: true 
        }
      });
      
      console.log(`✅ تم تفعيل النشرة: ${latestNewsletter.id}`);
      console.log(`   العنوان: ${latestNewsletter.title || 'بدون عنوان'}`);
      console.log('   للنشر والصفحة الرئيسية');
      return;
    }
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح النشرة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// إضافة أوبشن لتفعيل نشرة محددة
async function activateSpecificNewsletter(newsletterId) {
  console.log(`🎯 تفعيل النشرة المحددة: ${newsletterId}...\n`);
  
  try {
    // التحقق من وجود النشرة
    const newsletter = await prisma.audio_newsletters.findUnique({
      where: { id: newsletterId }
    });
    
    if (!newsletter) {
      console.log(`❌ النشرة غير موجودة: ${newsletterId}`);
      return;
    }
    
    console.log(`📝 تفعيل النشرة: ${newsletter.title || newsletterId}`);
    
    // إلغاء تفعيل جميع النشرات الأخرى
    await prisma.audio_newsletters.updateMany({
      where: { is_main_page: true },
      data: { is_main_page: false }
    });
    
    // تفعيل النشرة المطلوبة
    await prisma.audio_newsletters.update({
      where: { id: newsletterId },
      data: { 
        is_published: true,
        is_main_page: true 
      }
    });
    
    console.log('✅ تم تفعيل النشرة بنجاح للصفحة الرئيسية');
    
  } catch (error) {
    console.error('❌ خطأ في تفعيل النشرة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
const newsletterId = process.argv[2];

if (newsletterId) {
  console.log(`🎯 تفعيل نشرة محددة: ${newsletterId}`);
  activateSpecificNewsletter(newsletterId).catch(console.error);
} else {
  console.log('🔧 إصلاح تلقائي للنشرة الصوتية');
  fixAudioNewsletterMainPage().catch(console.error);
}

console.log('\n💡 لتفعيل نشرة محددة، استخدم:');
console.log('node scripts/fix-audio-newsletter-main-page.js [newsletter-id]');