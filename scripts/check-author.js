const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAuthor() {
  try {
    console.log('🔍 فحص المؤلف author_1754125848205_lmmpexfx4...\n');
    
    // البحث عن المؤلف المحدد
    const targetAuthor = await prisma.article_authors.findUnique({
      where: { id: 'author_1754125848205_lmmpexfx4' }
    });
    
    if (targetAuthor) {
      console.log('✅ المؤلف موجود:');
      console.log(`   الاسم: ${targetAuthor.full_name}`);
      console.log(`   البريد: ${targetAuthor.email}`);
      console.log(`   نشط: ${targetAuthor.is_active}`);
    } else {
      console.log('❌ المؤلف غير موجود!');
    }
    
    // عرض جميع المؤلفين النشطين
    const allAuthors = await prisma.article_authors.findMany({
      where: { is_active: true },
      select: {
        id: true,
        full_name: true,
        email: true,
        is_active: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`\n📋 جميع المؤلفين النشطين (${allAuthors.length}):`);
    allAuthors.forEach((author, index) => {
      console.log(`${index + 1}. ${author.full_name} (${author.id})`);
      if (author.email) console.log(`   📧 ${author.email}`);
    });
    
    // البحث عن أي مؤلف يبدأ بـ author_1754125848205
    const similarAuthors = await prisma.article_authors.findMany({
      where: {
        id: {
          startsWith: 'author_1754125848205'
        }
      }
    });
    
    if (similarAuthors.length > 0) {
      console.log(`\n🔍 مؤلفين مشابهين (${similarAuthors.length}):`);
      similarAuthors.forEach(author => {
        console.log(`   - ${author.full_name} (${author.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص المؤلف:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuthor();
