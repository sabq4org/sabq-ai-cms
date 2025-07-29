import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // اختبار الاتصال بقاعدة البيانات
    const count = await prisma.categories.count();
    
    // محاولة جلب فئة واحدة للتأكد من عمل الاستعلامات
    const sampleCategory = await prisma.categories.findFirst();
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      categoriesCount: count,
      sampleCategory: sampleCategory ? {
        id: sampleCategory.id,
        name: sampleCategory.name,
        slug: sampleCategory.slug
      } : null,
      prismaVersion: (prisma as any)._engineConfig?.prismaVersion || 'unknown',
      nodeVersion: process.version,
      env: process.env.NODE_ENV
    });
  } catch (error: any) {
    console.error('Categories health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 