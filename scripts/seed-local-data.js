const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 إضافة البيانات التجريبية...');

  // إضافة فئات تجريبية
  const categories = await Promise.all([
    prisma.categories.upsert({
      where: { id: 'cat-001' },
      update: {},
      create: {
        id: 'cat-001',
        name: 'محليات',
        slug: 'local',
        description: 'الأخبار المحلية',
        is_active: true,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.categories.upsert({
      where: { id: 'cat-002' },
      update: {},
      create: {
        id: 'cat-002',
        name: 'العالم',
        slug: 'world',
        description: 'الأخبار العالمية',
        is_active: true,
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.categories.upsert({
      where: { id: 'cat-003' },
      update: {},
      create: {
        id: 'cat-003',
        name: 'رياضة',
        slug: 'sports',
        description: 'الأخبار الرياضية',
        is_active: true,
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    }),
    prisma.categories.upsert({
      where: { id: 'cat-004' },
      update: {},
      create: {
        id: 'cat-004',
        name: 'تقنية',
        slug: 'tech',
        description: 'أخبار التقنية',
        is_active: true,
        display_order: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  ]);

  console.log(`✅ تم إنشاء ${categories.length} فئات`);

  // إضافة مستخدم تجريبي
  const user = await prisma.users.upsert({
    where: { email: 'admin@sabq.local' },
    update: {},
    create: {
      id: 'user-admin-001',
      email: 'admin@sabq.local',
      name: 'مدير النظام',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkJxDQU3.qwP2s2', // password123
      role: 'admin',
      is_admin: true,
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  console.log(`✅ تم إنشاء المستخدم: ${user.email}`);

  // إضافة مقال تجريبي
  const article = await prisma.articles.upsert({
    where: { id: 'article-001' },
    update: {},
    create: {
      id: 'article-001',
      title: 'مقال تجريبي للاختبار',
      slug: 'test-article-001',
      content: 'هذا محتوى المقال التجريبي لاختبار النظام.',
      excerpt: 'مقال تجريبي لاختبار النظام',
      category_id: 'cat-001',
      author_id: 'user-admin-001',
      status: 'published',
      featured: false,
      breaking: false,
      views: 0,
      allow_comments: true,
      likes: 0,
      saves: 0,
      shares: 0,
      published_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  console.log(`✅ تم إنشاء المقال: ${article.title}`);

  console.log('🎉 تم الانتهاء من إضافة البيانات التجريبية');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في إضافة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 