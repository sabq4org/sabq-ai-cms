const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function fixNewsletterUrl() {
  try {
    console.log('🔧 إصلاح رابط النشرة الصوتية...');
    
    // العثور على النشرة التي لا تحتوي على URL
    const newsletter = await prisma.audio_newsletters.findFirst({
      where: {
        id: '6782b7a9-fcd8-4905-8a0b-3f5cbc69034f'
      }
    });
    
    if (newsletter) {
      console.log('📄 النشرة الحالية:', {
        id: newsletter.id,
        title: newsletter.title,
        url: newsletter.url,
        audioUrl: newsletter.audioUrl
      });
      
      // إذا كان audioUrl موجود ولكن url غير موجود، نقوم بنسخه
      if (newsletter.audioUrl && !newsletter.url) {
        const updatedNewsletter = await prisma.audio_newsletters.update({
          where: {
            id: newsletter.id
          },
          data: {
            url: newsletter.audioUrl
          }
        });
        
        console.log('✅ تم تحديث النشرة بنجاح');
        console.log('🔗 الرابط الجديد:', updatedNewsletter.url);
      } else {
        console.log('ℹ️ النشرة تحتوي على رابط بالفعل أو لا يوجد audioUrl');
      }
    } else {
      console.log('❌ لم يتم العثور على النشرة');
    }
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح رابط النشرة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixNewsletterUrl();
