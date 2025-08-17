/**
 * سكريبت تشخيص النشرات الصوتية
 * يفحص حالة النشرات في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAudioNewsletters() {
  console.log('🎙️ بدء تشخيص النشرات الصوتية...\n');
  
  try {
    // 1. فحص جميع النشرات
    console.log('📊 جميع النشرات الصوتية:');
    console.log('═'.repeat(60));
    
    const allNewsletters = await prisma.audio_newsletters.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    if (allNewsletters.length === 0) {
      console.log('❌ لا توجد نشرات في قاعدة البيانات');
      return;
    }
    
    allNewsletters.forEach((newsletter, index) => {
      console.log(`${index + 1}. ID: ${newsletter.id}`);
      console.log(`   العنوان: ${newsletter.title || 'بدون عنوان'}`);
      console.log(`   منشورة: ${newsletter.is_published ? '✅' : '❌'}`);
      console.log(`   صفحة رئيسية: ${newsletter.is_main_page ? '✅' : '❌'}`);
      console.log(`   تاريخ الإنشاء: ${newsletter.created_at}`);
      console.log(`   عدد التشغيل: ${newsletter.play_count}`);
      console.log('   ' + '-'.repeat(40));
    });
    
    // 2. فحص النشرات المنشورة
    console.log('\n📢 النشرات المنشورة:');
    console.log('═'.repeat(60));
    
    const publishedNewsletters = await prisma.audio_newsletters.findMany({
      where: { is_published: true },
      orderBy: { created_at: 'desc' }
    });
    
    if (publishedNewsletters.length === 0) {
      console.log('❌ لا توجد نشرات منشورة');
    } else {
      console.log(`✅ توجد ${publishedNewsletters.length} نشرة منشورة`);
      publishedNewsletters.forEach((newsletter, index) => {
        console.log(`${index + 1}. ${newsletter.title || newsletter.id} - صفحة رئيسية: ${newsletter.is_main_page ? '✅' : '❌'}`);
      });
    }
    
    // 3. فحص النشرات في الصفحة الرئيسية
    console.log('\n🏠 النشرات في الصفحة الرئيسية:');
    console.log('═'.repeat(60));
    
    const mainPageNewsletters = await prisma.audio_newsletters.findMany({
      where: { is_main_page: true },
      orderBy: { created_at: 'desc' }
    });
    
    if (mainPageNewsletters.length === 0) {
      console.log('❌ لا توجد نشرات مفعلة للصفحة الرئيسية');
    } else {
      console.log(`⚠️ توجد ${mainPageNewsletters.length} نشرة مفعلة للصفحة الرئيسية:`);
      mainPageNewsletters.forEach((newsletter, index) => {
        console.log(`${index + 1}. ID: ${newsletter.id}`);
        console.log(`   العنوان: ${newsletter.title || 'بدون عنوان'}`);
        console.log(`   منشورة: ${newsletter.is_published ? '✅' : '❌'}`);
        console.log(`   تاريخ الإنشاء: ${newsletter.created_at}`);
      });
    }
    
    // 4. فحص النشرة المفترض أن تظهر في الصفحة الرئيسية
    console.log('\n🎯 النشرة المفترض أن تظهر في الصفحة الرئيسية:');
    console.log('═'.repeat(60));
    
    const currentMainNewsletter = await prisma.audio_newsletters.findFirst({
      where: {
        is_main_page: true,
        is_published: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    if (!currentMainNewsletter) {
      console.log('❌ لا توجد نشرة صالحة للعرض في الصفحة الرئيسية');
      console.log('💡 السبب: النشرة يجب أن تكون منشورة (is_published: true) ومفعلة للصفحة الرئيسية (is_main_page: true)');
    } else {
      console.log('✅ النشرة التي ستظهر في الصفحة الرئيسية:');
      console.log(`   ID: ${currentMainNewsletter.id}`);
      console.log(`   العنوان: ${currentMainNewsletter.title || 'بدون عنوان'}`);
      console.log(`   URL الصوت: ${currentMainNewsletter.audio_url ? '✅' : '❌'}`);
      console.log(`   المدة: ${currentMainNewsletter.duration} ثانية`);
      console.log(`   تاريخ الإنشاء: ${currentMainNewsletter.created_at}`);
      console.log(`   عدد التشغيل: ${currentMainNewsletter.play_count}`);
    }
    
    // 5. إحصائيات
    console.log('\n📈 إحصائيات:');
    console.log('═'.repeat(60));
    console.log(`إجمالي النشرات: ${allNewsletters.length}`);
    console.log(`النشرات المنشورة: ${publishedNewsletters.length}`);
    console.log(`النشرات في الصفحة الرئيسية: ${mainPageNewsletters.length}`);
    console.log(`النشرة الحالية للصفحة الرئيسية: ${currentMainNewsletter ? '✅' : '❌'}`);
    
    // 6. اقتراحات للإصلاح
    console.log('\n🔧 اقتراحات للإصلاح:');
    console.log('═'.repeat(60));
    
    if (allNewsletters.length === 0) {
      console.log('1. ❌ لا توجد نشرات - أنشئ نشرة جديدة من Dashboard');
    } else if (publishedNewsletters.length === 0) {
      console.log('1. ❌ لا توجد نشرات منشورة - فعّل نشر النشرات');
    } else if (mainPageNewsletters.length === 0) {
      console.log('1. ❌ لا توجد نشرة مفعلة للصفحة الرئيسية - فعّل نشرة للصفحة الرئيسية');
    } else if (mainPageNewsletters.length > 1) {
      console.log('1. ⚠️ يوجد أكثر من نشرة مفعلة للصفحة الرئيسية - يجب تفعيل واحدة فقط');
    } else if (!currentMainNewsletter) {
      console.log('1. ❌ النشرة المفعلة غير منشورة - تأكد من is_published = true');
    } else {
      console.log('1. ✅ كل شيء يبدو صحيح - النشرة يجب أن تظهر في الصفحة الرئيسية');
      console.log('2. 💡 إذا لم تظهر، جرب مسح الكاش أو إعادة تحميل الصفحة');
    }
    
  } catch (error) {
    console.error('❌ خطأ في تشخيص النشرات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التشخيص
debugAudioNewsletters().catch(console.error);