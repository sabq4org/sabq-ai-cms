const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugTeamWriters() {
  console.log('🔍 فحص الكتاب في قاعدة البيانات...\n');
  
  try {
    // فحص كتاب team_members
    console.log('📝 1. الكتاب في team_members:');
    const teamWriters = await prisma.team_members.findMany({
      where: { role: 'writer' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        department: true,
        created_at: true
      }
    });
    
    if (teamWriters.length === 0) {
      console.log('❌ لا يوجد كتاب بدور "writer" في team_members');
    } else {
      console.log(`✅ تم العثور على ${teamWriters.length} كاتب:`);
      teamWriters.forEach((writer, index) => {
        console.log(`   ${index + 1}. ${writer.name} (${writer.email || 'لا يوجد بريد'}) - ${writer.department || 'لا يوجد قسم'}`);
      });
    }
    
    console.log('\n📝 2. فحص article_authors (إن وجد):');
    try {
      const articleAuthors = await prisma.article_authors.findMany({
        select: { 
          id: true, 
          full_name: true, 
          email: true, 
          is_active: true,
          role: true,
          created_at: true
        },
        take: 10
      });
      
      if (articleAuthors.length === 0) {
        console.log('❌ لا يوجد مؤلفين في article_authors');
      } else {
        console.log(`✅ تم العثور على ${articleAuthors.length} مؤلف:`);
        articleAuthors.forEach((author, index) => {
          console.log(`   ${index + 1}. ${author.full_name} (${author.email || 'لا يوجد بريد'}) - نشط: ${author.is_active}`);
        });
      }
    } catch (error) {
      console.log('⚠️ جدول article_authors غير موجود أو يحتوي أخطاء');
    }
    
    console.log('\n📝 3. فحص جميع أعضاء team_members:');
    const allTeamMembers = await prisma.team_members.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        department: true
      }
    });
    
    console.log(`📊 إجمالي أعضاء الفريق: ${allTeamMembers.length}`);
    const roleGroups = allTeamMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 توزيع الأدوار:');
    Object.entries(roleGroups).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count}`);
    });
    
    // اقتراح إضافة كتاب تجريبيين إذا لم يوجدوا
    if (teamWriters.length === 0) {
      console.log('\n💡 يمكن إضافة كتاب تجريبيين باستخدام الأمر التالي:');
      console.log('node scripts/add-sample-writers.js');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  debugTeamWriters();
}

module.exports = { debugTeamWriters };