const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function compareReporters() {
  try {
    // فحص جدول reporters
    const reportersCount = await prisma.reporters.count();
    console.log('📊 عدد المراسلين في جدول reporters:', reportersCount);
    
    if (reportersCount > 0) {
      const reporters = await prisma.reporters.findMany({
        select: { id: true, full_name: true, user_id: true, is_active: true }
      });
      console.log('🔍 مراسلو جدول reporters:');
      reporters.forEach(r => console.log(`  - ${r.full_name} (${r.user_id})`));
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // فحص جدول team_members
    const teamReportersCount = await prisma.team_members.count({
      where: { role: 'reporter' }
    });
    console.log('📊 عدد المراسلين في جدول team_members:', teamReportersCount);
    
    if (teamReportersCount > 0) {
      const teamReporters = await prisma.team_members.findMany({
        where: { role: 'reporter' },
        select: { id: true, name: true, email: true, is_active: true }
      });
      console.log('🔍 مراسلو جدول team_members:');
      teamReporters.forEach(t => console.log(`  - ${t.name} (${t.email})`));
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('💡 التوصية: يبدو أن جدول reporters منفصل عن team_members');
    console.log('🗑️  يمكن حذف جدول reporters إذا كان تجريبي فقط');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

compareReporters();
