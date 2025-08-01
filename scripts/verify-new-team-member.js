const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyNewTeamMember() {
  console.log('🔍 التحقق من العضو الجديد في الفريق...\n');
  
  try {
    // جلب أحدث عضو مُضاف
    const latestMember = await prisma.team_members.findFirst({
      orderBy: { created_at: 'desc' }
    });
    
    if (!latestMember) {
      console.log('❌ لا يوجد أعضاء في الفريق');
      return;
    }
    
    console.log('👤 أحدث عضو مُضاف:');
    console.log(`   الاسم: ${latestMember.name}`);
    console.log(`   البريد: ${latestMember.email}`);
    console.log(`   الدور: ${latestMember.role}`);
    console.log(`   الحالة: ${latestMember.is_active ? 'نشط' : 'غير نشط'}`);
    console.log(`   تاريخ الإضافة: ${latestMember.created_at}`);
    console.log(`   المعرف: ${latestMember.id}`);
    
    // التحقق من إجمالي الأعضاء
    const totalMembers = await prisma.team_members.count();
    console.log(`\n📊 إجمالي أعضاء الفريق: ${totalMembers}`);
    
    // اختبار API
    console.log('\n🌐 اختبار API /api/team-members...');
    const response = await fetch('http://localhost:3002/api/team-members?t=' + Date.now(), {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API خطأ: ${response.status}`);
    }
    
    const apiData = await response.json();
    console.log(`📡 عدد الأعضاء من API: ${apiData.members?.length || 0}`);
    
    // البحث عن العضو الجديد في API
    const memberInApi = apiData.members?.find(m => m.id === latestMember.id);
    
    if (memberInApi) {
      console.log('✅ العضو الجديد يظهر في API بنجاح');
      console.log(`   اسم API: ${memberInApi.name}`);
      console.log(`   بريد API: ${memberInApi.email}`);
    } else {
      console.log('❌ العضو الجديد لا يظهر في API');
    }
    
    // عرض أحدث 3 أعضاء
    console.log('\n📋 أحدث 3 أعضاء في الفريق:');
    const recentMembers = await prisma.team_members.findMany({
      orderBy: { created_at: 'desc' },
      take: 3,
      select: { id: true, name: true, email: true, role: true, created_at: true }
    });
    
    recentMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.name} (${member.role}) - ${member.created_at.toLocaleDateString('ar-SA')}`);
    });
    
    console.log('\n💡 نصائح لحل مشكلة العرض:');
    console.log('1. اضغط F5 لتحديث الصفحة');
    console.log('2. امسح cache المتصفح (Ctrl+Shift+R)');
    console.log('3. استخدم زر التحديث في صفحة إدارة الفريق');
    console.log('4. تحقق من console المتصفح للأخطاء');
    
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyNewTeamMember();