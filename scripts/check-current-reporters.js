const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReporters() {
  try {
    console.log('🔍 فحص المراسلين الحاليين...\n');
    
    // جلب المراسلين من team_members
    const teamReporters = await prisma.team_members.findMany({
      where: { role: 'reporter' },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        is_active: true,
        created_at: true
      }
    });
    
    console.log(`📊 عدد المراسلين في team_members: ${teamReporters.length}\n`);
    
    if (teamReporters.length > 0) {
      console.log('📋 قائمة المراسلين:');
      teamReporters.forEach((reporter, index) => {
        console.log(`${index + 1}. ${reporter.name}`);
        console.log(`   Email: ${reporter.email}`);
        console.log(`   ID: ${reporter.id}`);
        console.log(`   نشط: ${reporter.is_active ? 'نعم' : 'لا'}`);
        console.log(`   Bio: ${reporter.bio || 'غير محدد'}`);
        console.log('');
      });
    }
    
    // فحص جدول reporters المنفصل
    const separateReporters = await prisma.reporters.findMany({
      select: {
        id: true,
        full_name: true,
        slug: true,
        is_active: true
      }
    });
    
    console.log(`📊 عدد البروفايلات في جدول reporters: ${separateReporters.length}\n`);
    
    if (separateReporters.length > 0) {
      console.log('📋 بروفايلات المراسلين الموجودة:');
      separateReporters.forEach((reporter, index) => {
        console.log(`${index + 1}. ${reporter.full_name} (${reporter.slug})`);
        console.log(`   نشط: ${reporter.is_active ? 'نعم' : 'لا'}`);
        console.log('');
      });
    }
    
    console.log('💡 التوصية:');
    if (teamReporters.length > 0 && separateReporters.length === 0) {
      console.log('- ننشئ بروفايلات للمراسلين الموجودين في team_members');
      console.log('- نربط أسماءهم بصفحاتهم الشخصية');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkReporters();
