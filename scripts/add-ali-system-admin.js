const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAliSystemAdmin() {
  console.log('👤 إضافة علي الحازمي كمدير نظام...\n');
  
  try {
    // التحقق من وجوده أولاً
    const existingMember = await prisma.team_members.findFirst({
      where: { email: 'aalhazmi@sabq.org' }
    });
    
    if (existingMember) {
      console.log('⚠️ علي الحازمي موجود بالفعل:', existingMember.name);
      console.log('🔄 تحديث بياناته...');
      
      const updatedMember = await prisma.team_members.update({
        where: { id: existingMember.id },
        data: {
          name: 'علي الحازمي',
          role: 'system_admin',
          bio: 'مدير النظام - كافة الصلاحيات',
          is_active: true,
          display_order: 1, // أعلى أولوية
          updated_at: new Date()
        }
      });
      
      console.log('✅ تم تحديث بيانات علي الحازمي');
      console.log(`   الاسم: ${updatedMember.name}`);
      console.log(`   الدور: ${updatedMember.role}`);
      console.log(`   النبذة: ${updatedMember.bio}`);
      
    } else {
      // إضافة جديدة
      const newMember = await prisma.team_members.create({
        data: {
          id: `team_${Date.now()}_ali_admin`,
          name: 'علي الحازمي',
          email: 'aalhazmi@sabq.org',
          role: 'system_admin',
          bio: 'مدير النظام - كافة الصلاحيات',
          is_active: true,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      console.log('✅ تم إضافة علي الحازمي بنجاح');
      console.log(`   المعرف: ${newMember.id}`);
      console.log(`   الاسم: ${newMember.name}`);
      console.log(`   البريد: ${newMember.email}`);
      console.log(`   الدور: ${newMember.role}`);
      console.log(`   النبذة: ${newMember.bio}`);
    }
    
    // إنشاء user مقابل في جدول users أيضاً
    const existingUser = await prisma.users.findFirst({
      where: { email: 'aalhazmi@sabq.org' }
    });
    
    if (!existingUser) {
      const newUser = await prisma.users.create({
        data: {
          id: `user-system-admin-${Date.now()}`,
          email: 'aalhazmi@sabq.org',
          name: 'علي الحازمي',
          role: 'system_admin',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      console.log('✅ تم إنشاء user أيضاً:', newUser.id);
    } else {
      console.log('ℹ️ User موجود بالفعل:', existingUser.id);
    }
    
    // عرض إحصائيات نهائية
    const totalMembers = await prisma.team_members.count();
    const systemAdmins = await prisma.team_members.count({
      where: { role: 'system_admin' }
    });
    
    console.log('\n📊 إحصائيات الفريق:');
    console.log(`👥 إجمالي الأعضاء: ${totalMembers}`);
    console.log(`🔑 مديرو النظام: ${systemAdmins}`);
    
  } catch (error) {
    console.error('❌ خطأ في إضافة علي الحازمي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAliSystemAdmin();