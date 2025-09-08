const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAuthors() {
  try {
    console.log('🔍 البحث عن مؤلفين متاحين...');
    
    const authors = await prisma.article_authors.findMany({
      where: { is_active: true },
      select: {
        id: true,
        full_name: true,
        email: true
      },
      take: 5
    });
    
    console.log(`📝 تم العثور على ${authors.length} مؤلف نشط:`);
    authors.forEach((author, index) => {
      console.log(`${index + 1}. ${author.full_name} (${author.id})`);
    });
    
    if (authors.length > 0) {
      return authors[0].id;
    }
    
    // إذا لم نجد مؤلفين، ابحث في جدول users
    console.log('\n🔍 البحث في جدول المستخدمين...');
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 5
    });
    
    console.log(`👤 تم العثور على ${users.length} مستخدم:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.id})`);
    });
    
    return users.length > 0 ? users[0].id : null;
    
  } catch (error) {
    console.error('❌ خطأ في البحث عن المؤلفين:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

findAuthors().then(authorId => {
  if (authorId) {
    console.log(`\n✅ يمكن استخدام المؤلف: ${authorId}`);
  } else {
    console.log('\n❌ لم يتم العثور على مؤلفين');
  }
});
