#!/usr/bin/env node

/**
 * سكريبت إنشاء البيانات الأولية للكيانات الذكية
 * يحتوي على شخصيات سعودية ومؤسسات ومشاريع ومصطلحات
 */

const { PrismaClient } = require('../lib/generated/prisma');

async function seedSmartEntities() {
  const prisma = new PrismaClient();

  try {
    console.log('🚀 بدء إنشاء البيانات الأولية للكيانات الذكية...\n');

    // 1. إنشاء أنواع الكيانات
    console.log('📁 إنشاء أنواع الكيانات...');
    
    const entityTypes = [
      {
        id: 'person',
        name: 'person',
        name_ar: 'شخصية',
        description: 'شخصيات عامة ومسؤولين ومشاهير',
        icon: '👤',
        color: '#3B82F6'
      },
      {
        id: 'organization',
        name: 'organization',
        name_ar: 'مؤسسة',
        description: 'شركات ووزارات ومؤسسات حكومية وخاصة',
        icon: '🏢',
        color: '#10B981'
      },
      {
        id: 'project',
        name: 'project',
        name_ar: 'مشروع',
        description: 'مشاريع حكومية ومبادرات استراتيجية',
        icon: '🏗️',
        color: '#F59E0B'
      },
      {
        id: 'location',
        name: 'location',
        name_ar: 'موقع',
        description: 'مدن ومناطق ومعالم جغرافية',
        icon: '📍',
        color: '#EF4444'
      },
      {
        id: 'event',
        name: 'event',
        name_ar: 'حدث',
        description: 'فعاليات ومؤتمرات وقمم',
        icon: '📅',
        color: '#8B5CF6'
      },
      {
        id: 'term',
        name: 'term',
        name_ar: 'مصطلح',
        description: 'مصطلحات اقتصادية وسياسية وتقنية',
        icon: '📖',
        color: '#6B7280'
      }
    ];

    for (const type of entityTypes) {
      await prisma.entityTypes.upsert({
        where: { id: type.id },
        update: type,
        create: type
      });
    }

    console.log('✅ تم إنشاء أنواع الكيانات');

    // 2. إنشاء الشخصيات المهمة
    console.log('👥 إنشاء الشخصيات المهمة...');
    
    const persons = [
      {
        name: 'محمد بن سلمان',
        name_ar: 'محمد بن سلمان',
        name_en: 'Mohammed bin Salman',
        aliases: ['ولي العهد', 'الأمير محمد بن سلمان', 'MBS', 'ولي العهد السعودي'],
        entity_type_id: 'person',
        description: 'ولي العهد السعودي ورئيس مجلس الوزراء',
        category: 'ولي عهد',
        importance_score: 10,
        location: 'الرياض',
        country: 'SA',
        slug: 'mohammed-bin-salman',
        twitter_handle: '@MohammedAlSaud',
        official_website: 'https://www.spa.gov.sa'
      },
      {
        name: 'سلمان بن عبدالعزيز',
        name_ar: 'سلمان بن عبدالعزيز آل سعود',
        name_en: 'Salman bin Abdulaziz Al Saud',
        aliases: ['الملك سلمان', 'خادم الحرمين الشريفين', 'الملك'],
        entity_type_id: 'person',
        description: 'ملك المملكة العربية السعودية',
        category: 'ملك',
        importance_score: 10,
        location: 'الرياض',
        country: 'SA',
        slug: 'king-salman'
      },
      {
        name: 'محمد الجدعان',
        name_ar: 'محمد بن عبدالله الجدعان',
        name_en: 'Mohammed Al-Jadaan',
        aliases: ['وزير المالية', 'الجدعان'],
        entity_type_id: 'person',
        description: 'وزير المالية السعودي',
        category: 'وزير',
        importance_score: 8,
        location: 'الرياض',
        country: 'SA',
        slug: 'mohammed-aljadaan'
      }
    ];

    for (const person of persons) {
      await prisma.smartEntities.upsert({
        where: { slug: person.slug },
        update: person,
        create: person
      });
    }

    console.log('✅ تم إنشاء الشخصيات');

    // 3. إنشاء المؤسسات والشركات
    console.log('🏢 إنشاء المؤسسات...');
    
    const organizations = [
      {
        name: 'أرامكو السعودية',
        name_ar: 'أرامكو السعودية',
        name_en: 'Saudi Aramco',
        aliases: ['أرامكو', 'شركة أرامكو', 'Aramco'],
        entity_type_id: 'organization',
        description: 'أكبر شركة نفط في العالم',
        category: 'شركة نفط',
        importance_score: 9,
        location: 'الظهران',
        country: 'SA',
        slug: 'saudi-aramco',
        official_website: 'https://www.aramco.com'
      },
      {
        name: 'صندوق الاستثمارات العامة',
        name_ar: 'صندوق الاستثمارات العامة',
        name_en: 'Public Investment Fund',
        aliases: ['PIF', 'الصندوق السيادي', 'صندوق الاستثمارات'],
        entity_type_id: 'organization',
        description: 'الصندوق السيادي للمملكة العربية السعودية',
        category: 'صندوق استثماري',
        importance_score: 9,
        location: 'الرياض',
        country: 'SA',
        slug: 'pif',
        official_website: 'https://www.pif.gov.sa'
      },
      {
        name: 'وزارة الاستثمار',
        name_ar: 'وزارة الاستثمار',
        name_en: 'Ministry of Investment',
        aliases: ['MISA', 'وزارة الاستثمار السعودية'],
        entity_type_id: 'organization',
        description: 'وزارة الاستثمار في المملكة العربية السعودية',
        category: 'وزارة',
        importance_score: 7,
        location: 'الرياض',
        country: 'SA',
        slug: 'ministry-of-investment',
        official_website: 'https://www.misa.gov.sa'
      }
    ];

    for (const org of organizations) {
      await prisma.smartEntities.upsert({
        where: { slug: org.slug },
        update: org,
        create: org
      });
    }

    console.log('✅ تم إنشاء المؤسسات');

    // 4. إنشاء المشاريع الاستراتيجية
    console.log('🏗️ إنشاء المشاريع...');
    
    const projects = [
      {
        name: 'نيوم',
        name_ar: 'نيوم',
        name_en: 'NEOM',
        aliases: ['مشروع نيوم', 'مدينة نيوم', 'NEOM City'],
        entity_type_id: 'project',
        description: 'مدينة مستقبلية ذكية في شمال غرب السعودية',
        category: 'مدينة ذكية',
        importance_score: 9,
        location: 'تبوك',
        country: 'SA',
        slug: 'neom',
        official_website: 'https://www.neom.com'
      },
      {
        name: 'القدية',
        name_ar: 'القدية',
        name_en: 'Qiddiya',
        aliases: ['مشروع القدية', 'مدينة القدية'],
        entity_type_id: 'project',
        description: 'عاصمة الترفيه والرياضة والثقافة في السعودية',
        category: 'مدينة ترفيهية',
        importance_score: 8,
        location: 'الرياض',
        country: 'SA',
        slug: 'qiddiya',
        official_website: 'https://www.qiddiya.com'
      },
      {
        name: 'ذا لاين',
        name_ar: 'ذا لاين',
        name_en: 'The Line',
        aliases: ['مشروع الخط', 'المدينة الخطية'],
        entity_type_id: 'project',
        description: 'مدينة خطية ذكية ضمن مشروع نيوم',
        category: 'مدينة مستقبلية',
        importance_score: 8,
        location: 'نيوم',
        country: 'SA',
        slug: 'the-line'
      }
    ];

    for (const project of projects) {
      await prisma.smartEntities.upsert({
        where: { slug: project.slug },
        update: project,
        create: project
      });
    }

    console.log('✅ تم إنشاء المشاريع');

    // 5. إنشاء المواقع المهمة
    console.log('📍 إنشاء المواقع...');
    
    const locations = [
      {
        name: 'الرياض',
        name_ar: 'الرياض',
        name_en: 'Riyadh',
        aliases: ['العاصمة', 'مدينة الرياض'],
        entity_type_id: 'location',
        description: 'عاصمة المملكة العربية السعودية',
        category: 'عاصمة',
        importance_score: 10,
        location: 'الرياض',
        country: 'SA',
        slug: 'riyadh'
      },
      {
        name: 'جدة',
        name_ar: 'جدة',
        name_en: 'Jeddah',
        aliases: ['عروس البحر الأحمر', 'مدينة جدة'],
        entity_type_id: 'location',
        description: 'ثاني أكبر مدن السعودية وبوابة الحرمين',
        category: 'مدينة رئيسية',
        importance_score: 9,
        location: 'مكة المكرمة',
        country: 'SA',
        slug: 'jeddah'
      }
    ];

    for (const location of locations) {
      await prisma.smartEntities.upsert({
        where: { slug: location.slug },
        update: location,
        create: location
      });
    }

    console.log('✅ تم إنشاء المواقع');

    // 6. إنشاء المصطلحات الهامة
    console.log('📖 إنشاء المصطلحات...');
    
    const terms = [
      {
        term: 'رؤية السعودية 2030',
        term_ar: 'رؤية السعودية 2030',
        term_en: 'Saudi Vision 2030',
        definition: 'استراتيجية شاملة لتنويع الاقتصاد السعودي وتقليل الاعتماد على النفط',
        detailed_def: 'برنامج إصلاحي شامل يهدف إلى تنويع اقتصاد المملكة وتحويلها إلى قوة استثمارية عالمية',
        category: 'اقتصادي',
        synonyms: ['الرؤية', 'رؤية 2030', 'Vision 2030'],
        usage_count: 0,
        reference_url: 'https://www.vision2030.gov.sa'
      },
      {
        term: 'الناتج المحلي الإجمالي',
        term_ar: 'الناتج المحلي الإجمالي',
        term_en: 'Gross Domestic Product',
        definition: 'إجمالي قيمة السلع والخدمات المنتجة في بلد ما خلال فترة زمنية محددة',
        detailed_def: 'مؤشر اقتصادي يقيس إجمالي القيمة النقدية لجميع السلع والخدمات النهائية المنتجة داخل حدود بلد ما',
        category: 'اقتصادي',
        difficulty: 'medium',
        synonyms: ['GDP', 'الناتج المحلي', 'إجمالي الناتج المحلي'],
        usage_count: 0
      }
    ];

    for (const term of terms) {
      await prisma.smartTerms.upsert({
        where: { term: term.term },
        update: term,
        create: term
      });
    }

    console.log('✅ تم إنشاء المصطلحات');

    // 7. إنشاء بعض العلاقات بين الكيانات
    console.log('🔗 إنشاء العلاقات بين الكيانات...');
    
    // الحصول على الكيانات المنشأة للربط بينها
    const mbs = await prisma.smartEntities.findUnique({ where: { slug: 'mohammed-bin-salman' } });
    const pif = await prisma.smartEntities.findUnique({ where: { slug: 'pif' } });
    const neom = await prisma.smartEntities.findUnique({ where: { slug: 'neom' } });
    const riyadh = await prisma.smartEntities.findUnique({ where: { slug: 'riyadh' } });

    if (mbs && pif) {
      await prisma.entityLinks.upsert({
        where: {
          source_entity_id_target_entity_id_relationship_type: {
            source_entity_id: mbs.id,
            target_entity_id: pif.id,
            relationship_type: 'chairman_of'
          }
        },
        update: {},
        create: {
          source_entity_id: mbs.id,
          target_entity_id: pif.id,
          relationship_type: 'chairman_of',
          relationship_ar: 'رئيس مجلس إدارة',
          strength: 10
        }
      });
    }

    if (mbs && neom) {
      await prisma.entityLinks.upsert({
        where: {
          source_entity_id_target_entity_id_relationship_type: {
            source_entity_id: mbs.id,
            target_entity_id: neom.id,
            relationship_type: 'founder_of'
          }
        },
        update: {},
        create: {
          source_entity_id: mbs.id,
          target_entity_id: neom.id,
          relationship_type: 'founder_of',
          relationship_ar: 'مؤسس',
          strength: 9
        }
      });
    }

    if (mbs && riyadh) {
      await prisma.entityLinks.upsert({
        where: {
          source_entity_id_target_entity_id_relationship_type: {
            source_entity_id: mbs.id,
            target_entity_id: riyadh.id,
            relationship_type: 'located_in'
          }
        },
        update: {},
        create: {
          source_entity_id: mbs.id,
          target_entity_id: riyadh.id,
          relationship_type: 'located_in',
          relationship_ar: 'يقيم في',
          strength: 8
        }
      });
    }

    console.log('✅ تم إنشاء العلاقات');

    // عرض الإحصائيات النهائية
    const entityTypesCount = await prisma.entityTypes.count();
    const entitiesCount = await prisma.smartEntities.count();
    const termsCount = await prisma.smartTerms.count();
    const linksCount = await prisma.entityLinks.count();

    console.log('\n📊 إحصائيات البيانات المنشأة:');
    console.log(`   📁 أنواع الكيانات: ${entityTypesCount}`);
    console.log(`   🏷️ الكيانات: ${entitiesCount}`);
    console.log(`   📖 المصطلحات: ${termsCount}`);
    console.log(`   🔗 العلاقات: ${linksCount}`);

    console.log('\n🎉 تم إنشاء جميع البيانات الأولية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSmartEntities(); 