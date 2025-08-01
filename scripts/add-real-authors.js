const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const realAuthors = [
  {
    full_name: 'محمد العتيبي',
    slug: 'mohammed-otaibi',
    title: 'مراسل أول',
    bio: 'مراسل أول متخصص في الأخبار السياسية والاقتصادية مع خبرة تزيد عن 10 سنوات في الصحافة السعودية',
    email: 'mohammed.otaibi@sabq.me',
    avatar_url: '/uploads/authors/mohammed-otaibi.jpg',
    social_links: {
      twitter: '@m_otaibi',
      linkedin: 'mohammed-otaibi'
    },
    specializations: ['السياسة', 'الاقتصاد', 'الأخبار المحلية'],
    is_active: true,
    role: 'senior_writer'
  },
  {
    full_name: 'فاطمة الزهراني',
    slug: 'fatima-alzahrani',
    title: 'محررة الأخبار الثقافية',
    bio: 'محررة متخصصة في الأخبار الثقافية والفنية والتراث السعودي',
    email: 'fatima.alzahrani@sabq.me',
    avatar_url: '/uploads/authors/fatima-alzahrani.jpg',
    social_links: {
      twitter: '@f_alzahrani',
      instagram: 'fatima.culture'
    },
    specializations: ['الثقافة', 'الفنون', 'التراث'],
    is_active: true,
    role: 'culture_editor'
  },
  {
    full_name: 'أحمد السعيد',
    slug: 'ahmed-alsaeed',
    title: 'مراسل رياضي',
    bio: 'مراسل متخصص في الأخبار الرياضية والبطولات المحلية والدولية',
    email: 'ahmed.alsaeed@sabq.me',
    avatar_url: '/uploads/authors/ahmed-alsaeed.jpg',
    social_links: {
      twitter: '@a_alsaeed_sport',
      youtube: 'ahmed-sports'
    },
    specializations: ['الرياضة', 'كرة القدم', 'البطولات'],
    is_active: true,
    role: 'sports_writer'
  },
  {
    full_name: 'نورا المطيري',
    slug: 'nora-almutairi',
    title: 'محررة الأخبار التقنية',
    bio: 'محررة متخصصة في أخبار التقنية والذكاء الاصطناعي والتطورات الرقمية',
    email: 'nora.almutairi@sabq.me',
    avatar_url: '/uploads/authors/nora-almutairi.jpg',
    social_links: {
      twitter: '@nora_tech',
      linkedin: 'nora-almutairi-tech'
    },
    specializations: ['التقنية', 'الذكاء الاصطناعي', 'التطبيقات'],
    is_active: true,
    role: 'tech_editor'
  },
  {
    full_name: 'خالد الغامدي',
    slug: 'khalid-alghamdi',
    title: 'مراسل الأخبار العامة',
    bio: 'مراسل شامل يغطي مختلف أنواع الأخبار المحلية والعامة',
    email: 'khalid.alghamdi@sabq.me',
    avatar_url: '/uploads/authors/khalid-alghamdi.jpg',
    social_links: {
      twitter: '@k_alghamdi',
      telegram: '@khalid_news'
    },
    specializations: ['الأخبار العامة', 'التقارير المحلية', 'المتابعة'],
    is_active: true,
    role: 'general_writer'
  }
];

async function addRealAuthors() {
  console.log('📝 إضافة مؤلفين حقيقيين لقاعدة البيانات...\n');
  
  try {
    // حذف المؤلفين الوهميين إن وجدوا
    console.log('🗑️ حذف المؤلفين الوهميين...');
    await prisma.article_authors.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test@' } },
          { email: { contains: 'example.com' } },
          { full_name: { contains: 'Test' } },
          { full_name: { contains: 'تجريبي' } }
        ]
      }
    });
    
    console.log('✅ تم حذف المؤلفين الوهميين\n');
    
    // إضافة المؤلفين الحقيقيين
    for (const author of realAuthors) {
      try {
        // التحقق من وجود المؤلف
        const existing = await prisma.article_authors.findFirst({
          where: {
            OR: [
              { email: author.email },
              { slug: author.slug }
            ]
          }
        });
        
        if (existing) {
          console.log(`⚠️ المؤلف موجود بالفعل: ${author.full_name}`);
          // تحديث بيانات المؤلف الموجود
          await prisma.article_authors.update({
            where: { id: existing.id },
            data: {
              ...author,
              id: existing.id, // الحفاظ على نفس المعرف
              updated_at: new Date()
            }
          });
          console.log(`✅ تم تحديث بيانات: ${author.full_name}`);
        } else {
          // إنشاء مؤلف جديد
          const newAuthor = await prisma.article_authors.create({
            data: {
              ...author,
              id: `author_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              total_articles: 0,
              total_views: 0,
              total_likes: 0,
              total_shares: 0,
              ai_score: 0.0,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          console.log(`✅ تم إنشاء مؤلف جديد: ${author.full_name} (${newAuthor.id})`);
        }
      } catch (authorError) {
        console.error(`❌ خطأ في معالجة المؤلف ${author.full_name}:`, authorError.message);
      }
    }
    
    // عرض النتيجة النهائية
    console.log('\n📊 ملخص النتائج:');
    const totalAuthors = await prisma.article_authors.count({
      where: { is_active: true }
    });
    
    console.log(`✅ إجمالي المؤلفين النشطين: ${totalAuthors}`);
    
    const activeAuthors = await prisma.article_authors.findMany({
      where: { is_active: true },
      select: { full_name: true, title: true, email: true }
    });
    
    console.log('\n📋 قائمة المؤلفين النشطين:');
    activeAuthors.forEach((author, index) => {
      console.log(`   ${index + 1}. ${author.full_name} - ${author.title || 'مؤلف'} (${author.email})`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في إضافة المؤلفين:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addRealAuthors();
}

module.exports = { addRealAuthors };