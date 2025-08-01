const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupRecentTeamMembers() {
  console.log('🧹 حذف أعضاء الفريق المُضافين للتجربة...\n');
  
  try {
    // حذف الأعضاء المُضافين في آخر 24 ساعة
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentMembers = await prisma.team_members.findMany({
      where: {
        created_at: {
          gte: oneDayAgo
        }
      },
      select: { id: true, name: true, email: true, created_at: true }
    });
    
    console.log(`👥 وُجد ${recentMembers.length} عضو مُضاف في آخر 24 ساعة:`);
    recentMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (${member.email}) - ${member.id}`);
      console.log(`      تاريخ الإضافة: ${member.created_at}`);
    });
    
    if (recentMembers.length > 0) {
      // تأكيد من المستخدم (محاكاة)
      console.log('\n⚠️  سيتم حذف هؤلاء الأعضاء...');
      
      const memberIds = recentMembers.map(member => member.id);
      
      const deletedMembers = await prisma.team_members.deleteMany({
        where: {
          id: { in: memberIds }
        }
      });
      
      console.log(`✅ تم حذف ${deletedMembers.count} عضو فريق`);
    } else {
      console.log('✅ لا يوجد أعضاء حديثين للحذف');
    }
    
    // إحصائيات نهائية
    const remainingCount = await prisma.team_members.count();
    console.log(`\n📊 العدد المتبقي من أعضاء الفريق: ${remainingCount}`);
    
  } catch (error) {
    console.error('❌ خطأ في حذف أعضاء الفريق:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupRecentTeamMembers();