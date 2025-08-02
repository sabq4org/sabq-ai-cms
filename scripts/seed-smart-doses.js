/**
 * إضافة بيانات تجريبية للجرعات الذكية
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// بيانات تجريبية للجرعات
const sampleDoses = [
  // الجرعة الصباحية
  {
    period: 'morning',
    title: 'ابدأ يومك بالأهم 👇',
    subtitle: 'ملخص ذكي لما فاتك من أحداث البارحة… قبل فنجان القهوة ☕️',
    topics: ['أخبار عامة', 'اقتصاد', 'تقنية'],
    source_articles: [],
    generated_by_ai: false,
    status: 'published',
    is_global: true,
    views: 150,
    interaction_count: 12,
    share_count: 3
  },
  
  // جرعة منتصف اليوم
  {
    period: 'noon',
    title: 'منتصف النهار… وحرارة الأخبار 🔥',
    subtitle: 'إليك آخر المستجدات حتى هذه اللحظة، باختصار لا يفوّت',
    topics: ['أخبار عاجلة', 'سياسة', 'رياضة'],
    source_articles: [],
    generated_by_ai: false,
    status: 'published',
    is_global: true,
    views: 89,
    interaction_count: 7,
    share_count: 2
  },
  
  // الجرعة المسائية
  {
    period: 'evening',
    title: 'مساؤك ذكاء واطّلاع 🌇',
    subtitle: 'إليك تحليلًا خفيفًا وذكيًا لأبرز قصص اليوم',
    topics: ['تحليلات', 'ثقافة', 'مجتمع'],
    source_articles: [],
    generated_by_ai: false,
    status: 'published',
    is_global: true,
    views: 203,
    interaction_count: 18,
    share_count: 5
  },
  
  // جرعة ما قبل النوم
  {
    period: 'night',
    title: 'قبل أن تنام… تعرف على ملخص اليوم 🌙',
    subtitle: '3 أخبار مختارة بعناية، خالية من الضجيج',
    topics: ['ملخص اليوم', 'أخبار هادئة', 'إيجابية'],
    source_articles: [],
    generated_by_ai: false,
    status: 'published',
    is_global: true,
    views: 67,
    interaction_count: 4,
    share_count: 1
  }
];

// قوالب للجرعات
const doseTemplates = [
  {
    period: 'morning',
    template_name: 'صباح النشاط والإلهام',
    main_text: 'صباح النشاط والإلهام ✨',
    sub_text: 'هذه 3 أخبار مُلهمة تستحق أن تبدأ بها يومك',
    priority: 1,
    created_by: 'admin'
  },
  {
    period: 'morning',
    template_name: 'مع قهوتك',
    main_text: 'مع قهوتك لا يفوتك 👀',
    sub_text: 'اطلع على أبرز قصص الأمس… باختصار ذكي وممتع',
    priority: 2,
    created_by: 'admin'
  },
  {
    period: 'noon',
    template_name: 'موجز منتصف اليوم',
    main_text: 'موجز منتصف اليوم ⚡️',
    sub_text: 'أخبار وتحليلات سريعة لتبقَ في قلب الحدث وأنت في زحمة اليوم',
    priority: 1,
    created_by: 'admin'
  },
  {
    period: 'evening',
    template_name: 'خلاصة المساء',
    main_text: 'خلاصة المساء 🔍',
    sub_text: 'أهم ما يمكن أن تعرفه قبل أن تُغلق دفاتر اليوم',
    priority: 1,
    created_by: 'admin'
  },
  {
    period: 'night',
    template_name: 'لأجل نوم هادئ',
    main_text: 'لأجل نوم هادئ 💤',
    sub_text: 'قصص قصيرة وتحليلات مريحة… تلائم هذا الوقت',
    priority: 1,
    created_by: 'admin'
  }
];

async function seedSmartDoses() {
  console.log('🧠 بدء إضافة بيانات الجرعات الذكية...');

  try {
    // البحث عن مستخدم admin
    const adminUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: 'admin@sabq.ai' },
          { role: 'admin' },
          { is_admin: true }
        ]
      }
    });

    if (!adminUser) {
      console.error('❌ لم يتم العثور على مستخدم admin. يرجى إنشاء مستخدم admin أولاً.');
      return;
    }

    console.log(`✅ تم العثور على المستخدم: ${adminUser.email}`);

    // إضافة الجرعات التجريبية
    console.log('📝 إضافة الجرعات التجريبية...');
    
    for (const dose of sampleDoses) {
      try {
        const createdDose = await prisma.daily_doses.create({
          data: {
            id: `dose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            period: dose.period,
            date: new Date(),
            title: dose.title,
            subtitle: dose.subtitle,
            topics: dose.topics,
            source_articles: dose.source_articles,
            generated_by_ai: dose.generated_by_ai,
            status: dose.status,
            is_global: dose.is_global,
            views: dose.views,
            interaction_count: dose.interaction_count,
            share_count: dose.share_count,
            created_by: adminUser.id,
            metadata: {
              seed_data: true,
              created_at: new Date().toISOString()
            },
            updatedAt: new Date()
          }
        });
        
        console.log(`  ✅ تمت إضافة جرعة ${dose.period}: ${dose.title.substring(0, 30)}...`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️  جرعة ${dose.period} موجودة مسبقاً، يتم التخطي...`);
        } else {
          console.error(`  ❌ خطأ في إضافة جرعة ${dose.period}:`, error.message);
        }
      }
    }

    // إضافة قوالب الجرعات
    console.log('📄 إضافة قوالب الجرعات...');
    
    for (const template of doseTemplates) {
      try {
        const createdTemplate = await prisma.smart_dose_templates.create({
          data: {
            period: template.period,
            template_name: template.template_name,
            main_text: template.main_text,
            sub_text: template.sub_text,
            priority: template.priority,
            created_by: adminUser.id
          }
        });
        
        console.log(`  ✅ تمت إضافة قالب: ${template.template_name}`);
      } catch (error) {
        console.error(`  ❌ خطأ في إضافة قالب ${template.template_name}:`, error.message);
      }
    }

    // إحصائيات
    const dosesCount = await prisma.daily_doses.count({
      where: { is_global: true }
    });
    
    const templatesCount = await prisma.smart_dose_templates.count();

    console.log('\n📊 الإحصائيات النهائية:');
    console.log(`  📝 عدد الجرعات: ${dosesCount}`);
    console.log(`  📄 عدد القوالب: ${templatesCount}`);
    console.log('\n🎉 تم إنشاء بيانات الجرعات الذكية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء بيانات الجرعات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
if (require.main === module) {
  seedSmartDoses();
}

module.exports = { seedSmartDoses };