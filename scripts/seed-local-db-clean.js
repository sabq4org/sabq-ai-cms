#!/usr/bin/env node
const { PrismaClient } = require('../lib/generated/prisma');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function cleanAndSeed() {
  console.log('🧹 تنظيف قاعدة البيانات...');

  try {
    // حذف البيانات القديمة
    await prisma.dose_contents.deleteMany({});
    await prisma.daily_doses.deleteMany({});
    await prisma.articles.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.categories.deleteMany({});
    
    console.log('✅ تم تنظيف قاعدة البيانات');

    // 1. إنشاء تصنيفات
    console.log('📁 إنشاء التصنيفات...');
    const categories = [];
    const categoryData = [
      { id: 'cat-001', name: 'أخبار محلية', name_en: 'Local News', slug: 'local-news', color: '#3B82F6' },
      { id: 'cat-002', name: 'رياضة', name_en: 'Sports', slug: 'sports', color: '#10B981' },
      { id: 'cat-003', name: 'اقتصاد', name_en: 'Economy', slug: 'economy', color: '#F59E0B' },
      { id: 'cat-004', name: 'تقنية', name_en: 'Technology', slug: 'technology', color: '#8B5CF6' }
    ];

    for (let i = 0; i < categoryData.length; i++) {
      const cat = await prisma.categories.create({
        data: {
          ...categoryData[i],
          description: `وصف ${categoryData[i].name}`,
          display_order: i + 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      categories.push(cat);
    }
    console.log(`✅ تم إنشاء ${categories.length} تصنيفات`);

    // 2. إنشاء مستخدمين
    console.log('👥 إنشاء المستخدمين...');
    const hashedPassword = await bcrypt.hash('Test@123456', 10);
    
    const admin = await prisma.users.create({
      data: {
        id: 'user-admin-001',
        email: 'admin@sabq.ai',
        password_hash: hashedPassword,
        name: 'المدير',
        role: 'admin',
        is_admin: true,
        is_verified: true,
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff',
        emailVerified: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const editor = await prisma.users.create({
      data: {
        id: 'user-editor-001',
        email: 'editor@sabq.ai',
        password_hash: hashedPassword,
        name: 'محرر سبق',
        role: 'editor',
        is_admin: false,
        is_verified: true,
        avatar: 'https://ui-avatars.com/api/?name=Editor&background=10B981&color=fff',
        emailVerified: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ تم إنشاء المستخدمين');

    // 3. إنشاء مقالات
    console.log('📰 إنشاء المقالات...');
    const articles = [];
    const articleData = [
      {
        title: 'إطلاق مبادرة جديدة لدعم الشباب السعودي في مجال التقنية',
        excerpt: 'أعلنت وزارة الاتصالات عن مبادرة طموحة تستهدف تدريب 50 ألف شاب سعودي',
        content: '<p>في خطوة رائدة نحو تعزيز الاقتصاد الرقمي، أعلنت وزارة الاتصالات وتقنية المعلومات عن إطلاق مبادرة وطنية شاملة تستهدف تدريب وتأهيل 50 ألف شاب وشابة سعودية على أحدث التقنيات والمهارات الرقمية.</p><p>وتأتي هذه المبادرة ضمن رؤية المملكة 2030 الهادفة إلى بناء اقتصاد رقمي متقدم وتعزيز دور الشباب السعودي في قيادة التحول الرقمي.</p>',
        categoryId: 'cat-004',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80'
      },
      {
        title: 'الهلال يحقق فوزاً مثيراً في دوري أبطال آسيا',
        excerpt: 'حقق نادي الهلال فوزاً دراماتيكياً في اللحظات الأخيرة',
        content: '<p>في مباراة مثيرة شهدت أحداثاً دراماتيكية، تمكن نادي الهلال من تحقيق الفوز على نادي أوراوا الياباني بهدفين مقابل هدف في إطار دوري أبطال آسيا.</p><p>سجل للهلال كل من مالكوم في الدقيقة 45 وميشيل في الدقيقة 89 من ركلة جزاء.</p>',
        categoryId: 'cat-002',
        image: 'https://images.unsplash.com/photo-1556103255-4443dbae8e5a?w=1200&q=80'
      },
      {
        title: 'ارتفاع مؤشر سوق الأسهم السعودية بنسبة 2.5%',
        excerpt: 'شهد مؤشر تاسي ارتفاعاً ملحوظاً مدفوعاً بأداء قطاع البنوك',
        content: '<p>أغلق المؤشر العام للسوق المالية السعودية "تاسي" على ارتفاع بنسبة 2.5% ليصل إلى مستوى 11,450 نقطة، محققاً مكاسب قوية للأسبوع الثاني على التوالي.</p>',
        categoryId: 'cat-003',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80'
      },
      {
        title: 'افتتاح أكبر مجمع تجاري في الرياض',
        excerpt: 'يضم المجمع أكثر من 500 متجر و100 مطعم ومقهى',
        content: '<p>افتتح صاحب السمو الملكي الأمير محمد بن سلمان، ولي العهد، اليوم أكبر مجمع تجاري في العاصمة الرياض والذي يمتد على مساحة 300 ألف متر مربع.</p>',
        categoryId: 'cat-001',
        image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1200&q=80'
      },
      {
        title: 'المنتخب السعودي يستعد لكأس آسيا بمعسكر في إسبانيا',
        excerpt: 'يخوض الأخضر معسكراً تدريبياً مكثفاً استعداداً للبطولة',
        content: '<p>بدأ المنتخب السعودي لكرة القدم معسكره التدريبي في مدينة ماربيا الإسبانية استعداداً لنهائيات كأس آسيا 2024.</p>',
        categoryId: 'cat-002',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80'
      },
      {
        title: 'إطلاق أول سيارة كهربائية سعودية الصنع',
        excerpt: 'شركة سير تكشف عن أول نموذج لسيارة كهربائية محلية',
        content: '<p>كشفت شركة سير السعودية عن أول سيارة كهربائية محلية الصنع في حدث ضخم بالرياض، مما يمثل نقلة نوعية في صناعة السيارات بالمملكة.</p>',
        categoryId: 'cat-004',
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80'
      }
    ];

    for (const data of articleData) {
      const article = await prisma.articles.create({
        data: {
          id: crypto.randomUUID(),
          title: data.title,
          slug: data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50) + '-' + Date.now(),
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: data.image,
          status: 'published',
          views: Math.floor(Math.random() * 1000) + 100,
          readingTime: Math.floor(Math.random() * 5) + 2,
          publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // آخر 7 أيام
          categoryId: data.categoryId,
          authorId: Math.random() > 0.5 ? admin.id : editor.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      articles.push(article);
    }
    console.log(`✅ تم إنشاء ${articles.length} مقالات`);

    // 4. إنشاء جرعة يومية
    console.log('💊 إنشاء الجرعة اليومية...');
    const currentHour = new Date().getHours();
    let period = 'morning';
    if (currentHour >= 6 && currentHour < 12) period = 'morning';
    else if (currentHour >= 12 && currentHour < 17) period = 'afternoon';
    else if (currentHour >= 17 && currentHour < 21) period = 'evening';
    else period = 'night';

    const dose = await prisma.daily_doses.create({
      data: {
        id: crypto.randomUUID(),
        period: period,
        title: period === 'morning' ? 'صباحك سعيد مع سبق' : 
               period === 'afternoon' ? 'جرعة الظهيرة' :
               period === 'evening' ? 'مساؤك مع سبق' : 'ختام يومك مع سبق',
        subtitle: 'أهم الأخبار والمستجدات',
        date: new Date(),
        status: 'published',
        publishedAt: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // إضافة محتويات الجرعة (أول 3 مقالات)
    for (let i = 0; i < Math.min(3, articles.length); i++) {
      await prisma.dose_contents.create({
        data: {
          id: crypto.randomUUID(),
          doseId: dose.id,
          contentType: 'article',
          title: articles[i].title,
          summary: articles[i].excerpt,
          imageUrl: articles[i].featuredImage,
          articleId: articles[i].id,
          displayOrder: i,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    console.log('✅ تم إنشاء الجرعة اليومية');
    console.log('\n🎉 تم إضافة جميع البيانات التجريبية بنجاح!');
    console.log('\n📝 بيانات تسجيل الدخول:');
    console.log('   - المدير: admin@sabq.ai / Test@123456');
    console.log('   - المحرر: editor@sabq.ai / Test@123456');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
cleanAndSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 