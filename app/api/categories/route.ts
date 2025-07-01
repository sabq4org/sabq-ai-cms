import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// ===============================
// وظائف مساعدة
// ===============================

// توليد slug من الاسم
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ===============================
// معالجات API
// ===============================

// GET: جلب جميع الفئات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // بناء شروط البحث
    const where: any = {};
    
    // فلترة الفئات النشطة فقط
    const activeOnly = searchParams.get('active') !== 'false';
    if (activeOnly) {
      where.isActive = true;
    }
    
    // فلترة حسب الفئة الأم
    const parentId = searchParams.get('parent_id');
    if (parentId === 'null') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }
    
    // جلب الفئات
    let categories = await prisma.category.findMany({
      where,
      orderBy: {
        displayOrder: 'asc'
      }
    });
    
    // حساب عدد المقالات لكل تصنيف
    const categoryIds = categories.map(c => c.id);
    const articleCounts = await prisma.article.groupBy({
      by: ['categoryId'],
      where: {
        categoryId: { in: categoryIds }
      },
      _count: {
        id: true
      }
    });
    
    // إنشاء خريطة لعدد المقالات
    const articleCountMap = new Map(
      articleCounts.map(item => [item.categoryId, item._count.id])
    );
    
    // جلب التصنيفات الأب إن وجدت
    const parentIds = [...new Set(categories.map(c => c.parentId).filter(Boolean))] as string[];
    const parents = parentIds.length > 0 ? await prisma.category.findMany({
      where: { id: { in: parentIds } },
      select: { id: true, name: true, slug: true }
    }) : [];
    
    const parentsMap = new Map(parents.map(p => [p.id, p]));

    // إذا لم تكن هناك تصنيفات، أنشئ تصنيفاً افتراضياً
    if (categories.length === 0) {
      const defaultCategory = await prisma.category.create({
        data: {
          name: 'عام',
          nameEn: 'General',
          slug: 'general',
          description: 'التصنيف الافتراضي',
          color: '#6B7280',
          icon: '📄',
          isActive: true,
          displayOrder: 0
        }
      });

      categories = [defaultCategory];
    }
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedCategories = categories.map(category => {
      const parent = category.parentId ? parentsMap.get(category.parentId) : null;
      const articleCount = articleCountMap.get(category.id) || 0;
      
      return {
        id: category.id,
        name: category.name,
        name_ar: category.name, // للتوافق العكسي
        name_en: category.nameEn,
        slug: category.slug,
        description: category.description,
        color: category.color || '#6B7280', // لون افتراضي
        color_hex: category.color || '#6B7280', // للتوافق العكسي
        icon: category.icon || '📁', // أيقونة افتراضية
        parent_id: category.parentId,
        parent: parent,
        children: [], // يمكن جلبها بطلب منفصل
        articles_count: articleCount,
        children_count: 0, // يمكن حسابها بطلب منفصل
        order_index: category.displayOrder,
        is_active: category.isActive,
        created_at: category.createdAt.toISOString(),
        updated_at: category.updatedAt.toISOString(),
        metadata: category.metadata
      };
    });
    
    return NextResponse.json({
      success: true,
      categories: formattedCategories,
      total: formattedCategories.length
    });
    
  } catch (error) {
    console.error('خطأ في جلب الفئات:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الفئات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// POST: إنشاء فئة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة - قبول name أو name_ar
    const categoryName = body.name || body.name_ar;
    const categorySlug = body.slug;
    
    if (!categoryName || !categorySlug) {
      return NextResponse.json({
        success: false,
        error: 'الاسم والمعرف (slug) مطلوبان'
      }, { status: 400 });
    }
    
    // التحقق من عدم تكرار الـ slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categorySlug }
    });
    
    if (existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'يوجد فئة أخرى بنفس المعرف (slug)'
      }, { status: 400 });
    }
    
    // إنشاء الفئة الجديدة
    const newCategory = await prisma.category.create({
      data: {
        name: categoryName,
        nameEn: body.name_en,
        slug: categorySlug,
        description: body.description,
        color: body.color || body.color_hex || '#6B7280',
        icon: body.icon || '📁',
        parentId: body.parent_id,
        displayOrder: body.order_index || body.position || 0,
        isActive: body.is_active !== false,
        metadata: {
          meta_title: body.meta_title,
          meta_description: body.meta_description,
          og_image_url: body.og_image_url,
          canonical_url: body.canonical_url,
          noindex: body.noindex,
          og_type: body.og_type || 'website'
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'تم إنشاء الفئة بنجاح'
    }, { status: 201 });
    
  } catch (error) {
    console.error('خطأ في إنشاء الفئة:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء الفئة',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// PUT: تحديث فئة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'معرف الفئة مطلوب'
      }, { status: 400 });
    }
    
    // التحقق من وجود الفئة
    const existingCategory = await prisma.category.findUnique({
      where: { id: body.id }
    });
    
    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'الفئة غير موجودة'
      }, { status: 404 });
    }
    
    // تحديث الفئة
    const updatedCategory = await prisma.category.update({
      where: { id: body.id },
      data: {
        name: body.name || body.name_ar || existingCategory.name,
        nameEn: body.name_en !== undefined ? body.name_en : existingCategory.nameEn,
        description: body.description !== undefined ? body.description : existingCategory.description,
        color: body.color || body.color_hex || existingCategory.color,
        icon: body.icon !== undefined ? body.icon : existingCategory.icon,
        parentId: body.parent_id !== undefined ? body.parent_id : existingCategory.parentId,
        displayOrder: body.order_index ?? body.position ?? existingCategory.displayOrder,
        isActive: body.is_active ?? existingCategory.isActive,
        metadata: body.metadata !== undefined ? body.metadata : existingCategory.metadata
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'تم تحديث الفئة بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في تحديث الفئة:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث الفئة',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// DELETE: حذف فئة
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids || [];
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'معرفات الفئات مطلوبة'
      }, { status: 400 });
    }
    
    // التحقق من عدم وجود مقالات مرتبطة
    const articlesCount = await prisma.article.count({
      where: {
        categoryId: { in: ids }
      }
    });
    
    if (articlesCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'لا يمكن حذف الفئات لوجود مقالات مرتبطة بها',
        articles_count: articlesCount
      }, { status: 400 });
    }
    
    // حذف الفئات
    const result = await prisma.category.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    
    return NextResponse.json({
      success: true,
      affected: result.count,
      message: `تم حذف ${result.count} فئة/فئات بنجاح`
    });
    
  } catch (error) {
    console.error('خطأ في حذف الفئات:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف الفئات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 