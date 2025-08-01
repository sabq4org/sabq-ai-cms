import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🏷️ [Categories API] بدء جلب التصنيفات...');
    
    // جلب التصنيفات مع جميع الحقول المتاحة
    const categories = await prisma.$queryRaw`
      SELECT id, name, slug, description, is_active, color, icon, metadata
      FROM categories
      WHERE is_active = true
      ORDER BY display_order ASC, name ASC;
    `;

    // إضافة بيانات افتراضية للتصنيفات
    const categoriesWithCount = (categories as any[]).map((cat, index) => {
      // ألوان افتراضية للتصنيفات
      const defaultColors = [
        '#1e40af', '#dc2626', '#059669', '#7c3aed', '#ea580c',
        '#0891b2', '#be185d', '#4338ca', '#16a34a', '#ca8a04'
      ];
      
      // أيقونات افتراضية للتصنيفات
      const defaultIcons = [
        '🌍', '🏠', '💖', '🚉', '⚽', '✈️', '💼', '💻', '🚗', '📺'
      ];
      
      // استخراج البيانات من metadata إذا كانت موجودة
      const metadata = cat.metadata || {};
      
      return {
        ...cat,
        articles_count: 0, // سيتم تحديثه لاحقاً
        color: metadata.color_hex || cat.color || defaultColors[index % defaultColors.length],
        icon: metadata.icon || cat.icon || defaultIcons[index % defaultIcons.length],
        cover_image: metadata.cover_image || null,
        name_ar: metadata.name_ar || cat.name, // إضافة الاسم العربي
        name_en: metadata.name_en || null
      };
    });

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