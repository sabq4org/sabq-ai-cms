import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - جلب كيان محدد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$connect();
    
    const { id } = params;
    
    const entity = await prisma.smartEntities.findUnique({
      where: { id },
      include: {
        entity_type: true,
        entity_links_source: {
          include: {
            target_entity: {
              include: { entity_type: true }
            }
          }
        },
        entity_links_target: {
          include: {
            source_entity: {
              include: { entity_type: true }
            }
          }
        },
        smart_links: {
          take: 10,
          orderBy: { created_at: 'desc' }
        },
        _count: {
          select: {
            smart_links: true,
            entity_links_source: true,
            entity_links_target: true
          }
        }
      }
    });

    if (!entity) {
      return NextResponse.json({
        success: false,
        error: 'الكيان غير موجود'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      entity
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الكيان:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الكيان',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - تحديث كيان
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$connect();
    
    const { id } = params;
    const body = await request.json();
    
    // التحقق من وجود الكيان
    const existingEntity = await prisma.smartEntities.findUnique({
      where: { id }
    });

    if (!existingEntity) {
      return NextResponse.json({
        success: false,
        error: 'الكيان غير موجود'
      }, { status: 404 });
    }

    // تحديث البيانات
    const updatedEntity = await prisma.smartEntities.update({
      where: { id },
      data: {
        ...body,
        // تأكد من أن درجة الأهمية في النطاق الصحيح
        importance_score: body.importance_score 
          ? Math.max(1, Math.min(10, body.importance_score))
          : undefined,
        // تحديث التواريخ إذا كانت موجودة
        birth_date: body.birth_date ? new Date(body.birth_date) : undefined,
        start_date: body.start_date ? new Date(body.start_date) : undefined,
        end_date: body.end_date ? new Date(body.end_date) : undefined
      },
      include: {
        entity_type: true
      }
    });

    console.log(`✅ تم تحديث الكيان: ${updatedEntity.name_ar} (${updatedEntity.id})`);

    return NextResponse.json({
      success: true,
      entity: updatedEntity,
      message: 'تم تحديث الكيان بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في تحديث الكيان:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث الكيان',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - حذف كيان
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$connect();
    
    const { id } = params;
    
    // التحقق من وجود الكيان
    const existingEntity = await prisma.smartEntities.findUnique({
      where: { id },
      select: { name_ar: true }
    });

    if (!existingEntity) {
      return NextResponse.json({
        success: false,
        error: 'الكيان غير موجود'
      }, { status: 404 });
    }

    // حذف الروابط المرتبطة أولاً
    await prisma.smartArticleLinks.deleteMany({
      where: { entity_id: id }
    });

    await prisma.entityLinks.deleteMany({
      where: {
        OR: [
          { source_entity_id: id },
          { target_entity_id: id }
        ]
      }
    });

    // حذف الكيان
    await prisma.smartEntities.delete({
      where: { id }
    });

    console.log(`✅ تم حذف الكيان: ${existingEntity.name_ar} (${id})`);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الكيان بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في حذف الكيان:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف الكيان',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}