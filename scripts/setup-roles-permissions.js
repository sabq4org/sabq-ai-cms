const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function setupRolesAndPermissions() {
  try {
    console.log('🚀 بدء إعداد نظام الأدوار والصلاحيات...');
    
    // قراءة ملف SQL
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'add_roles_permissions_tables.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    // تقسيم الأوامر SQL
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // تنفيذ كل أمر
    for (const statement of statements) {
      try {
        console.log('⚙️ تنفيذ:', statement.substring(0, 50) + '...');
        await prisma.$executeRawUnsafe(statement + ';');
        console.log('✅ تم بنجاح');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠️ موجود مسبقاً، تخطي...');
        } else {
          console.error('❌ خطأ:', error.message);
        }
      }
    }
    
    // التحقق من النتائج
    console.log('\n📊 التحقق من النتائج...');
    
    const rolesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM roles`;
    console.log(`✅ عدد الأدوار: ${rolesCount[0].count}`);
    
    const permissionsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM permissions`;
    console.log(`✅ عدد الصلاحيات: ${permissionsCount[0].count}`);
    
    const rolePermissionsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM role_permissions`;
    console.log(`✅ عدد ربط الصلاحيات: ${rolePermissionsCount[0].count}`);
    
    // عرض الأدوار
    const roles = await prisma.$queryRaw`
      SELECT r.*, COUNT(DISTINCT rp.permission_id) as permissions_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
      ORDER BY r.level
    `;
    
    console.log('\n📋 الأدوار المتاحة:');
    roles.forEach(role => {
      console.log(`  - ${role.display_name} (${role.name}): ${role.permissions_count} صلاحية`);
    });
    
    console.log('\n✅ تم إعداد نظام الأدوار والصلاحيات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإعداد
setupRolesAndPermissions();