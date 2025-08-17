const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// دالة توليد slug من الاسم
function generateSlug(name) {
  const timestamp = Date.now().toString().slice(-6);
  const baseSlug = name
    .replace(/أحمد/g, 'ahmed')
    .replace(/محمد/g, 'mohammed')
    .replace(/فاطمة/g, 'fatima')
    .replace(/علي/g, 'ali')
    .replace(/نورا/g, 'nora')
    .replace(/عمر/g, 'omar')
    .replace(/النجار/g, 'najjar')
    .replace(/عبدالله/g, 'abdullah')
    .replace(/البرقاوي/g, 'barqawi')
    .replace(/الحازمي/g, 'alhazmi')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^\w\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return baseSlug ? `${baseSlug}-${timestamp}` : `reporter-${timestamp}`;
}

// دالة توليد bio افتراضي
function generateDefaultBio(name) {
  return `${name} - مراسل في صحيفة سبق الإلكترونية، متخصص في تغطية الأخبار المحلية والأحداث المهمة.`;
}

async function createReporterProfiles() {
  try {
    console.log('📝 إنشاء بروفايلات للمراسلين...\n');
    
    // جلب المراسلين من team_members
    const teamReporters = await prisma.team_members.findMany({
      where: { role: 'reporter' },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        is_active: true,
        created_at: true
      }
    });
    
    console.log(`📊 سنقوم بإنشاء ${teamReporters.length} بروفايل...\n`);
    
    let createdCount = 0;
    
    for (const reporter of teamReporters) {
      try {
        const slug = generateSlug(reporter.name);
        const bio = reporter.bio || generateDefaultBio(reporter.name);
        
        // إنشاء user أولاً إذا لم يكن موجود
        let user = await prisma.users.findUnique({
          where: { email: reporter.email }
        });
        
        if (!user) {
          user = await prisma.users.create({
            data: {
              id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: reporter.name,
              email: reporter.email,
              role: 'reporter',
              is_active: reporter.is_active,
              created_at: reporter.created_at || new Date()
            }
          });
          console.log(`✅ تم إنشاء مستخدم: ${user.name}`);
        }
        
        // إنشاء بروفايل المراسل
        const reporterProfile = await prisma.reporters.create({
          data: {
            user_id: user.id,
            full_name: reporter.name,
            slug: slug,
            title: 'مراسل',
            bio: bio,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(reporter.name)}&background=3b82f6&color=fff&size=200`,
            is_verified: true,
            verification_badge: 'verified',
            specializations: ['أخبار محلية', 'تقارير إخبارية'],
            coverage_areas: ['المملكة العربية السعودية'],
            languages: ['ar'],
            email_public: reporter.email,
            total_articles: 0,
            total_views: 0,
            total_likes: 0,
            total_shares: 0,
            avg_reading_time: 3.0,
            engagement_rate: 0.0,
            popular_topics: ['أخبار محلية'],
            is_active: reporter.is_active,
            show_stats: true,
            show_contact: true,
            display_order: createdCount + 1
          }
        });
        
        console.log(`✅ تم إنشاء بروفايل: ${reporterProfile.full_name} (${reporterProfile.slug})`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ فشل إنشاء بروفايل ${reporter.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 تم إنشاء ${createdCount} بروفايل بنجاح!`);
    console.log('\n📝 البروفايلات المتاحة الآن:');
    
    const allProfiles = await prisma.reporters.findMany({
      select: {
        full_name: true,
        slug: true,
        is_active: true
      },
      orderBy: { display_order: 'asc' }
    });
    
    allProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name}`);
      console.log(`   الرابط: /reporter/${profile.slug}`);
      console.log(`   نشط: ${profile.is_active ? 'نعم' : 'لا'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createReporterProfiles();
