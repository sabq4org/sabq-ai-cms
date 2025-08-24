/*
  تصفير جميع اللايكات والمحفوظات ونقاط الولاء.
  - يحذف كل سجلات interactions
  - يحذف كل سجلات loyalty_points
  - يصفّر likes/saves في articles و opinion_articles
  - يصفّر users.loyalty_points

  التشغيل:
    node scripts/reset-interactions-and-loyalty.js
*/

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('🚨 بدء عملية التصفير الشاملة...\n');

    const [interactionsBefore, loyaltyBefore, articlesBefore, opinionBefore, usersBefore] = await Promise.all([
      prisma.interactions.count(),
      prisma.loyalty_points.count(),
      prisma.articles.aggregate({ _sum: { likes: true, saves: true } }),
      prisma.opinion_articles.aggregate({ _sum: { likes: true, saves: true } }).catch(() => ({ _sum: { likes: 0, saves: 0 } })),
      prisma.users.aggregate({ _sum: { loyalty_points: true } })
    ]);

    console.log('📊 قبل التصفير:');
    console.log('   interactions:', interactionsBefore);
    console.log('   loyalty_points:', loyaltyBefore);
    console.log('   articles likes/saves:', articlesBefore._sum);
    console.log('   opinion_articles likes/saves:', opinionBefore._sum);
    console.log('   users.loyalty_points sum:', usersBefore._sum.loyalty_points || 0);

    await prisma.$transaction([
      prisma.interactions.deleteMany({}),
      prisma.loyalty_points.deleteMany({}),
      prisma.articles.updateMany({ data: { likes: 0, saves: 0 } }),
      prisma.opinion_articles.updateMany({ data: { likes: 0, saves: 0 } }),
      prisma.users.updateMany({ data: { loyalty_points: 0 } })
    ]);

    const [interactionsAfter, loyaltyAfter, articlesAfter, opinionAfter, usersAfter] = await Promise.all([
      prisma.interactions.count(),
      prisma.loyalty_points.count(),
      prisma.articles.aggregate({ _sum: { likes: true, saves: true } }),
      prisma.opinion_articles.aggregate({ _sum: { likes: true, saves: true } }).catch(() => ({ _sum: { likes: 0, saves: 0 } })),
      prisma.users.aggregate({ _sum: { loyalty_points: true } })
    ]);

    console.log('\n✅ بعد التصفير:');
    console.log('   interactions:', interactionsAfter);
    console.log('   loyalty_points:', loyaltyAfter);
    console.log('   articles likes/saves:', articlesAfter._sum);
    console.log('   opinion_articles likes/saves:', opinionAfter._sum);
    console.log('   users.loyalty_points sum:', usersAfter._sum.loyalty_points || 0);

    console.log('\n🎉 تم التصفير بنجاح.');
  } catch (err) {
    console.error('❌ خطأ أثناء التصفير:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();


