import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



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
    
    // جلب الفئات مع العلاقات
    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        displayOrder: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        displayOrder: true,
        isActive: true,
        parentId: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      name_ar: category.name, // للتوافق العكسي
      slug: category.slug,
      description: category.description,
      color: '#6B7280', // لون افتراضي
      color_hex: '#6B7280', // للتوافق العكسي
      icon: '📁', // أيقونة افتراضية
      parent_id: category.parentId,
      parent: category.parent,
      children: [], // يمكن جلبها بطلب منفصل
      articles_count: category._count.articles,
      children_count: 0, // يمكن حسابها بطلب منفصل
      order_index: category.displayOrder,
      is_active: category.isActive,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString()
    }));
    
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
    
    // التحقق من البيانات المطلوبة
    if (!body.name || !body.slug) {
      return NextResponse.json({
        success: false,
        error: 'الاسم والمعرف (slug) مطلوبان'
      }, { status: 400 });
    }
    
    // التحقق من عدم تكرار الـ slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug: body.slug }
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
        name: body.name,
        slug: body.slug,
        description: body.description,
        parentId: body.parent_id,
        displayOrder: body.order_index || 0,
        isActive: body.is_active !== false
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
        name: body.name || existingCategory.name,
        description: body.description,
        parentId: body.parent_id,
        displayOrder: body.order_index ?? existingCategory.displayOrder,
        isActive: body.is_active ?? existingCategory.isActive
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