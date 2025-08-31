import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // اختبار بسيط للاتصال
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    
    // عد الجداول الموجودة
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    // عد المقالات المنشورة
    let articlesCount = 0;
    try {
      articlesCount = await prisma.articles.count({
        where: { status: 'published' }
      });
    } catch (e) {
      console.log('جدول المقالات غير موجود بعد');
    }
    
    return NextResponse.json({
      success: true,
      message: 'اتصال قاعدة البيانات ناجح',
      data: {
        database: result[0],
        tables: tableCount[0],
        publishedArticles: articlesCount
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT || '3000',
        DATABASE_URL: process.env.DATABASE_URL ? 'متصل' : 'مفقود',
        REDIS_URL: process.env.REDIS_URL ? 'متصل' : 'غير مطلوب',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'موجود' : 'مفقود'
      }
    });
  } catch (error: any) {
    console.error('فشل اختبار قاعدة البيانات:', error);
    
    return NextResponse.json({
      success: false,
      message: 'فشل اتصال قاعدة البيانات',
      error: error.message,
      code: error.code,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT || '3000',
        DATABASE_URL: process.env.DATABASE_URL ? 'موجود لكن فشل الاتصال' : 'مفقود'
      }
    }, { status: 500 });
  }
}