const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTeamMembersTable() {
  try {
    console.log('🚀 إنشاء جدول أعضاء الفريق...\n');
    
    // إنشاء جدول team_members
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(255) PRIMARY KEY DEFAULT CONCAT('team_', CAST(EXTRACT(EPOCH FROM NOW()) * 1000 AS BIGINT), '_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 10)),
        user_id VARCHAR(255) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role_id VARCHAR(255) REFERENCES roles(id),
        role_name VARCHAR(100),
        image_url TEXT,
        bio TEXT,
        phone VARCHAR(50),
        department VARCHAR(100),
        position VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'on_leave')),
        verified BOOLEAN DEFAULT false,
        social_links JSONB DEFAULT '{}',
        permissions_override JSONB DEFAULT '[]',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ تم إنشاء جدول team_members\n');
    
    // إنشاء الفهارس
    console.log('📇 إنشاء الفهارس...');
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status)
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_team_members_role_id ON team_members(role_id)
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department)
    `);
    
    console.log('✅ تم إنشاء الفهارس\n');
    
    // إضافة trigger لتحديث updated_at
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_team_members_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS update_team_members_updated_at_trigger ON team_members;
      
      CREATE TRIGGER update_team_members_updated_at_trigger
      BEFORE UPDATE ON team_members
      FOR EACH ROW
      EXECUTE FUNCTION update_team_members_updated_at();
    `);
    
    console.log('✅ تم إنشاء trigger التحديث التلقائي\n');
    
    // نقل البيانات الموجودة من جدول users
    console.log('📦 نقل أعضاء الفريق من جدول المستخدمين...');
    
    const teamRoles = ['admin', 'editor', 'content-manager', 'moderator', 'كاتب'];
    const teamMembers = await prisma.users.findMany({
      where: {
        role: {
          in: teamRoles
        }
      }
    });
    
    console.log(`📊 عدد أعضاء الفريق المكتشفين: ${teamMembers.length}`);
    
    for (const member of teamMembers) {
      try {
        // التحقق من وجود العضو
        const existing = await prisma.$queryRaw`
          SELECT id FROM team_members WHERE user_id = ${member.id}
        `;
        
        if (existing.length === 0) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO team_members (
              user_id, name, email, role_name, image_url, 
              bio, status, verified, joined_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
          `, 
            member.id,
            member.name || member.email.split('@')[0],
            member.email,
            member.role,
            member.avatar,
            member.bio || '',
            member.status === 'active' ? 'active' : 'suspended',
            member.email_verified || false,
            member.created_at
          );
          
          console.log(`✅ تم نقل: ${member.name || member.email}`);
        }
      } catch (error) {
        console.log(`⚠️ تخطي ${member.email}: ${error.message}`);
      }
    }
    
    // عرض الإحصائيات
    const totalTeamMembers = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM team_members
    `;
    
    console.log('\n📊 الإحصائيات النهائية:');
    console.log(`- إجمالي أعضاء الفريق: ${totalTeamMembers[0].count}`);
    
    // عرض بعض الأمثلة
    const examples = await prisma.$queryRaw`
      SELECT name, email, role_name, status 
      FROM team_members 
      LIMIT 5
    `;
    
    console.log('\n📝 أمثلة على أعضاء الفريق:');
    examples.forEach(member => {
      console.log(`- ${member.name} (${member.email}) - ${member.role_name} - ${member.status}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
createTeamMembersTable();