import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dbConnectionManager from '@/lib/db-connection-manager';

// PUT: تحديث التصنيف
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    console.log('📝 تحديث التصنيف:', id);
    
    // التحقق من البيانات المطلوبة
    if (!body.name || !body.slug) {
      return NextResponse.json({
        success: false,
        error: 'الاسم والرابط مطلوبان'
      }, { status: 400 });
    }

    // تحديث التصنيف
    const updatedCategory = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.categories.update({
        where: { id },
        data: {
          name: body.name,
          slug: body.slug,
          description: body.description,
          color: body.color,
          icon: body.icon,
          display_order: body.display_order,
          is_active: body.is_active,
          metadata: body.metadata || {},
          updated_at: new Date()
        }
      });
    });

    console.log('✅ تم تحديث التصنيف بنجاح');

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'تم تحديث التصنيف بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في تحديث التصنيف:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث التصنيف',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// GET: جلب تصنيف واحد
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log('🔍 جلب التصنيف:', id);
    
    const category = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.categories.findUnique({
        where: { id },
        include: {
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

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'التصنيف غير موجود'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        articles_count: category._count.articles
      }
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب التصنيف:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب التصنيف',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// DELETE: حذف التصنيف
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log('🗑️ حذف التصنيف:', id);
    
    // التحقق من عدم وجود مقالات مرتبطة
    const articlesCount = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.articles.count({
        where: { category_id: id }
      });
    });

    if (articlesCount > 0) {
      return NextResponse.json({
        success: false,
        error: `لا يمكن حذف التصنيف لوجود ${articlesCount} مقال مرتبط به`
      }, { status: 400 });
    }

    // حذف التصنيف
    await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.categories.delete({
        where: { id }
      });
    });

    console.log('✅ تم حذف التصنيف بنجاح');

    return NextResponse.json({
      success: true,
      message: 'تم حذف التصنيف بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في حذف التصنيف:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف التصنيف',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  }
} 