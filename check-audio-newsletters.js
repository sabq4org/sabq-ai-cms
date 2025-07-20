const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function checkAudioNewsletters() {
  try {
    console.log('🔍 فحص النشرات الصوتية...');
    
    // جلب جميع النشرات الصوتية
    const newsletters = await prisma.audio_newsletters.findMany({
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    });
    
    console.log(`📊 عدد النشرات الموجودة: ${newsletters.length}`);
    
    if (newsletters.length > 0) {
      console.log('\n📝 النشرات الصوتية:');
      newsletters.forEach((newsletter, index) => {
        console.log(`${index + 1}. ID: ${newsletter.id}`);
        console.log(`   العنوان: ${newsletter.title || 'لا يوجد عنوان'}`);
        console.log(`   URL: ${newsletter.url || 'لا يوجد رابط'}`);
        console.log(`   منشورة: ${newsletter.is_published ? 'نعم' : 'لا'}`);
        console.log(`   مميزة: ${newsletter.is_featured ? 'نعم' : 'لا'}`);
        console.log(`   تاريخ الإنشاء: ${newsletter.created_at}`);
        console.log('   ---');
      });
      
      // البحث عن آخر نشرة منشورة
      const publishedNewsletters = newsletters.filter(n => n.is_published);
      console.log(`\n✅ النشرات المنشورة: ${publishedNewsletters.length}`);
      
      // البحث عن آخر نشرة مميزة
      const featuredNewsletters = newsletters.filter(n => n.is_published && n.is_featured);
      console.log(`⭐ النشرات المميزة المنشورة: ${featuredNewsletters.length}`);
      
    } else {
      console.log('❌ لا توجد نشرات صوتية في قاعدة البيانات');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص النشرات الصوتية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAudioNewsletters();
