const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBrokenSlugs() {
  try {
    console.log('�� إصلاح البروفايلات المعطلة...');
    
    // البحث عن البروفايلات مع slugs معطلة
    const brokenProfiles = await prisma.reporters.findMany({
      where: {
        OR: [
          { slug: 'a' },
          { slug: 'h' },
          { slug: { equals: '' } }
        ]
      },
      select: {
        id: true,
        full_name: true,
        slug: true
      }
    });
    
    console.log(`📊 وجدت ${brokenProfiles.length} بروفايل معطل\n`);
    
    for (const profile of brokenProfiles) {
      const timestamp = Date.now().toString().slice(-6);
      let newSlug = '';
      
      if (profile.full_name.includes('أحمد محمد')) {
        newSlug = `ahmed-mohammed-${timestamp}`;
      } else if (profile.full_name.includes('فاطمة علي')) {
        newSlug = `fatima-ali-${timestamp}`;
      } else if (profile.full_name.includes('عمر النجار')) {
        newSlug = `omar-najjar-${timestamp}`;
      } else {
        newSlug = `reporter-${timestamp}`;
      }
      
      await prisma.reporters.update({
        where: { id: profile.id },
        data: { slug: newSlug }
      });
      
      console.log(`✅ تم إصلاح: ${profile.full_name} -> ${newSlug}`);
    }
    
    console.log('\n📋 جميع البروفايلات الآن:');
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
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixBrokenSlugs();
