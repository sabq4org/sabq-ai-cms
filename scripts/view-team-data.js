const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function viewTeamData() {
  try {
    console.log('📊 عرض بيانات أعضاء الفريق الحاليين...\n');
    
    const teamMembers = await prisma.$queryRaw`
      SELECT id, name, role, department, email, is_active
      FROM team_members
      ORDER BY display_order, created_at DESC
    `;
    
    console.log(`إجمالي الأعضاء: ${teamMembers.length}\n`);
    
    teamMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name}`);
      console.log(`   الدور: ${member.role}`);
      console.log(`   القسم: ${member.department || 'غير محدد'}`);
      console.log(`   البريد: ${member.email || 'غير محدد'}`);
      console.log(`   الحالة: ${member.is_active ? 'نشط ✅' : 'معطل ❌'}`);
      console.log('');
    });
    
    // التحقق من المستخدمين الإداريين في جدول users
    console.log('\n📊 المستخدمون الإداريون في جدول users:');
    
    const adminUsers = await prisma.users.findMany({
      where: {
        role: {
          in: ['admin', 'editor', 'content-manager', 'moderator', 'كاتب']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true
      }
    });
    
    console.log(`\nإجمالي المستخدمين الإداريين: ${adminUsers.length}\n`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || user.email}`);
      console.log(`   البريد: ${user.email}`);
      console.log(`   الدور: ${user.role}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewTeamData();