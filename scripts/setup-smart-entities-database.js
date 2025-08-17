/**
 * إعداد قاعدة البيانات للكيانات الذكية ونظام الروابط المتقدم
 * يضيف الجداول المطلوبة والبيانات الأولية
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ENTITY_TYPES = [
  { id: 'person', name: 'person', name_ar: 'شخص', icon: '👤', color: '#3B82F6', description: 'أشخاص مهمون وشخصيات عامة' },
  { id: 'organization', name: 'organization', name_ar: 'منظمة', icon: '🏛️', color: '#10B981', description: 'منظمات ومؤسسات' },
  { id: 'location', name: 'location', name_ar: 'مكان', icon: '📍', color: '#F59E0B', description: 'أماكن ومدن ودول' },
  { id: 'project', name: 'project', name_ar: 'مشروع', icon: '🏗️', color: '#8B5CF6', description: 'مشاريع ومبادرات' },
  { id: 'event', name: 'event', name_ar: 'حدث', icon: '📅', color: '#EF4444', description: 'أحداث مهمة وفعاليات' },
  { id: 'term', name: 'term', name_ar: 'مصطلح', icon: '📚', color: '#06B6D4', description: 'مصطلحات تقنية واقتصادية' },
  { id: 'company', name: 'company', name_ar: 'شركة', icon: '🏢', color: '#059669', description: 'شركات ومؤسسات تجارية' },
  { id: 'government', name: 'government', name_ar: 'حكومة', icon: '🏛️', color: '#DC2626', description: 'جهات حكومية ووزارات' }
];

const SMART_ENTITIES = [
  // شخصيات مهمة
  {
    name: 'محمد بن سلمان آل سعود',
    name_ar: 'محمد بن سلمان آل سعود',
    name_en: 'Mohammed bin Salman Al Saud',
    entity_type_id: 'person',
    description: 'ولي العهد نائب رئيس مجلس الوزراء وزير الدفاع في المملكة العربية السعودية',
    importance_score: 10,
    slug: 'mohammed-bin-salman',
    aliases: ['محمد بن سلمان', 'ولي العهد', 'الأمير محمد بن سلمان'],
    official_website: 'https://www.spa.gov.sa',
    location: 'الرياض',
    country: 'SA',
    birth_date: new Date('1985-08-31')
  },
  {
    name: 'سلمان بن عبد العزيز آل سعود',
    name_ar: 'سلمان بن عبد العزيز آل سعود',
    name_en: 'Salman bin Abdulaziz Al Saud',
    entity_type_id: 'person',
    description: 'خادم الحرمين الشريفين ملك المملكة العربية السعودية',
    importance_score: 10,
    slug: 'king-salman',
    aliases: ['الملك سلمان', 'خادم الحرمين الشريفين'],
    official_website: 'https://www.spa.gov.sa',
    location: 'الرياض',
    country: 'SA'
  },
  
  // منظمات ومؤسسات
  {
    name: 'صندوق الاستثمارات العامة',
    name_ar: 'صندوق الاستثمارات العامة',
    name_en: 'Public Investment Fund',
    entity_type_id: 'organization',
    description: 'الصندوق السيادي للمملكة العربية السعودية',
    importance_score: 9,
    slug: 'pif-saudi',
    aliases: ['PIF', 'صندوق الاستثمارات', 'الصندوق السيادي'],
    official_website: 'https://www.pif.gov.sa',
    location: 'الرياض',
    country: 'SA'
  },
  {
    name: 'أرامكو السعودية',
    name_ar: 'أرامكو السعودية',
    name_en: 'Saudi Aramco',
    entity_type_id: 'company',
    description: 'شركة النفط والغاز الوطنية السعودية',
    importance_score: 9,
    slug: 'saudi-aramco',
    aliases: ['أرامكو', 'Aramco', 'الشركة السعودية للنفط'],
    official_website: 'https://www.aramco.com',
    location: 'الظهران',
    country: 'SA'
  },
  
  // مشاريع ومبادرات
  {
    name: 'رؤية 2030',
    name_ar: 'رؤية 2030',
    name_en: 'Vision 2030',
    entity_type_id: 'project',
    description: 'برنامج الإصلاحات الاقتصادية والاجتماعية في المملكة العربية السعودية',
    importance_score: 10,
    slug: 'vision-2030',
    aliases: ['رؤية المملكة 2030', 'Vision 2030', 'رؤية السعودية'],
    official_website: 'https://www.vision2030.gov.sa',
    location: 'المملكة العربية السعودية',
    country: 'SA',
    start_date: new Date('2016-04-25')
  },
  {
    name: 'نيوم',
    name_ar: 'نيوم',
    name_en: 'NEOM',
    entity_type_id: 'project',
    description: 'مشروع مدينة المستقبل في شمال غرب المملكة العربية السعودية',
    importance_score: 9,
    slug: 'neom',
    aliases: ['NEOM', 'مدينة نيوم', 'مشروع نيوم'],
    official_website: 'https://www.neom.com',
    location: 'تبوك',
    country: 'SA'
  },
  
  // أماكن
  {
    name: 'الرياض',
    name_ar: 'الرياض',
    name_en: 'Riyadh',
    entity_type_id: 'location',
    description: 'عاصمة المملكة العربية السعودية',
    importance_score: 9,
    slug: 'riyadh',
    aliases: ['العاصمة', 'مدينة الرياض'],
    location: 'الرياض',
    country: 'SA'
  },
  {
    name: 'مكة المكرمة',
    name_ar: 'مكة المكرمة',
    name_en: 'Mecca',
    entity_type_id: 'location',
    description: 'المدينة المقدسة وقبلة المسلمين',
    importance_score: 10,
    slug: 'mecca',
    aliases: ['مكة', 'بيت الله الحرام', 'الحرم المكي'],
    location: 'مكة المكرمة',
    country: 'SA'
  }
];

const SMART_TERMS = [
  {
    term_ar: 'التحول الرقمي',
    term_en: 'Digital Transformation',
    definition: 'عملية دمج التكنولوجيا الرقمية في جميع مجالات الأعمال',
    detailed_def: 'التحول الرقمي هو عملية شاملة لتغيير طريقة عمل المنظمات من خلال اعتماد التكنولوجيا الرقمية الحديثة لتحسين العمليات وتعزيز تجربة العملاء وزيادة الكفاءة.',
    category: 'تقني',
    difficulty: 'medium',
    synonyms: ['الرقمنة', 'التحول التقني', 'Digital Transformation'],
    reference_url: 'https://www.mcit.gov.sa'
  },
  {
    term_ar: 'الذكاء الاصطناعي',
    term_en: 'Artificial Intelligence',
    definition: 'تقنية تحاكي الذكاء البشري في الآلات والحاسوب',
    detailed_def: 'الذكاء الاصطناعي هو فرع من علوم الحاسوب يهدف إلى إنشاء أنظمة قادرة على أداء مهام تتطلب ذكاءً بشرياً مثل التعلم والتفكير واتخاذ القرارات.',
    category: 'تقني',
    difficulty: 'hard',
    synonyms: ['AI', 'الذكاء الصناعي', 'Machine Learning'],
    reference_url: 'https://sdaia.gov.sa'
  },
  {
    term_ar: 'الناتج المحلي الإجمالي',
    term_en: 'Gross Domestic Product',
    definition: 'إجمالي قيمة السلع والخدمات المنتجة في دولة خلال فترة محددة',
    detailed_def: 'الناتج المحلي الإجمالي هو مقياس اقتصادي يحسب إجمالي القيمة النقدية لجميع السلع والخدمات النهائية المنتجة داخل حدود دولة في فترة زمنية معينة، عادة سنة واحدة.',
    category: 'اقتصادي',
    difficulty: 'medium',
    synonyms: ['GDP', 'الناتج المحلي', 'إجمالي الناتج المحلي'],
    reference_url: 'https://www.stats.gov.sa'
  },
  {
    term_ar: 'الطاقة المتجددة',
    term_en: 'Renewable Energy',
    definition: 'طاقة مستمدة من موارد طبيعية تتجدد باستمرار',
    detailed_def: 'الطاقة المتجددة هي الطاقة المستمدة من الموارد الطبيعية التي تتجدد بمعدل أسرع من استهلاكها، مثل أشعة الشمس والرياح والمياه.',
    category: 'بيئي',
    difficulty: 'easy',
    synonyms: ['الطاقة النظيفة', 'الطاقة المستدامة', 'Green Energy'],
    reference_url: 'https://www.energy.gov.sa'
  }
];

async function createEntityTypes() {
  console.log('🏗️ إنشاء أنواع الكيانات...');
  
  for (const entityType of ENTITY_TYPES) {
    try {
      await prisma.smartEntityTypes.upsert({
        where: { id: entityType.id },
        update: entityType,
        create: entityType,
      });
      console.log(`✅ تم إنشاء نوع الكيان: ${entityType.name_ar}`);
    } catch (error) {
      console.error(`❌ خطأ في إنشاء نوع الكيان ${entityType.name_ar}:`, error.message);
    }
  }
}

async function createSmartEntities() {
  console.log('🧠 إنشاء الكيانات الذكية...');
  
  for (const entity of SMART_ENTITIES) {
    try {
      const createdEntity = await prisma.smartEntities.create({
        data: {
          ...entity,
          aliases: entity.aliases || []
        }
      });
      console.log(`✅ تم إنشاء الكيان: ${entity.name_ar}`);
    } catch (error) {
      console.error(`❌ خطأ في إنشاء الكيان ${entity.name_ar}:`, error.message);
    }
  }
}

async function createSmartTerms() {
  console.log('📚 إنشاء المصطلحات الذكية...');
  
  for (const term of SMART_TERMS) {
    try {
      await prisma.smartTerms.create({
        data: term
      });
      console.log(`✅ تم إنشاء المصطلح: ${term.term_ar}`);
    } catch (error) {
      console.error(`❌ خطأ في إنشاء المصطلح ${term.term_ar}:`, error.message);
    }
  }
}

async function createEntityRelationships() {
  console.log('🔗 إنشاء العلاقات بين الكيانات...');
  
  const relationships = [
    {
      sourceSlug: 'mohammed-bin-salman',
      targetSlug: 'pif-saudi',
      relationship_type: 'chairs',
      relationship_ar: 'يترأس',
      strength: 10
    },
    {
      sourceSlug: 'mohammed-bin-salman',
      targetSlug: 'vision-2030',
      relationship_type: 'leads',
      relationship_ar: 'يقود',
      strength: 10
    },
    {
      sourceSlug: 'pif-saudi',
      targetSlug: 'neom',
      relationship_type: 'funds',
      relationship_ar: 'يمول',
      strength: 9
    },
    {
      sourceSlug: 'saudi-aramco',
      targetSlug: 'riyadh',
      relationship_type: 'headquartered_in',
      relationship_ar: 'مقره في',
      strength: 8
    }
  ];

  for (const rel of relationships) {
    try {
      const sourceEntity = await prisma.smartEntities.findFirst({
        where: { slug: rel.sourceSlug }
      });
      const targetEntity = await prisma.smartEntities.findFirst({
        where: { slug: rel.targetSlug }
      });

      if (sourceEntity && targetEntity) {
        await prisma.entityLinks.create({
          data: {
            source_entity_id: sourceEntity.id,
            target_entity_id: targetEntity.id,
            relationship_type: rel.relationship_type,
            relationship_ar: rel.relationship_ar,
            strength: rel.strength
          }
        });
        console.log(`✅ تم إنشاء العلاقة: ${sourceEntity.name_ar} ${rel.relationship_ar} ${targetEntity.name_ar}`);
      }
    } catch (error) {
      console.error(`❌ خطأ في إنشاء العلاقة:`, error.message);
    }
  }
}

async function setupSmartEntitiesDatabase() {
  console.log('🚀 بدء إعداد قاعدة البيانات للكيانات الذكية...\n');

  try {
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // إنشاء أنواع الكيانات
    await createEntityTypes();
    console.log('');

    // إنشاء الكيانات
    await createSmartEntities();
    console.log('');

    // إنشاء المصطلحات
    await createSmartTerms();
    console.log('');

    // إنشاء العلاقات
    await createEntityRelationships();
    console.log('');

    // إحصائيات نهائية
    const entityTypesCount = await prisma.smartEntityTypes.count();
    const entitiesCount = await prisma.smartEntities.count();
    const termsCount = await prisma.smartTerms.count();
    const relationshipsCount = await prisma.entityLinks.count();

    console.log('📊 إحصائيات نهائية:');
    console.log(`   🏷️ أنواع الكيانات: ${entityTypesCount}`);
    console.log(`   🧠 الكيانات: ${entitiesCount}`);
    console.log(`   📚 المصطلحات: ${termsCount}`);
    console.log(`   🔗 العلاقات: ${relationshipsCount}`);
    
    console.log('\n🎉 تم إعداد قاعدة البيانات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإعداد
setupSmartEntitiesDatabase().catch(console.error);