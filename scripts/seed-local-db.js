#!/usr/bin/env node
const { PrismaClient } = require('../lib/generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 بدء إضافة البيانات التجريبية...');

  try {
    // 1. إنشاء تصنيفات
    console.log('📁 إنشاء التصنيفات...');
    const categories = await Promise.all([
      prisma.categories.create({
        data: {
          id: 'cat-001',
          name: 'أخبار محلية',
          name_en: 'Local News',
          slug: 'local-news',
          description: 'آخر الأخبار المحلية',
          color: '#3B82F6',
          display_order: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      }),
      prisma.categories.create({
        data: {
          id: 'cat-002',
          name: 'رياضة',
          name_en: 'Sports',
          slug: 'sports',
          description: 'أخبار الرياضة',
          color: '#10B981',
          display_order: 2,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      }),
      prisma.categories.create({
        data: {
          id: 'cat-003',
          name: 'اقتصاد',
          name_en: 'Economy',
          slug: 'economy',
          description: 'أخبار الاقتصاد',
          color: '#F59E0B',
          display_order: 3,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    ]);
    console.log(`✅ تم إنشاء ${categories.length} تصنيفات`);

    // 2. إنشاء مستخدمين
    console.log('👥 إنشاء المستخدمين...');
    const users = await Promise.all([
      prisma.users.create({
        data: {
          id: 'user-admin-001',
          email: 'admin@sabq.ai',
          password: '$2a$10$YourHashedPasswordHere', // Test@123456
          name: 'المدير',
          role: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff',
          bio: 'مدير الموقع',
          isActive: true,
          emailVerified: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      }),
      prisma.users.create({
        data: {
          id: 'user-editor-001',
          email: 'editor@sabq.ai',
          password: '$2a$10$YourHashedPasswordHere', // Test@123456
          name: 'محرر سبق',
          role: 'editor',
          avatar: 'https://ui-avatars.com/api/?name=Editor&background=10B981&color=fff',
          bio: 'محرر محتوى في سبق',
          isActive: true,
          emailVerified: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    ]);
    console.log(`✅ تم إنشاء ${users.length} مستخدمين`);

    // 3. إنشاء مقالات
    console.log('📰 إنشاء المقالات...');
    const articles = [];
    const articleData = [
      {
        title: 'إطلاق مبادرة جديدة لدعم الشباب السعودي في مجال التقنية',
        excerpt: 'أعلنت وزارة الاتصالات عن مبادرة طموحة تستهدف تدريب 50 ألف شاب سعودي على أحدث التقنيات',
        content: '<p>في خطوة رائدة نحو تعزيز الاقتصاد الرقمي، أعلنت وزارة الاتصالات وتقنية المعلومات عن إطلاق مبادرة وطنية شاملة...</p>',
        categoryId: 'cat-001',
        featured_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'
      },
      {
        title: 'الهلال يحقق فوزاً مثيراً في دوري أبطال آسيا',
        excerpt: 'حقق نادي الهلال فوزاً دراماتيكياً في اللحظات الأخيرة من المباراة',
        content: '<p>في مباراة مثيرة شهدت أحداثاً دراماتيكية، تمكن نادي الهلال من تحقيق الفوز...</p>',
        categoryId: 'cat-002',
        featured_image: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=800'
      },
      {
        title: 'ارتفاع مؤشر سوق الأسهم السعودية بنسبة 2.5%',
        excerpt: 'شهد مؤشر تاسي ارتفاعاً ملحوظاً مدفوعاً بأداء قطاع البنوك',
        content: '<p>أغلق المؤشر العام للسوق المالية السعودية "تاسي" على ارتفاع بنسبة 2.5%...</p>',
        categoryId: 'cat-003',
        featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'
      },
      {
        title: 'افتتاح أكبر مجمع تجاري في الرياض',
        excerpt: 'يضم المجمع أكثر من 500 متجر و100 مطعم ومقهى',
        content: '<p>افتتح صاحب السمو الملكي الأمير... أكبر مجمع تجاري في العاصمة الرياض...</p>',
        categoryId: 'cat-001',
        featured_image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800'
      },
      {
        title: 'المنتخب السعودي يستعد لكأس آسيا بمعسكر في إسبانيا',
        excerpt: 'يخوض الأخضر معسكراً تدريبياً مكثفاً استعداداً للبطولة القارية',
        content: '<p>بدأ المنتخب السعودي لكرة القدم معسكره التدريبي في مدينة ماربيا الإسبانية...</p>',
        categoryId: 'cat-002',
        featured_image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'
      }
    ];

    for (const data of articleData) {
      const article = await prisma.articles.create({
        data: {
          id: crypto.randomUUID(),
          title: data.title,
          slug: data.title.toLowerCase().replace(/\s+/g, '-').substring(0, 50) + '-' + Date.now(),
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: data.featured_image,
          status: 'published',
          views: Math.floor(Math.random() * 1000),
          readingTime: Math.floor(Math.random() * 5) + 1,
          publishedAt: new Date(),
          categoryId: data.categoryId,
          authorId: Math.random() > 0.5 ? 'user-admin-001' : 'user-editor-001',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      articles.push(article);
    }
    console.log(`✅ تم إنشاء ${articles.length} مقالات`);

    // 4. إنشاء جرعة يومية
    console.log('💊 إنشاء الجرعة اليومية...');
    const dose = await prisma.daily_doses.create({
      data: {
        id: crypto.randomUUID(),
        period: 'morning',
        title: 'صباحك سعيد مع سبق',
        subtitle: 'أهم الأخبار لتبدأ يومك',
        date: new Date(),
        status: 'published',
        publishedAt: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // إضافة محتويات الجرعة
    await prisma.dose_contents.create({
      data: {
        id: crypto.randomUUID(),
        doseId: dose.id,
        contentType: 'article',
        title: articles[0].title,
        summary: articles[0].excerpt,
        imageUrl: articles[0].featuredImage,
        articleId: articles[0].id,
        displayOrder: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ تم إنشاء الجرعة اليومية');

    console.log('\n🎉 تم إضافة جميع البيانات التجريبية بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 