import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - جلب جميع أنواع الكيانات
export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    console.log('🏷️ جلب أنواع الكيانات...');

    const types = await prisma.smartEntityTypes.findMany({
      where: { is_active: true },
      include: {
        _count: {
          select: {
            entities: {
              where: { is_active: true }
            }
          }
        }
      },
      orderBy: [
        { name_ar: 'asc' }
      ]
    });

    console.log(`✅ تم جلب ${types.length} نوع كيان`);

    return NextResponse.json({
      success: true,
      types,
      total: types.length
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب أنواع الكيانات:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب أنواع الكيانات',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - إضافة نوع كيان جديد
export async function POST(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const body = await request.json();
    const {
      id,
      name,
      name_ar,
      icon,
      color,
      description,
      is_active = true
    } = body;

    // التحقق من البيانات المطلوبة
    if (!id || !name || !name_ar || !icon || !color) {
      return NextResponse.json({
        success: false,
        error: 'البيانات المطلوبة مفقودة (id, name, name_ar, icon, color)'
      }, { status: 400 });
    }

    // إنشاء نوع الكيان الجديد
    const newType = await prisma.smartEntityTypes.create({
      data: {
        id,
        name,
        name_ar,
        icon,
        color,
        description,
        is_active
      }
    });

    console.log(`✅ تم إنشاء نوع كيان جديد: ${newType.name_ar} (${newType.id})`);

    return NextResponse.json({
      success: true,
      type: newType,
      message: 'تم إنشاء نوع الكيان بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في إنشاء نوع الكيان:', error);
    
    // التعامل مع خطأ التكرار
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'يوجد نوع كيان بنفس المعرف أو الاسم'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء نوع الكيان',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}