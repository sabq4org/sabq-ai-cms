const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SAMPLE_REPORTERS = [
  {
    user_id: 'user1', // يجب أن يكون معرف مستخدم موجود
    full_name: 'أحمد محمد حسن',
    slug: 'ahmed-hassan',
    title: 'مراسل ميداني - المنطقة الشرقية',
    bio: 'مراسل صحفي متخصص في تغطية الأحداث الاقتصادية والاجتماعية في المنطقة الشرقية. خبرة 8 سنوات في الصحافة الاستقصائية والتحقيقات الميدانية.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    verification_badge: 'verified',
    specializations: ['اقتصاد', 'أخبار محلية', 'تحقيقات'],
    coverage_areas: ['المنطقة الشرقية', 'الدمام', 'الخبر'],
    languages: ['ar', 'en'],
    twitter_url: 'https://twitter.com/ahmed_hassan',
    linkedin_url: 'https://linkedin.com/in/ahmed-hassan',
    email_public: 'ahmed.hassan@sabq.me',
    show_stats: true,
    show_contact: true,
    total_articles: 145,
    total_views: 285000,
    total_likes: 12500,
    total_shares: 3200,
    engagement_rate: 0.055
  },
  {
    user_id: 'user2',
    full_name: 'فاطمة أحمد الزهراني',
    slug: 'fatima-alzahrani',
    title: 'محررة اقتصادية',
    bio: 'محررة متخصصة في الشؤون الاقتصادية والمالية. حاصلة على ماجستير في الاقتصاد من جامعة الملك سعود. تركز على تحليل الأسواق المالية والسياسات الاقتصادية.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b381f46d?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    verification_badge: 'expert',
    specializations: ['اقتصاد', 'أسواق مالية', 'تحليل اقتصادي'],
    coverage_areas: ['المملكة', 'الخليج العربي', 'الأسواق العالمية'],
    languages: ['ar', 'en'],
    website_url: 'https://fatima-alzahrani.com',
    email_public: 'fatima.alzahrani@sabq.me',
    show_stats: true,
    show_contact: false,
    total_articles: 89,
    total_views: 420000,
    total_likes: 18900,
    total_shares: 5600,
    engagement_rate: 0.058
  },
  {
    user_id: 'user3',
    full_name: 'عبدالرحمن سالم القحطاني',
    slug: 'abdulrahman-alqahtani',
    title: 'مراسل رياضي',
    bio: 'مراسل رياضي متخصص في تغطية الدوري السعودي وكرة القدم الآسيوية. خبرة واسعة في تغطية البطولات الكبرى والأحداث الرياضية المحلية والإقليمية.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    verification_badge: 'verified',
    specializations: ['رياضة', 'كرة قدم', 'بطولات محلية'],
    coverage_areas: ['الرياض', 'جدة', 'الدمام'],
    languages: ['ar'],
    twitter_url: 'https://twitter.com/sports_reporter',
    show_stats: true,
    show_contact: true,
    total_articles: 203,
    total_views: 156000,
    total_likes: 8900,
    total_shares: 2100,
    engagement_rate: 0.071
  },
  {
    user_id: 'user4',
    full_name: 'سارة عبدالله النمر',
    slug: 'sara-alnimer',
    title: 'محررة تقنية',
    bio: 'صحفية متخصصة في التكنولوجيا والابتكار. تغطي أخبار التقنية في المملكة والشرق الأوسط مع التركيز على الذكاء الاصطناعي والتحول الرقمي.',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    verification_badge: 'expert',
    specializations: ['تقنية', 'ذكاء اصطناعي', 'تحول رقمي'],
    coverage_areas: ['الرياض', 'وادي السليكون', 'دولي'],
    languages: ['ar', 'en'],
    linkedin_url: 'https://linkedin.com/in/sara-alnimer',
    website_url: 'https://techreporter.me',
    show_stats: true,
    show_contact: false,
    total_articles: 67,
    total_views: 178000,
    total_likes: 15600,
    total_shares: 4200,
    engagement_rate: 0.111
  },
  {
    user_id: 'user5',
    full_name: 'محمد عبدالعزيز الشهري',
    slug: 'mohammed-alshehri',
    title: 'محرر أول - السياسة',
    bio: 'محرر سياسي أول بخبرة تزيد عن 15 عاماً في تغطية الشؤون السياسية المحلية والإقليمية. متخصص في تحليل السياسات الحكومية والعلاقات الدولية.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    is_verified: true,
    verification_badge: 'senior',
    specializations: ['سياسة', 'علاقات دولية', 'تحليل سياسي'],
    coverage_areas: ['المملكة', 'الخليج العربي', 'العالم العربي'],
    languages: ['ar', 'en', 'fr'],
    twitter_url: 'https://twitter.com/political_analyst',
    linkedin_url: 'https://linkedin.com/in/mohammed-alshehri',
    show_stats: true,
    show_contact: false,
    total_articles: 312,
    total_views: 890000,
    total_likes: 45600,
    total_shares: 12800,
    engagement_rate: 0.066
  }
];

async function seedReporters() {
  console.log('🌱 بدء إنشاء بيانات المراسلين التجريبية...');

  try {
    // التحقق من وجود المستخدمين أولاً
    const existingUsers = await prisma.users.findMany({
      select: { id: true, email: true, name: true }
    });

    console.log(`📋 تم العثور على ${existingUsers.length} مستخدماً في قاعدة البيانات`);

    if (existingUsers.length === 0) {
      console.log('⚠️  لا توجد مستخدمين في قاعدة البيانات. سيتم إنشاء مستخدمين تجريبيين...');
      
      // إنشاء مستخدمين تجريبيين
      const sampleUsers = [
        {
          id: 'user1',
          email: 'ahmed.hassan@sabq.me',
          name: 'أحمد محمد حسن',
          role: 'reporter',
          is_verified: true
        },
        {
          id: 'user2',
          email: 'fatima.alzahrani@sabq.me',
          name: 'فاطمة أحمد الزهراني',
          role: 'editor',
          is_verified: true
        },
        {
          id: 'user3',
          email: 'abdulrahman.alqahtani@sabq.me',
          name: 'عبدالرحمن سالم القحطاني',
          role: 'reporter',
          is_verified: true
        },
        {
          id: 'user4',
          email: 'sara.alnimer@sabq.me',
          name: 'سارة عبدالله النمر',
          role: 'editor',
          is_verified: true
        },
        {
          id: 'user5',
          email: 'mohammed.alshehri@sabq.me',
          name: 'محمد عبدالعزيز الشهري',
          role: 'senior_editor',
          is_verified: true
        }
      ];

      for (const user of sampleUsers) {
        await prisma.users.upsert({
          where: { id: user.id },
          create: user,
          update: {}
        });
      }

      console.log('✅ تم إنشاء المستخدمين التجريبيين');
    }

    // إنشاء بروفايلات المراسلين
    console.log('👤 بدء إنشاء بروفايلات المراسلين...');

    for (const [index, reporterData] of SAMPLE_REPORTERS.entries()) {
      try {
        const existingReporter = await prisma.reporters.findUnique({
          where: { slug: reporterData.slug }
        });

        if (existingReporter) {
          console.log(`⏭️  المراسل ${reporterData.full_name} موجود بالفعل، سيتم تحديثه...`);
          
          await prisma.reporters.update({
            where: { slug: reporterData.slug },
            data: {
              ...reporterData,
              specializations: JSON.stringify(reporterData.specializations),
              coverage_areas: JSON.stringify(reporterData.coverage_areas),
              languages: JSON.stringify(reporterData.languages),
              popular_topics: JSON.stringify([
                'تحديثات اقتصادية',
                'أخبار محلية',
                'تحليلات سياسية',
                'تقارير ميدانية'
              ]),
              writing_style: JSON.stringify({
                tone: 'professional',
                avg_word_count: 450,
                preferred_topics: reporterData.specializations,
                writing_frequency: 'daily'
              }),
              publication_pattern: JSON.stringify({
                best_times: ['09:00', '14:00', '20:00'],
                best_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
                avg_per_week: 5
              }),
              reader_demographics: JSON.stringify({
                age_groups: { '25-34': 35, '35-44': 28, '45-54': 22, '18-24': 15 },
                gender: { male: 60, female: 40 },
                locations: ['saudi_arabia', 'gcc', 'mena']
              })
            }
          });
        } else {
          await prisma.reporters.create({
            data: {
              ...reporterData,
              specializations: JSON.stringify(reporterData.specializations),
              coverage_areas: JSON.stringify(reporterData.coverage_areas),
              languages: JSON.stringify(reporterData.languages),
              popular_topics: JSON.stringify([
                'تحديثات اقتصادية',
                'أخبار محلية',
                'تحليلات سياسية',
                'تقارير ميدانية'
              ]),
              writing_style: JSON.stringify({
                tone: 'professional',
                avg_word_count: 450,
                preferred_topics: reporterData.specializations,
                writing_frequency: 'daily'
              }),
              publication_pattern: JSON.stringify({
                best_times: ['09:00', '14:00', '20:00'],
                best_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
                avg_per_week: 5
              }),
              reader_demographics: JSON.stringify({
                age_groups: { '25-34': 35, '35-44': 28, '45-54': 22, '18-24': 15 },
                gender: { male: 60, female: 40 },
                locations: ['saudi_arabia', 'gcc', 'mena']
              })
            }
          });
        }

        console.log(`✅ تم إنشاء/تحديث بروفايل: ${reporterData.full_name}`);
      } catch (error) {
        console.error(`❌ خطأ في إنشاء بروفايل ${reporterData.full_name}:`, error.message);
      }
    }

    console.log('\n🎉 تم إنشاء بيانات المراسلين التجريبية بنجاح!');
    
    // إحصائيات سريعة
    const totalReporters = await prisma.reporters.count();
    const verifiedReporters = await prisma.reporters.count({
      where: { is_verified: true }
    });

    console.log(`\n📊 الإحصائيات:`);
    console.log(`   إجمالي المراسلين: ${totalReporters}`);
    console.log(`   المراسلين المعتمدين: ${verifiedReporters}`);
    console.log(`   التخصصات المتاحة: اقتصاد، رياضة، تقنية، سياسة، أخبار محلية`);
    
    console.log('\n🔗 يمكنك الآن زيارة:');
    console.log('   - لوحة التحكم: /admin/reporters');
    console.log('   - بروفايل مراسل: /reporter/ahmed-hassan');
    console.log('   - بروفايل مراسل: /reporter/fatima-alzahrani');

  } catch (error) {
    console.error('❌ خطأ في إنشاء بيانات المراسلين:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
seedReporters().catch(console.error);