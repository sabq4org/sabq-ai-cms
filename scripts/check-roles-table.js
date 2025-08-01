/**
 * فحص جدول الأدوار في قاعدة البيانات
 * التأكد من وجود البيانات والحقول المطلوبة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRolesTable() {
  try {
    console.log('🔍 فحص جدول الأدوار في قاعدة البيانات...\n');
    
    // 1. فحص وجود جدول roles
    console.log('📋 فحص وجود جدول roles...');
    
    try {
      const rolesCount = await prisma.roles.count();
      console.log(`✅ جدول roles موجود - العدد الإجمالي: ${rolesCount}`);
    } catch (error) {
      console.log('❌ خطأ في الوصول لجدول roles:', error.message);
      console.log('🔧 قد يكون الجدول غير موجود في schema.prisma');
      
      // محاولة الوصول عبر raw query
      try {
        const rawResult = await prisma.$queryRaw`SELECT COUNT(*) FROM roles;`;
        console.log('✅ الجدول موجود في قاعدة البيانات:', rawResult);
      } catch (rawError) {
        console.log('❌ الجدول غير موجود تماماً:', rawError.message);
        return;
      }
    }
    
    // 2. فحص بنية الجدول
    console.log('\n🏗️ فحص بنية جدول roles...');
    
    try {
      const tableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'roles' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      console.log('📊 حقول الجدول:');
      tableInfo.forEach(column => {
        console.log(`  • ${column.column_name}: ${column.data_type} ${column.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });
    } catch (error) {
      console.log('❌ خطأ في فحص بنية الجدول:', error.message);
    }
    
    // 3. جلب جميع الأدوار الموجودة
    console.log('\n📝 الأدوار الموجودة:');
    
    try {
      const roles = await prisma.roles.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      
      if (roles.length === 0) {
        console.log('⚠️ لا توجد أدوار في الجدول');
      } else {
        roles.forEach((role, index) => {
          console.log(`\n  ${index + 1}. الدور: ${role.name}`);
          console.log(`     الاسم المعروض: ${role.display_name || 'غير محدد'}`);
          console.log(`     الوصف: ${role.description || 'غير محدد'}`);
          console.log(`     الصلاحيات: ${role.permissions ? JSON.stringify(role.permissions).substring(0, 100) + '...' : 'غير محدد'}`);
          console.log(`     تاريخ الإنشاء: ${role.created_at || 'غير محدد'}`);
        });
      }
    } catch (error) {
      console.log('❌ خطأ في جلب الأدوار:', error.message);
      
      // محاولة جلب البيانات عبر raw query
      try {
        const rawRoles = await prisma.$queryRaw`SELECT * FROM roles LIMIT 10;`;
        console.log('📋 البيانات الخام من الجدول:');
        console.log(rawRoles);
      } catch (rawError) {
        console.log('❌ خطأ في جلب البيانات الخام:', rawError.message);
      }
    }
    
    // 4. فحص الربط مع team_members
    console.log('\n🔗 فحص الربط مع team_members...');
    
    try {
      const teamMembersWithRoles = await prisma.$queryRaw`
        SELECT tm.full_name, tm.role, r.name as role_name, r.display_name 
        FROM team_members tm 
        LEFT JOIN roles r ON tm.role = r.name 
        LIMIT 5;
      `;
      
      console.log('👥 عينة من أعضاء الفريق مع الأدوار:');
      teamMembersWithRoles.forEach(member => {
        console.log(`  • ${member.full_name}: ${member.role} → ${member.role_name || 'غير مرتبط'} (${member.display_name || 'لا يوجد عرض'})`);
      });
    } catch (error) {
      console.log('❌ خطأ في فحص الربط:', error.message);
    }
    
    // 5. توصيات للإصلاح
    console.log('\n💡 توصيات الإصلاح:');
    
    const recommendations = [];
    
    try {
      const rolesCount = await prisma.roles.count();
      if (rolesCount === 0) {
        recommendations.push('إضافة بيانات الأدوار الأساسية (admin, editor, reporter, writer, etc.)');
      }
    } catch (error) {
      recommendations.push('إنشاء جدول roles في قاعدة البيانات');
      recommendations.push('تحديث schema.prisma لتضمين نموذج roles');
    }
    
    recommendations.push('إنشاء/تحديث API endpoint للأدوار');
    recommendations.push('تحديث واجهة /admin/roles لعرض البيانات');
    recommendations.push('التأكد من صلاحيات Supabase RLS');
    
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n🎯 الخطوة التالية: إنشاء/تحديث API endpoint للأدوار');
    
  } catch (error) {
    console.error('❌ خطأ عام في فحص جدول الأدوار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolesTable();