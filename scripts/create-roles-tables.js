const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRolesTables() {
  try {
    console.log('🚀 بدء إنشاء جداول الأدوار والصلاحيات...');
    
    // إنشاء جدول الأدوار
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS roles (
          id VARCHAR(255) PRIMARY KEY DEFAULT concat('role_', extract(epoch from now())::bigint::text, '_', substr(md5(random()::text), 1, 8)),
          name VARCHAR(100) UNIQUE NOT NULL,
          display_name VARCHAR(255) NOT NULL,
          description TEXT,
          color VARCHAR(50) DEFAULT 'gray',
          level INTEGER DEFAULT 10,
          is_active BOOLEAN DEFAULT true,
          is_system BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ تم إنشاء جدول roles');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ جدول roles موجود مسبقاً');
      } else {
        throw error;
      }
    }
    
    // إنشاء جدول الصلاحيات
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS permissions (
          id VARCHAR(255) PRIMARY KEY DEFAULT concat('perm_', extract(epoch from now())::bigint::text, '_', substr(md5(random()::text), 1, 8)),
          name VARCHAR(100) UNIQUE NOT NULL,
          display_name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL,
          is_system BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ تم إنشاء جدول permissions');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ جدول permissions موجود مسبقاً');
      } else {
        throw error;
      }
    }
    
    // جدول ربط الأدوار بالصلاحيات
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id VARCHAR(255) PRIMARY KEY DEFAULT concat('rp_', extract(epoch from now())::bigint::text, '_', substr(md5(random()::text), 1, 8)),
          role_id VARCHAR(255) NOT NULL,
          permission_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
          UNIQUE(role_id, permission_id)
        )
      `;
      console.log('✅ تم إنشاء جدول role_permissions');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ جدول role_permissions موجود مسبقاً');
      } else {
        throw error;
      }
    }
    
    // إضافة عمود role_id في جدول users
    try {
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id VARCHAR(255)
      `;
      console.log('✅ تم إضافة عمود role_id في جدول users');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ عمود role_id موجود مسبقاً');
      } else {
        console.log('⚠️ تخطي إضافة عمود role_id:', error.message);
      }
    }
    
    // إنشاء الفهارس
    const indexes = [
      { name: 'idx_roles_name', table: 'roles', column: 'name' },
      { name: 'idx_roles_is_active', table: 'roles', column: 'is_active' },
      { name: 'idx_permissions_name', table: 'permissions', column: 'name' },
      { name: 'idx_permissions_category', table: 'permissions', column: 'category' },
      { name: 'idx_role_permissions_role_id', table: 'role_permissions', column: 'role_id' },
      { name: 'idx_role_permissions_permission_id', table: 'role_permissions', column: 'permission_id' },
      { name: 'idx_users_role_id', table: 'users', column: 'role_id' }
    ];
    
    for (const index of indexes) {
      try {
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table}(${index.column})
        `);
        console.log(`✅ تم إنشاء فهرس ${index.name}`);
      } catch (error) {
        console.log(`⚠️ تخطي فهرس ${index.name}:`, error.message);
      }
    }
    
    console.log('\n✅ تم إنشاء جميع الجداول بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإنشاء
createRolesTables();