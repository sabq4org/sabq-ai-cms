import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔧 بدء تحديث slugs التصنيفات...');

    const updates = [
      { name: 'محليات', slug: 'local' },
      { name: 'العالم', slug: 'world' },
      { name: 'حياتنا', slug: 'lifestyle' },
      { name: 'محطات', slug: 'stations' },
      { name: 'رياضة', slug: 'sports' },
      { name: 'سياحة', slug: 'tourism' },
      { name: 'أعمال', slug: 'business' },
      { name: 'تقنية', slug: 'technology' },
      { name: 'سيارات', slug: 'cars' },
      { name: 'ميديا', slug: 'media' }
    ];

    let updatedCount = 0;

    // استخدام transaction للتأكد من حفظ التغييرات
    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        try {
          // العثور على التصنيف أولاً
          const category = await tx.categories.findFirst({
            where: { name: update.name }
          });

          if (category) {
            await tx.categories.update({
              where: { id: category.id },
              data: { slug: update.slug }
            });
            console.log(`✅ تم تحديث slug للتصنيف "${update.name}" → "${update.slug}"`);
            updatedCount++;
          } else {
            console.log(`⚠️ لم يتم العثور على التصنيف "${update.name}"`);
          }
        } catch (error) {
          console.error(`❌ خطأ في تحديث "${update.name}":`, error);
          throw error; // رمي الخطأ لإلغاء Transaction
        }
      }
    });

    console.log(`🎉 تم تحديث ${updatedCount} تصنيف بنجاح`);

    return NextResponse.json({
      success: true,
      message: `تم تحديث ${updatedCount} تصنيف بنجاح`,
      updatedCount
    });

  } catch (error) {
    console.error('❌ خطأ عام في تحديث slugs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'فشل في تحديث slugs',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}