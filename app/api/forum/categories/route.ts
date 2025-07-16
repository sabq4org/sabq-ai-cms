import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: جلب قائمة الفئات
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('include_inactive') === 'true';

    const whereClause = includeInactive ? '' : 'WHERE is_active = true';

    const categories = await prisma.$queryRawUnsafe(`
      SELECT 
        id,
        name_ar,
        name_en,
        slug,
        description,
        color,
        icon,
        display_order,
        is_active,
        created_at,
        (SELECT COUNT(*) FROM forum_topics WHERE category_id = c.id AND status = 'active') as topics_count
      FROM forum_categories c
      ${whereClause}
      ORDER BY display_order ASC, name_ar ASC
    `);

    return NextResponse.json({
      categories: (categories as any[]).map(cat => ({
        id: cat.id,
        name: cat.name_ar,
        nameEn: cat.name_en,
        slug: cat.slug,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        displayOrder: cat.display_order,
        isActive: Boolean(cat.is_active),
        createdAt: cat.created_at,
        topicsCount: Number(cat.topics_count)
      }))
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الفئات' },
      { status: 500 }
    );
  }
}

// POST: إنشاء فئة جديدة (للإدارة فقط)
export async function POST(request: NextRequest) {
  try {
    // TODO: إضافة التحقق من صلاحيات الإدارة
    const body = await request.json();
    const { name_ar, name_en, slug, description, color, icon } = body;

    if (!name_ar || !slug) {
      return NextResponse.json(
        { error: 'الاسم والرابط مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود فئة بنفس الرابط
    const existingCategory = await prisma.$queryRawUnsafe(`
      SELECT id FROM forum_categories WHERE slug = ?
    `, slug);

    if ((existingCategory as any[]).length > 0) {
      return NextResponse.json(
        { error: 'يوجد فئة بنفس الرابط' },
        { status: 400 }
      );
    }

    const categoryId = crypto.randomUUID();
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO forum_categories (id, name_ar, name_en, slug, description, color, icon, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, true)
    `, categoryId, name_ar, name_en || name_ar, slug, description, color || '#3B82F6', icon || 'MessageCircle');

    return NextResponse.json({
      id: categoryId,
      message: 'تم إنشاء الفئة بنجاح'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الفئة' },
      { status: 500 }
    );
  }
}

// PUT: تحديث فئة (للإدارة فقط)
export async function PUT(request: NextRequest) {
  try {
    // TODO: إضافة التحقق من صلاحيات الإدارة
    const body = await request.json();
    const { id, name_ar, name_en, slug, description, color, icon, is_active, display_order } = body;

    if (!id || !name_ar || !slug) {
      return NextResponse.json(
        { error: 'المعرف والاسم والرابط مطلوبان' },
        { status: 400 }
      );
    }

    await prisma.$executeRawUnsafe(`
      UPDATE forum_categories 
      SET name_ar = ?, name_en = ?, slug = ?, description = ?, color = ?, icon = ?, is_active = ?, display_order = ?
      WHERE id = ?
    `, name_ar, name_en || name_ar, slug, description, color, icon, is_active, display_order, id);

    return NextResponse.json({
      message: 'تم تحديث الفئة بنجاح'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الفئة' },
      { status: 500 }
    );
  }
}

// DELETE: حذف فئة (للإدارة فقط)
export async function DELETE(request: NextRequest) {
  try {
    // TODO: إضافة التحقق من صلاحيات الإدارة
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الفئة مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود مواضيع في الفئة
    const topicsInCategory = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM forum_topics WHERE category_id = ?
    `, id);

    if (Number((topicsInCategory as any)[0]?.count) > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف فئة تحتوي على مواضيع' },
        { status: 400 }
      );
    }

    await prisma.$executeRawUnsafe(`
      DELETE FROM forum_categories WHERE id = ?
    `, id);

    return NextResponse.json({
      message: 'تم حذف الفئة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الفئة' },
      { status: 500 }
    );
  }
} 