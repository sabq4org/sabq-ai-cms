const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTeamTable() {
  try {
    console.log('🔍 فحص جدول أعضاء الفريق...\n');
    
    // التحقق من وجود الجدول
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'team_members'
      ) as exists
    `;
    
    console.log(`📊 هل الجدول موجود؟ ${tableExists[0].exists ? 'نعم ✅' : 'لا ❌'}`);
    
    if (tableExists[0].exists) {
      // عرض هيكل الجدول
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'team_members'
        ORDER BY ordinal_position
      `;
      
      console.log('\n📋 أعمدة الجدول:');
      columns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
      
      // عدد السجلات
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM team_members
      `;
      
      console.log(`\n📊 عدد السجلات: ${count[0].count}`);
    } else {
      console.log('\n⚠️ الجدول غير موجود، يجب إنشاؤه أولاً');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTeamTable();