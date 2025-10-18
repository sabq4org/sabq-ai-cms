import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import dbConnectionManager from '@/lib/db-connection-manager';
import { categoryCache } from '@/lib/category-cache';

// PUT & PATCH: تحديث التصنيف
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    console.log('📝 تحديث التصنيف:', id);
    console.log('📊 البيانات المستلمة:', {
      name: body.name?.substring(0, 50),
      has_icon_url: !!body.icon_url,
      icon_url_length: body.icon_url?.length,
      has_metadata: !!body.metadata,
      metadata_size: JSON.stringify(body.metadata)?.length,
    });
    
    // دعم كلا الصيغتين: name/slug أو name/icon_url
    const updateData: any = {
      updated_at: new Date()
    };

    // إضافة الحقول الموجودة فقط
    if (body.name) updateData.name = body.name;
    if (body.slug) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.color) updateData.color = body.color;
    
    // التعامل مع icon_url بشكل صحيح
    if (body.icon_url) {
      console.log('🖼️  تحديث صورة التصنيف - الطول:', body.icon_url.length);
      updateData.icon_url = body.icon_url;
      updateData.icon = body.icon_url; // نسخ إلى icon للتوافق
    } else if (body.icon) {
      console.log('🖼️  تحديث صورة التصنيف (icon field)');
      updateData.icon = body.icon;
      updateData.icon_url = body.icon;
    }
    
    if (body.display_order !== undefined) updateData.display_order = body.display_order;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    
    // معالجة metadata بحذر لتجنب تجاوز الحد الأقصى
    if (body.metadata) {
      const metadata = typeof body.metadata === 'string' 
        ? JSON.parse(body.metadata) 
        : body.metadata;
      
      // عدم تكرار icon_url داخل metadata إذا كان موجوداً بالفعل
      if (metadata.icon_url && body.icon_url && metadata.icon_url === body.icon_url) {
        // لا نحتاج لتخزين نفس URL مرتين
        delete metadata.icon_url;
      }
      
      updateData.metadata = Object.keys(metadata).length > 0 ? metadata : null;
    }

    console.log('✅ حجم البيانات المرسلة:', JSON.stringify(updateData).length, 'bytes');

    // تحديث التصنيف
    const updatedCategory = await dbConnectionManager.executeWithConnection(async () => {
      return await prisma.categories.update({
        where: { id },
        data: updateData
      });
    });

    console.log('✅ تم تحديث التصنيف بنجاح');
    
    // مسح كاش التصنيفات لضمان جلب البيانات المحدثة
    categoryCache.clear();

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'تم تحديث التصنيف بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في تحديث التصنيف:', error);
    
    // معالجة خاصة لأخطاء طول البيانات
    if (error.message?.includes('too long') || error.message?.includes('character')) {
      return NextResponse.json({
        success: false,
        error: 'خطأ في حفظ بيانات التصنيف',
        details: 'البيانات المرسلة تتجاوز الحد الأقصى. تأكد من أن صورة التصنيف ليست طويلة جداً.',
        field: 'icon_url'
      }, { status: 400 });
    }
    
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

// PATCH: تحديث التصنيف (نفس PUT)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
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
    
    // مسح كاش التصنيفات لضمان جلب البيانات المحدثة
    categoryCache.clear();

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