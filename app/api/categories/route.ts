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

    // إضافة عدد المقالات لكل تصنيف
    const categoriesWithCount = await Promise.all(
      (categories as any[]).map(async (cat, index) => {
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
        
        // حساب عدد المقالات المنشورة لهذا التصنيف
        let articlesCount = 0;
        try {
          const countResult = await prisma.$queryRaw`
            SELECT COUNT(*) as count
            FROM articles 
            WHERE category_id = ${cat.id} 
              AND status = 'published';
          `;
          articlesCount = Number((countResult as any[])[0]?.count) || 0;
        } catch (err) {
          console.warn(`تعذر جلب عدد المقالات للتصنيف ${cat.name}:`, err);
          articlesCount = 0;
        }
        
        return {
          ...cat,
          articles_count: articlesCount,
          color: metadata.color_hex || cat.color || defaultColors[index % defaultColors.length],
          icon: metadata.icon || cat.icon || defaultIcons[index % defaultIcons.length],
          cover_image: metadata.cover_image || null,
          name_ar: metadata.name_ar || cat.name,
          name_en: metadata.name_en || null
        };
      })
    );

    console.log(`✅ [Categories API] تم جلب ${categoriesWithCount.length} تصنيف`);
    
    // عرض إحصائيات مفصلة
    const totalArticles = categoriesWithCount.reduce((total, cat) => total + cat.articles_count, 0);
    console.log(`📊 [Categories API] إجمالي المقالات المنشورة: ${totalArticles}`);
    console.log('📋 [Categories API] عدد المقالات لكل تصنيف:');
    categoriesWithCount.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.articles_count} مقال`);
    });

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