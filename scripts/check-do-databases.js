const { PrismaClient } = require('../lib/generated/prisma/index');

// Connection URLs
const connections = {
  'Connection Pool (defaultdb)': 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25060/defaultdb?sslmode=require',
  'Private (sabq_app_pool)': 'postgresql://doadmin:AVNS_Br4uKMaWR6wxTIpZ7xj@private-db-sabq-ai-1755-do-user-23559731-0.m.db.ondigitalocean.com:25061/sabq_app_pool?sslmode=require'
};

async function checkDatabase(name, url) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`التحقق من: ${name}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: url
        }
      }
    });

    // عد المستخدمين
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: {
          select: {
            name: true
          }
        }
      },
      take: 5
    });
    const userCount = await prisma.user.count();
    
    console.log(`\n✅ المستخدمون: ${userCount}`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - ${u.role?.name || 'لا يوجد دور'}`);
    });
    
    // عد المقالات
    const articleCount = await prisma.article.count();
    const publishedCount = await prisma.article.count({
      where: { status: 'published' }
    });
    
    console.log(`\n✅ المقالات: ${articleCount} (${publishedCount} منشور)`);
    
    // بعض المقالات
    const articles = await prisma.article.findMany({
      select: {
        title: true,
        author: {
          select: {
            name: true
          }
        },
        views: true
      },
      take: 3,
      orderBy: {
        created_at: 'desc'
      }
    });
    
    articles.forEach(a => {
      console.log(`   - "${a.title}" بواسطة ${a.author?.name || 'غير معروف'} (${a.views} مشاهدة)`);
    });
    
    // عد التصنيفات
    const categoryCount = await prisma.category.count();
    console.log(`\n✅ التصنيفات: ${categoryCount}`);
    
    // عد الأنشطة
    const activityCount = await prisma.activityLog.count();
    console.log(`✅ سجلات الأنشطة: ${activityCount}`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error(`\n❌ خطأ في الاتصال: ${error.message}`);
  }
}

async function main() {
  console.log('التحقق من قواعد البيانات في DigitalOcean...');
  
  for (const [name, url] of Object.entries(connections)) {
    await checkDatabase(name, url);
  }
}

main().catch(console.error); 