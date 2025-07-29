import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dbConnectionManager from '@/lib/db-connection-manager';
import { categoryCache } from '@/lib/category-cache';

export async function GET(request: NextRequest) {
  console.log('📋 بدء جلب التصنيفات...');
  
  // التحقق من طلب تجاوز الكاش
  const searchParams = request.nextUrl.searchParams;
  const skipCache = searchParams.has('t') || searchParams.has('nocache');
  
  // التحقق من الكاش أولاً (إلا إذا طُلب تجاوزه)
  if (!skipCache && categoryCache.isValid()) {
    console.log('✅ إرجاع التصنيفات من الـ cache');
    console.log(`✅ تم جلب ${categoryCache.data.categories.length} تصنيف من الـ cache`);
    
    return NextResponse.json(categoryCache.data, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  }

  try {
    console.log('🔄 جلب التصنيفات من قاعدة البيانات...');
    
    const categories = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.categories.findMany({
        orderBy: {
          display_order: 'asc'
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          icon: true,
          is_active: true,
          display_order: true,
          parent_id: true,
          metadata: true, // إضافة حقل metadata لجلب الصور
          _count: {
            select: {
              articles: {
                where: {
                  status: 'published'
                }
              }
            }
          }
        }
      });
    });

    // معالجة البيانات
    const processedCategories = categories
      .filter(cat => cat.is_active)
      .map(cat => ({
        ...cat,
        articles_count: cat._count.articles,
        _count: undefined
      }));

    const response = {
      success: true,
      categories: processedCategories,
      total: processedCategories.length
    };

    // حفظ في الكاش
    categoryCache.set(response);
    
    console.log(`✅ تم جلب ${processedCategories.length} تصنيف مع عدد المقالات وتحديث الـ cache`);
    console.log(`✅ تم جلب ${processedCategories.length} تصنيف من قاعدة البيانات`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب التصنيفات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب التصنيفات',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}
