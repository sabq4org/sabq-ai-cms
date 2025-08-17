const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUsers() {
  try {
    const users = await prisma.users.findMany({
      select: { id: true, name: true, email: true },
      take: 10
    });
    
    console.log('المستخدمون المتاحون:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || user.email} (${user.id})`);
    });
    
    if (users.length > 0) {
      console.log(`\n🎯 سيتم استخدام أول مستخدم: ${users[0].id}`);
      return users[0].id;
    } else {
      console.log('❌ لا يوجد مستخدمون في قاعدة البيانات');
      
      // إنشاء مستخدم تجريبي
      const testUser = await prisma.users.create({
        data: {
          id: `user_${Date.now()}`,
          name: 'مستخدم تجريبي',
          email: 'test@example.com',
          role: 'user',
          created_at: new Date()
        }
      });
      
      console.log(`✅ تم إنشاء مستخدم تجريبي: ${testUser.id}`);
      return testUser.id;
    }
  } catch (error) {
    console.error('خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findUsers();
