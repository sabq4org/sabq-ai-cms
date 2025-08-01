import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🏷️ [Categories API] بدء جلب التصنيفات...');
    
    // جلب التصنيفات الأساسية أولاً (نفس الاستعلام الذي كان يعمل)
    const categories = await prisma.$queryRaw`
      SELECT id, name, slug, description, is_active
      FROM categories
      WHERE is_active = true
      ORDER BY display_order ASC, name ASC;
    `;

    // إضافة articles_count = 0 مؤقتاً لكل تصنيف حتى نُحسنه لاحقاً
    const categoriesWithCount = (categories as any[]).map(cat => ({
      ...cat,
      articles_count: 0,
      color: null,
      icon: null,
      cover_image: null
    }));

    console.log(`✅ [Categories API] تم جلب ${categoriesWithCount.length} تصنيف`);

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount
    });

  } catch (error) {
    console.error('❌ [Categories API] خطأ في جلب التصنيفات:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب التصنيفات' },
      { status: 500 }
    );
  }
}