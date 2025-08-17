const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRolesStructure() {
  try {
    console.log('🔍 فحص بنية جدول roles...\n');
    
    // جلب أعمدة الجدول
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'roles'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 أعمدة جدول roles:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // جلب البيانات الموجودة
    const roles = await prisma.$queryRaw`
      SELECT * FROM roles ORDER BY name
    `;
    
    console.log(`\n📊 عدد الأدوار الموجودة: ${roles.length}`);
    if (roles.length > 0) {
      console.log('\n📝 الأدوار الموجودة:');
      roles.forEach(role => {
        console.log(`  - ${role.name}: ${role.display_name || 'بدون اسم معروض'}`);
      });
    }
    
    // فحص الصلاحيات
    const permissions = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM permissions
    `;
    console.log(`\n📊 عدد الصلاحيات: ${permissions[0].count}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolesStructure();