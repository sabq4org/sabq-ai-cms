// سكريبت للتحقق من الأدوار في قاعدة البيانات
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    console.log('🔍 فحص الأدوار في قاعدة البيانات...');
    
    // عد الأدوار
    const rolesCount = await prisma.roles.count();
    console.log(`📊 إجمالي الأدوار: ${rolesCount}`);
    
    if (rolesCount === 0) {
      console.log('⚠️ لا توجد أدوار في قاعدة البيانات!');
      console.log('💡 لإنشاء الأدوار الافتراضية، شغل:');
      console.log('   npm run seed-roles');
      return;
    }
    
    // جلب جميع الأدوار
    const roles = await prisma.roles.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    console.log('\n📋 قائمة الأدوار الموجودة:');
    console.log('=' .repeat(60));
    
    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name} (${role.display_name || 'بدون عنوان'})`);
      console.log(`   ID: ${role.id}`);
      console.log(`   الوصف: ${role.description || 'بدون وصف'}`);
      console.log(`   نظام: ${role.is_system ? 'نعم' : 'لا'}`);
      console.log(`   تاريخ الإنشاء: ${role.created_at}`);
      
      // فحص الصلاحيات
      if (role.permissions) {
        try {
          const permissions = typeof role.permissions === 'string' 
            ? JSON.parse(role.permissions) 
            : role.permissions;
          console.log(`   الصلاحيات: ${Array.isArray(permissions) ? permissions.length : 'غير صحيحة'}`);
        } catch (e) {
          console.log(`   الصلاحيات: خطأ في التحليل`);
        }
      } else {
        console.log(`   الصلاحيات: غير محددة`);
      }
      
      console.log('   ' + '-'.repeat(40));
    });
    
    // فحص عدد المستخدمين لكل دور
    console.log('\n👥 إحصائيات المستخدمين:');
    for (const role of roles) {
      try {
        const userCount = await prisma.users.count({
          where: { role: role.name }
        });
        console.log(`   ${role.name}: ${userCount} مستخدم`);
      } catch (e) {
        console.log(`   ${role.name}: خطأ في الحساب`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص الأدوار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  checkRoles();
}

export default checkRoles;
