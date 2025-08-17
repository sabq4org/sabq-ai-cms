const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPositionField() {
  try {
    console.log('🔧 إضافة حقل position لجدول team_members...\n');
    
    // إضافة حقل position
    await prisma.$executeRawUnsafe(`
      ALTER TABLE team_members 
      ADD COLUMN IF NOT EXISTS position VARCHAR(100)
    `);
    
    console.log('✅ تم إضافة حقل position\n');
    
    // عرض الهيكل الجديد
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'team_members'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 أعمدة الجدول المحدث:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPositionField();