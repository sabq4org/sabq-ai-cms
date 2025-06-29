import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: تحديث فئة
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const categoryId = params.id;
    
    // التحقق من وجود الفئة
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'الفئة غير موجودة'
      }, { status: 404 });
    }
    
    // التحقق من عدم تكرار الـ slug إذا تم تغييره
    if (body.slug && body.slug !== existingCategory.slug) {
      const duplicateSlug = await prisma.category.findUnique({
        where: { slug: body.slug }
      });
      
      if (duplicateSlug) {
        return NextResponse.json({
          success: false,
          error: 'يوجد فئة أخرى بنفس المعرف (slug)'
        }, { status: 400 });
      }
    }
    
    // تحديث الفئة
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name || body.name_ar || existingCategory.name,
        nameEn: body.name_en !== undefined ? body.name_en : existingCategory.nameEn,
        slug: body.slug || existingCategory.slug,
        description: body.description !== undefined ? body.description : existingCategory.description,
        color: body.color || body.color_hex || existingCategory.color,
        icon: body.icon !== undefined ? body.icon : existingCategory.icon,
        parentId: body.parent_id !== undefined ? body.parent_id : existingCategory.parentId,
        displayOrder: body.order_index ?? body.position ?? existingCategory.displayOrder,
        isActive: body.is_active ?? existingCategory.isActive,
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    
    // التحقق من عدم وجود مقالات مرتبطة
    const articlesCount = await prisma.article.count({
      where: { categoryId }
    });
    
    if (articlesCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'لا يمكن حذف الفئة لوجود مقالات مرتبطة بها',
        articles_count: articlesCount
      }, { status: 400 });
    }
    
    // حذف الفئة
    await prisma.category.delete({
      where: { id: categoryId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الفئة بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في حذف الفئة:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف الفئة',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
} 