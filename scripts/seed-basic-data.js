const { PrismaClient } = require('../lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedBasicData() {
  console.log('🌱 بدء إضافة البيانات الأساسية...');

  try {
    // 1. إضافة الأدوار الأساسية
    console.log('\n📝 إضافة الأدوار...');
    const roles = [
      { 
        id: 'role-admin-001',
        name: 'admin', 
        display_name: 'مدير النظام',
        description: 'صلاحيات كاملة على النظام',
        permissions: JSON.stringify(['all']),
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      { 
        id: 'role-editor-001',
        name: 'editor', 
        display_name: 'محرر',
        description: 'إضافة وتعديل المحتوى',
        permissions: JSON.stringify(['create_article', 'edit_article', 'delete_article', 'manage_comments']),
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      { 
        id: 'role-author-001',
        name: 'author', 
        display_name: 'كاتب',
        description: 'كتابة المقالات والآراء',
        permissions: JSON.stringify(['create_article', 'edit_own_article']),
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      { 
        id: 'role-correspondent-001',
        name: 'correspondent', 
        display_name: 'مراسل',
        description: 'إرسال الأخبار من الميدان',
        permissions: JSON.stringify(['create_news', 'edit_own_news']),
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      { 
        id: 'role-moderator-001',
        name: 'moderator', 
        display_name: 'مشرف',
        description: 'إدارة التعليقات والمحتوى',
        permissions: JSON.stringify(['manage_comments', 'moderate_content']),
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      { 
        id: 'role-user-001',
        name: 'user', 
        display_name: 'مستخدم',
        description: 'مستخدم عادي',
        permissions: JSON.stringify(['read', 'comment']),
        is_system: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const role of roles) {
      await prisma.roles.upsert({
        where: { name: role.name },
        update: role,
        create: role
      });
      console.log(`✅ تم إضافة دور: ${role.display_name}`);
    }

    // 2. إضافة أعضاء الفريق
    console.log('\n👥 إضافة أعضاء الفريق...');
    const teamMembers = [
      {
        name: 'أحمد الصحفي',
        role: 'رئيس التحرير',
        bio: 'صحفي متمرس بخبرة تزيد عن 15 عاماً في الصحافة الإلكترونية',
        avatar: '/images/team/editor1.jpg',
        email: 'ahmed@sabq.org',
        order_index: 1
      },
      {
        name: 'فاطمة المحررة',
        role: 'محررة أخبار',
        bio: 'متخصصة في الأخبار المحلية والشؤون الاجتماعية',
        avatar: '/images/team/editor2.jpg',
        email: 'fatima@sabq.org',
        order_index: 2
      },
      {
        name: 'محمد المراسل',
        role: 'مراسل ميداني',
        bio: 'مراسل في منطقة الرياض، متخصص في الأخبار العاجلة',
        avatar: '/images/team/correspondent1.jpg',
        email: 'mohammed@sabq.org',
        order_index: 3
      }
    ];

    for (const member of teamMembers) {
      await prisma.team_members.upsert({
        where: { email: member.email },
        update: member,
        create: member
      });
      console.log(`✅ تم إضافة عضو فريق: ${member.name}`);
    }

    // 3. إضافة مستخدمين كمراسلين
    console.log('\n📰 إضافة المراسلين...');
    const correspondentRole = await prisma.roles.findUnique({
      where: { name: 'correspondent' }
    });

    const correspondents = [
      {
        name: 'خالد المراسل',
        email: 'khaled.correspondent@sabq.org',
        password: await bcrypt.hash('password123', 10),
        role_id: correspondentRole?.id,
        is_active: true,
        is_email_verified: true
      },
      {
        name: 'سارة المراسلة',
        email: 'sara.correspondent@sabq.org',
        password: await bcrypt.hash('password123', 10),
        role_id: correspondentRole?.id,
        is_active: true,
        is_email_verified: true
      },
      {
        name: 'عبدالله المراسل',
        email: 'abdullah.correspondent@sabq.org',
        password: await bcrypt.hash('password123', 10),
        role_id: correspondentRole?.id,
        is_active: true,
        is_email_verified: true
      }
    ];

    for (const correspondent of correspondents) {
      await prisma.users.upsert({
        where: { email: correspondent.email },
        update: correspondent,
        create: correspondent
      });
      console.log(`✅ تم إضافة مراسل: ${correspondent.name}`);
    }

    // 4. إضافة كتاب الرأي
    console.log('\n✍️ إضافة كتاب الرأي...');
    const opinionAuthors = [
      {
        name: 'د. عبدالرحمن الكاتب',
        bio: 'أستاذ جامعي وكاتب رأي متخصص في الشؤون السياسية',
        avatar: '/images/authors/author1.jpg',
        email: 'abdulrahman@sabq.org',
        specialization: 'الشؤون السياسية'
      },
      {
        name: 'أ. نورة الكاتبة',
        bio: 'كاتبة وباحثة في الشؤون الاجتماعية',
        avatar: '/images/authors/author2.jpg',
        email: 'noura@sabq.org',
        specialization: 'الشؤون الاجتماعية'
      }
    ];

    for (const author of opinionAuthors) {
      await prisma.opinion_authors.upsert({
        where: { email: author.email },
        update: author,
        create: author
      });
      console.log(`✅ تم إضافة كاتب رأي: ${author.name}`);
    }

    console.log('\n✅ تمت إضافة جميع البيانات الأساسية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكربت
seedBasicData()
  .then(() => {
    console.log('🎉 اكتمل إضافة البيانات الأساسية');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 فشل إضافة البيانات:', error);
    process.exit(1);
  }); 