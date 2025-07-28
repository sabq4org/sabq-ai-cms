import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔧 محاولة إعادة تشغيل Prisma...');
    
    // قطع الاتصال أولاً
    await prisma.$disconnect();
    console.log('🔌 تم قطع الاتصال');
    
    // إعادة الاتصال
    await prisma.$connect();
    console.log('🔗 إعادة الاتصال...');
    
    // اختبار الاتصال
    const test = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ اختبار الاتصال نجح:', test);
    
    // اختبار جلب مقال واحد
    const article = await prisma.articles.findFirst({
      where: { status: 'published' }
    });
    
    return NextResponse.json({
      success: true,
      message: 'تم إصلاح اتصال قاعدة البيانات بنجاح',
      test: test,
      articleTest: article ? 'تم جلب مقال تجريبي' : 'لا توجد مقالات'
    });
    
  } catch (error) {
    console.error('❌ فشل إصلاح الاتصال:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إصلاح اتصال قاعدة البيانات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}
