/**
 * إضافة دور الكاتب للنظام
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function addWriterRole() {
  try {
    console.log('📝 إضافة دور الكاتب للنظام...\n');
    
    // التحقق من وجود دور الكاتب
    const existingWriter = await prisma.roles.findFirst({
      where: { name: 'writer' }
    });
    
    if (existingWriter) {
      console.log('✅ دور الكاتب موجود مسبقاً:');
      console.log(`   المعرف: ${existingWriter.id}`);
      console.log(`   الاسم: ${existingWriter.name}`);
      console.log(`   العرض: ${existingWriter.display_name}`);
      return;
    }
    
    // إنشاء دور الكاتب
    const writerRole = await prisma.roles.create({
      data: {
        id: uuidv4(),
        name: 'writer',
        display_name: 'كاتب',
        description: 'كاتب مقالات الرأي والتحليلات',
        permissions: JSON.stringify([
          'write_articles',
          'edit_own_articles', 
          'view_dashboard',
          'manage_profile'
        ]),
        is_system: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إضافة دور الكاتب بنجاح:');
    console.log(`   المعرف: ${writerRole.id}`);
    console.log(`   الاسم: ${writerRole.name}`);
    console.log(`   العرض: ${writerRole.display_name}`);
    console.log(`   الصلاحيات: ${writerRole.permissions}`);
    
    // التحقق من النتيجة
    const allRoles = await prisma.roles.findMany({
      orderBy: { display_name: 'asc' }
    });
    
    console.log('\n📋 جميع الأدوار المتاحة الآن:');
    allRoles.forEach((role, index) => {
      console.log(`  ${index + 1}. ${role.display_name} (${role.name})`);
    });
    
    console.log('\n🎯 دور الكاتب جاهز للاستخدام في نموذج إضافة أعضاء الفريق!');
    
  } catch (error) {
    console.error('❌ خطأ في إضافة دور الكاتب:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWriterRole();