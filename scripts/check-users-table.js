const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsersTable() {
  console.log('🔍 فحص جدول المستخدمين...\n');
  
  try {
    const users = await prisma.users.findMany({
      select: { id: true, email: true, name: true, role: true },
      take: 10
    });
    
    console.log(`👤 عدد المستخدمين: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name || user.email} (${user.id}) - ${user.role || 'No role'}`);
    });
    
    console.log('\n🔍 البحث عن team-7 في المستخدمين...');
    const team7User = await prisma.users.findUnique({
      where: { id: 'team-7' }
    });
    
    if (team7User) {
      console.log('✅ team-7 موجود في جدول users:', team7User);
    } else {
      console.log('❌ team-7 غير موجود في جدول users');
    }
    
    // فحص أول مستخدم متاح لاستخدامه في الاختبار
    if (users.length > 0) {
      console.log('\n💡 استخدم هذا المعرف للاختبار:', users[0].id);
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص المستخدمين:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsersTable();