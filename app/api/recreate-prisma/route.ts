import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔧 بدء إعادة إنشاء Prisma Client...');
    
    // حذف Prisma Client الموجود
    if (global.prisma) {
      await global.prisma.$disconnect();
      delete global.prisma;
      console.log('🗑️ تم حذف Prisma Client القديم');
    }
    
    // التحقق من متغير البيئة
    const dbUrl = process.env.DATABASE_URL;
    console.log('🔗 DATABASE_URL:', dbUrl ? 'موجود' : 'مفقود');
    
    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL غير محدد',
        env: process.env.NODE_ENV
      }, { status: 500 });
    }
    
    // إنشاء client جديد
    const { PrismaClient } = await import('@/lib/generated/prisma');
    const newPrisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
    
    console.log('🔨 تم إنشاء Prisma Client جديد');
    
    // محاولة الاتصال
    await newPrisma.$connect();
    console.log('🔌 تم الاتصال بنجاح');
    
    // اختبار قاعدة البيانات
    const testQuery = await newPrisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('⏰ اختبار الوقت:', testQuery);
    
    // اختبار المقالات
    const articleCount = await newPrisma.articles.count();
    console.log('📄 عدد المقالات:', articleCount);
    
    // تحديث المتغير العام
    global.prisma = newPrisma;
    
    return NextResponse.json({
      success: true,
      message: 'تم إعادة إنشاء Prisma Client بنجاح',
      test: {
        time: testQuery,
        articleCount: articleCount,
        env: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('❌ فشل إعادة إنشاء Prisma Client:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إعادة إنشاء Prisma Client',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
