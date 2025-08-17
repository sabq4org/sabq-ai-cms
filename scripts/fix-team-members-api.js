/**
 * Script لإصلاح مشكلة API أعضاء الفريق
 * يوحد تنسيق البيانات ويصلح التعارضات في أسماء الحقول
 */

const fs = require('fs').promises;
const path = require('path');

// مسار ملف البيانات
const DATA_FILE = path.join(process.cwd(), 'data', 'team-members.json');

async function fixTeamMembersData() {
  try {
    console.log('🔧 بدء إصلاح بيانات أعضاء الفريق...');
    
    // قراءة البيانات الحالية
    let teamMembers = [];
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      teamMembers = JSON.parse(data);
      console.log(`📊 تم العثور على ${teamMembers.length} عضو في الملف`);
    } catch (error) {
      console.log('⚠️ لم يتم العثور على الملف، سيتم إنشاؤه');
      teamMembers = [];
    }
    
    // توحيد تنسيق البيانات
    const cleanedMembers = teamMembers.map((member, index) => {
      const cleanMember = {
        id: member.id || `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: member.name || 'عضو غير مسمى',
        email: member.email || `member${index}@sabq.io`,
        role: member.role || member.roleId || 'member', // توحيد الدور
        department: member.department || null,
        position: member.position || null,
        bio: member.bio || null,
        avatar: member.avatar || null,
        phone: member.phone || null,
        social_links: member.social_links || {},
        is_active: member.is_active !== false && member.isActive !== false, // توحيد حالة النشاط
        display_order: member.display_order || (index + 1),
        created_at: member.created_at || member.createdAt || new Date().toISOString(),
        updated_at: member.updated_at || member.createdAt || new Date().toISOString()
      };
      
      console.log(`✅ تم تنظيف بيانات: ${cleanMember.name} (${cleanMember.role})`);
      return cleanMember;
    });
    
    // إزالة المكررات (بناءً على البريد الإلكتروني)
    const uniqueMembers = [];
    const seenEmails = new Set();
    
    for (const member of cleanedMembers) {
      if (!seenEmails.has(member.email)) {
        seenEmails.add(member.email);
        uniqueMembers.push(member);
      } else {
        console.log(`🗑️ تم حذف العضو المكرر: ${member.name} (${member.email})`);
      }
    }
    
    // حفظ البيانات المنظمة
    await fs.writeFile(DATA_FILE, JSON.stringify(uniqueMembers, null, 2));
    
    console.log('✅ تم إصلاح بيانات أعضاء الفريق بنجاح!');
    console.log(`📊 العدد النهائي: ${uniqueMembers.length} عضو`);
    
    // عرض ملخص للأعضاء
    console.log('\n📋 ملخص الأعضاء:');
    uniqueMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} - ${member.role} (${member.email})`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح البيانات:', error);
    throw error;
  }
}

// تشغيل Script
if (require.main === module) {
  fixTeamMembersData()
    .then(() => {
      console.log('🎉 انتهى الإصلاح بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل الإصلاح:', error);
      process.exit(1);
    });
}

module.exports = { fixTeamMembersData };